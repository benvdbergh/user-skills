import fs from "node:fs";
import path from "node:path";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import { parseSkillMd } from "../domain/SkillMdParser.js";
import type { ParsedSkillMd } from "../domain/SkillMdParser.js";
import { toPosixPath } from "../config/pathModel.js";

export class FileSystemSkillRepository {
  constructor(private readonly config: SkillLabConfig) {}

  resolveSkillMdPath(skillsRoot: string, indexPath: string): string {
    const absolute = path.resolve(skillsRoot, indexPath);
    return assertPathUnderRoots(absolute, this.config.allowedRoots);
  }

  readParsed(
    skillsRoot: string,
    indexPath: string,
    indexTier?: "always" | "deferred",
  ): ParsedSkillMd {
    const skillMdPath = this.resolveSkillMdPath(skillsRoot, indexPath);
    return parseSkillMd(skillMdPath, indexTier);
  }

  readProjectInventory(inventoryPath: string): Record<string, unknown> | null {
    if (!fs.existsSync(inventoryPath)) return null;
    assertPathUnderRoots(inventoryPath, this.config.allowedRoots);
    return JSON.parse(fs.readFileSync(inventoryPath, "utf8")) as Record<
      string,
      unknown
    >;
  }

  posixPathFromRoot(skillsRoot: string, absolutePath: string): string {
    const rel = path.relative(skillsRoot, absolutePath);
    return toPosixPath(rel);
  }
}
