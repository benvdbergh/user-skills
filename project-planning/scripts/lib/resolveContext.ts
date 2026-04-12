import { existsSync } from "fs";
import { join, resolve } from "path";
import {
  defaultManifest,
  legacyManifest,
  loadManifestFromFile,
  MANIFEST_FILENAME,
  mergeManifest,
} from "./loadManifest";
import type { PlanningContext, PlanningManifest } from "./types";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || `${process.env.HOME || process.env.USERPROFILE || "."}/Knowledge`;

export type ResolveOptions = {
  root?: string;
  config?: string;
  project?: string;
};

/**
 * Resolution order:
 * 1. --config → manifest at that path; projectRoot = dirname(config)
 * 2. --root → projectRoot; manifest = join(root, MANIFEST_FILENAME) if present, else defaults
 * 3. PROJECT_PLANNING_CONFIG env → same as --config
 * 4. --project only → legacy join(KNOWLEDGE_DIR, "Projects", project); synthetic manifest
 * 5. process.cwd() + MANIFEST_FILENAME if present
 * 6. else cwd with default manifest
 */
export function resolvePlanningContext(opts: ResolveOptions): PlanningContext {
  const envConfig = process.env.PROJECT_PLANNING_CONFIG;

  if (opts.config || envConfig) {
    const configPath = resolve((opts.config || envConfig) as string);
    const manifest = loadManifestFromFile(configPath);
    return {
      projectRoot: resolve(configPath, ".."),
      manifest,
      manifestPath: existsSync(configPath) ? configPath : null,
    };
  }

  if (opts.root) {
    const projectRoot = resolve(opts.root);
    const manifestPath = join(projectRoot, MANIFEST_FILENAME);
    const manifest = existsSync(manifestPath)
      ? loadManifestFromFile(manifestPath)
      : defaultManifest();
    return {
      projectRoot,
      manifest,
      manifestPath: existsSync(manifestPath) ? manifestPath : null,
    };
  }

  if (opts.project) {
    const projectRoot = join(KNOWLEDGE_DIR, "Projects", opts.project);
    return {
      projectRoot: resolve(projectRoot),
      manifest: mergeManifest(legacyManifest()),
      manifestPath: null,
      legacyProjectName: opts.project,
    };
  }

  const cwd = process.cwd();
  const manifestPath = join(cwd, MANIFEST_FILENAME);
  if (existsSync(manifestPath)) {
    return {
      projectRoot: cwd,
      manifest: loadManifestFromFile(manifestPath),
      manifestPath,
    };
  }

  return {
    projectRoot: cwd,
    manifest: defaultManifest(),
    manifestPath: null,
  };
}

export function writeManifestExample(): PlanningManifest {
  return defaultManifest();
}
