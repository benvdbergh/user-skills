import fs from "node:fs";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import type { Environment } from "../domain/types.js";
import { loadEnvironments } from "../config/loadConfig.js";

export class EnvironmentMapRepository {
  constructor(private readonly config: SkillLabConfig) {}

  listEnvironments(): Environment[] {
    assertPathUnderRoots(
      this.config.environmentMapPath,
      this.config.allowedRoots,
    );
    return loadEnvironments(this.config);
  }

  readRaw(): unknown {
    if (!fs.existsSync(this.config.environmentMapPath)) {
      return { version: 1, environments: [] };
    }
    assertPathUnderRoots(
      this.config.environmentMapPath,
      this.config.allowedRoots,
    );
    return JSON.parse(
      fs.readFileSync(this.config.environmentMapPath, "utf8"),
    ) as unknown;
  }
}
