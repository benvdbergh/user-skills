import type { SkillLabConfig } from "../config/loadConfig.js";
import type { AgentSessionRunner } from "../ai/AgentSessionRunner.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import { SkillValidationService } from "../domain/SkillValidationService.js";
import { PromptSourceService } from "../prompts/PromptSourceService.js";

export interface ValidationServices {
  validation: SkillValidationService;
}

export function createValidationService(
  config: SkillLabConfig,
  catalog: SkillCatalogService,
  agent?: AgentSessionRunner,
): SkillValidationService {
  const prompts = new PromptSourceService(config);
  return new SkillValidationService(config, catalog, prompts, agent);
}

/** FR-038: same validation wiring for MCP and HTTP (deep validate needs agent). */
export function createValidationServices(
  config: SkillLabConfig,
  catalog: SkillCatalogService,
  agent?: AgentSessionRunner,
): ValidationServices {
  return { validation: createValidationService(config, catalog, agent) };
}
