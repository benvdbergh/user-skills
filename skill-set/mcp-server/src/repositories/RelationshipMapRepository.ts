import fs from "node:fs";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import {
  RelationshipMapFileSchema,
  type RelationshipMapFile,
} from "../domain/types.js";

const EMPTY_MAP: RelationshipMapFile = {
  skills: { user_level: [], project_level_ai_vault: [] },
  relationships: [],
  high_risk_refactor_sequences: [],
};

export class RelationshipMapRepository {
  constructor(private readonly config: SkillLabConfig) {}

  read(): RelationshipMapFile {
    const mapPath = this.config.relationshipMapPath;
    if (!fs.existsSync(mapPath)) {
      return EMPTY_MAP;
    }
    assertPathUnderRoots(mapPath, this.config.allowedRoots);
    const raw = JSON.parse(fs.readFileSync(mapPath, "utf8")) as unknown;
    return RelationshipMapFileSchema.parse(raw);
  }
}
