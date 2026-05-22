import type { SkillLabConfig } from "../config/loadConfig.js";
import type { AgentSessionRunner } from "../ai/AgentSessionRunner.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import { SkillValidationService } from "../domain/SkillValidationService.js";
import { PromptSourceService } from "../prompts/PromptSourceService.js";

export function createValidationService(
  config: SkillLabConfig,
  catalog: SkillCatalogService,
  agent?: AgentSessionRunner,
): SkillValidationService {
  const prompts = new PromptSourceService(config);
  return new SkillValidationService(config, catalog, prompts, agent);
}
