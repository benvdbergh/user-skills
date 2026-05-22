import type { SkillLabConfig } from "../config/loadConfig.js";
import type { AgentSessionRunner } from "../ai/AgentSessionRunner.js";
import { ClaudeAgentSessionRunner } from "../ai/ClaudeAgentSessionRunner.js";
import { RoutingAgentSessionRunner } from "../ai/RoutingAgentSessionRunner.js";
import { StubAgentSessionRunner } from "../ai/StubAgentSessionRunner.js";
import { RelationshipSuggestionAdvisor } from "../ai/RelationshipSuggestionAdvisor.js";
import { ChangeProposalService } from "../domain/ChangeProposalService.js";
import { SkillCatalogService } from "../domain/SkillCatalogService.js";
import { PromptSourceService } from "../prompts/PromptSourceService.js";
import { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";

export interface AgentServices {
  agent: AgentSessionRunner;
  proposals: ChangeProposalService;
  prompts: PromptSourceService;
}

export function createAgentServices(
  config: SkillLabConfig,
  catalog: SkillCatalogService,
  options?: { useStubRunner?: boolean; proposals?: ChangeProposalService },
): AgentServices {
  const prompts = new PromptSourceService(config);
  const proposals = options?.proposals ?? new ChangeProposalService(config);
  const relationshipAdvisor = new RelationshipSuggestionAdvisor(
    catalog,
    new RelationshipMapRepository(config),
  );
  const stub = new StubAgentSessionRunner(
    config,
    catalog,
    prompts,
    proposals,
    relationshipAdvisor,
  );
  const claude = new ClaudeAgentSessionRunner(
    config,
    catalog,
    prompts,
    proposals,
  );
  const agent = options?.useStubRunner
    ? stub
    : new RoutingAgentSessionRunner(config, stub, claude);
  return { agent, proposals, prompts };
}
