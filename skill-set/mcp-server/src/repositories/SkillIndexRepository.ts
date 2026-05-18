import fs from "node:fs";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import type { SkillLabConfig } from "../config/loadConfig.js";

export interface IndexSkillEntry {
  name: string;
  path: string;
  fullDescription: string;
  triggers: string[];
  workflows: string[];
  tier: "always" | "deferred";
}

export interface SkillIndexFile {
  generated?: string;
  totalSkills: number;
  alwaysLoadedCount: number;
  deferredCount: number;
  skills: Record<string, IndexSkillEntry>;
}

export class SkillIndexRepository {
  constructor(private readonly config: SkillLabConfig) {}

  read(skillIndexPath: string): SkillIndexFile {
    assertPathUnderRoots(skillIndexPath, this.config.allowedRoots);
    const raw = JSON.parse(fs.readFileSync(skillIndexPath, "utf8")) as SkillIndexFile;
    return raw;
  }
}
