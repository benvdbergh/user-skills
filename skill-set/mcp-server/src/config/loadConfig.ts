import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { assertPathUnderRoots } from "./pathGuard.js";
import { resolvePathInfo, toPosixPath } from "./pathModel.js";
import type { Environment } from "../domain/types.js";

const ConfigFileSchema = z.object({
  skillsRoot: z.string().optional(),
  skillSetRelativePath: z.string().default("skill-set"),
  environmentMapRelativePath: z
    .string()
    .default("skill-set/catalog/environment-skill-index-map.json"),
  writesEnabled: z.boolean().default(false),
  environmentOverrides: z
    .record(
      z.object({
        path: z.string().optional(),
        skillIndexPath: z.string().optional(),
        inventoryPath: z.string().optional(),
      }),
    )
    .optional(),
});

export type SkillLabConfig = z.infer<typeof ConfigFileSchema> & {
  packageRoot: string;
  skillsRoot: string;
  skillSetRoot: string;
  environmentMapPath: string;
  allowedRoots: string[];
};

const ENV_MAP_SCHEMA = z.object({
  version: z.number().optional(),
  environments: z.array(
    z.object({
      id: z.string(),
      scope: z.string(),
      path: z.string(),
      skill_index_path: z.string(),
      display_name: z.string().optional(),
      inventory_path: z.string().optional(),
    }),
  ),
});

function defaultPackageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
}

function defaultSkillsRoot(packageRoot: string): string {
  const env = process.env.SKILL_LAB_SKILLS_ROOT?.trim();
  if (env) return path.resolve(env);
  return path.resolve(packageRoot, "../..");
}

function findConfigPath(packageRoot: string): string | null {
  const candidates = [
    path.join(packageRoot, "skill-lab.config.json"),
    path.join(packageRoot, "skill-lab.config.local.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

export function loadConfig(packageRoot = defaultPackageRoot()): SkillLabConfig {
  const configPath = findConfigPath(packageRoot);
  const raw = configPath
    ? (JSON.parse(fs.readFileSync(configPath, "utf8")) as unknown)
    : {};
  const parsed = ConfigFileSchema.parse(raw);
  const skillsRoot = path.resolve(
    parsed.skillsRoot ?? defaultSkillsRoot(packageRoot),
  );
  const skillSetRoot = path.resolve(
    skillsRoot,
    parsed.skillSetRelativePath,
  );
  const environmentMapPath = path.resolve(
    skillsRoot,
    parsed.environmentMapRelativePath,
  );
  let allowedRoots = [skillsRoot, skillSetRoot];
  if (fs.existsSync(environmentMapPath)) {
    allowedRoots = extendAllowedRootsFromEnvironmentMap(
      environmentMapPath,
      skillsRoot,
      allowedRoots,
    );
  }

  assertPathUnderRoots(environmentMapPath, allowedRoots);

  return {
    ...parsed,
    packageRoot,
    skillsRoot,
    skillSetRoot,
    environmentMapPath,
    allowedRoots,
  };
}

function extendAllowedRootsFromEnvironmentMap(
  environmentMapPath: string,
  skillsRoot: string,
  initial: string[],
): string[] {
  const roots = new Set(initial.map((r) => path.resolve(r)));
  const data = ENV_MAP_SCHEMA.parse(
    JSON.parse(fs.readFileSync(environmentMapPath, "utf8")),
  );
  for (const env of data.environments) {
    for (const p of [env.path, env.skill_index_path, env.inventory_path]) {
      if (!p) continue;
      const resolved = path.isAbsolute(p)
        ? path.resolve(p)
        : path.resolve(skillsRoot, p);
      let dir = fs.existsSync(resolved) && !resolved.endsWith(".json")
        ? resolved
        : path.dirname(resolved);
      for (let i = 0; i < 6; i++) {
        roots.add(dir);
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
    }
  }
  return [...roots];
}

export function loadEnvironments(config: SkillLabConfig): Environment[] {
  if (!fs.existsSync(config.environmentMapPath)) {
    return [
      {
        id: "user",
        scope: "user",
        path: config.skillsRoot,
        skillIndexPath: path.join(config.skillsRoot, "skill-index.json"),
        displayName: "User-level (default)",
        pathResolvable: true,
        warnings: [
          `Missing environment map at ${toPosixPath(config.environmentMapPath)}; using skillsRoot only.`,
        ],
      },
    ];
  }

  const data = ENV_MAP_SCHEMA.parse(
    JSON.parse(fs.readFileSync(config.environmentMapPath, "utf8")),
  );

  const resolveCatalogPath = (p: string) =>
    path.isAbsolute(p) ? p : path.join(config.skillsRoot, p);

  return data.environments.map((env) => {
    const override = config.environmentOverrides?.[env.id];
    const envPath = resolveCatalogPath(override?.path ?? env.path);
    const skillIndexPath = resolveCatalogPath(
      override?.skillIndexPath ?? env.skill_index_path,
    );
    const inventoryPath = (override?.inventoryPath ?? env.inventory_path)
      ? resolveCatalogPath(
          (override?.inventoryPath ?? env.inventory_path) as string,
        )
      : undefined;

    const pathInfo = resolvePathInfo(envPath);
    const indexInfo = resolvePathInfo(skillIndexPath);
    const warnings: string[] = [];

    if (!pathInfo.resolvable) {
      warnings.push(`Environment path is not resolvable: ${envPath}`);
    }
    if (!indexInfo.resolvable) {
      warnings.push(`Skill index path is not resolvable: ${skillIndexPath}`);
    }

    let inventoryResolvable: boolean | undefined;
    if (inventoryPath) {
      const inv = resolvePathInfo(inventoryPath);
      inventoryResolvable = inv.resolvable;
      if (!inv.resolvable) {
        warnings.push(`Project inventory missing or unreachable: ${inventoryPath}`);
      }
    }

    return {
      id: env.id,
      scope: env.scope,
      path: toPosixPath(envPath),
      skillIndexPath: toPosixPath(skillIndexPath),
      displayName: env.display_name,
      inventoryPath: inventoryPath ? toPosixPath(inventoryPath) : undefined,
      pathResolvable: pathInfo.resolvable && indexInfo.resolvable,
      warnings: warnings.length ? warnings : undefined,
    };
  });
}
