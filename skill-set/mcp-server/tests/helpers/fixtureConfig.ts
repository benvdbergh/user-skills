import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig, type SkillLabConfig } from "../../src/config/loadConfig.js";

export const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

export function writeSkillLabConfig(
  pkg: string,
  options?: { writesEnabled?: boolean; skillsRoot?: string },
): void {
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot: options?.skillsRoot ?? FIXTURE_ROOT,
      writesEnabled: options?.writesEnabled ?? false,
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
      relationshipMapRelativePath:
        "skill-set/maps/skill-relationships.json",
    }),
  );
}

export function loadFixtureConfig(
  options?: { writesEnabled?: boolean; skillsRoot?: string },
): { pkg: string; config: SkillLabConfig } {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-fixture-"));
  writeSkillLabConfig(pkg, options);
  return { pkg, config: loadConfig(pkg) };
}
