import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import type { AgentSessionRunner } from "../ai/AgentSessionRunner.js";
import type { SkillImprovementAdvisor } from "../ai/SkillImprovementAdvisor.js";
import type { RelationshipSuggestionAdvisor } from "../ai/RelationshipSuggestionAdvisor.js";
import type { ChangeProposalService } from "../domain/ChangeProposalService.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import type { SkillGraphService } from "../domain/SkillGraphService.js";
import type { SkillHealthService } from "../domain/SkillHealthService.js";
import type { SkillValidationService } from "../domain/SkillValidationService.js";
import type { PromptSourceService } from "../prompts/PromptSourceService.js";
import type { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";
import type { SkillIndexRepository } from "../repositories/SkillIndexRepository.js";
import { registerMcpPrompts } from "./prompts.js";
import { registerProposalTools } from "./proposalTools.js";
import {
  registerCatalogTools,
  registerGraphHealthTools,
  registerRelationshipProposalTools,
  registerValidationTools,
} from "./tools.js";
import { registerCatalogResources } from "./resources.js";

/** R0.4 MCP tools registered by Skill Lab (CI smoke / contract tests). */
export const SKILL_LAB_MCP_TOOL_NAMES = [
  "list_skills",
  "search_skills",
  "get_skill_detail",
  "get_skill_graph",
  "graph_neighbors",
  "check_catalog_health",
  "lint_skill",
  "validate_skill",
  "propose_skill_patch",
  "suggest_relationship_edges",
  "detect_trigger_conflicts",
] as const;

export interface SkillLabMcpDeps {
  config: SkillLabConfig;
  catalog: SkillCatalogService;
  graph: SkillGraphService;
  health: SkillHealthService;
  validation: SkillValidationService;
  agent: AgentSessionRunner;
  proposals: ChangeProposalService;
  prompts: PromptSourceService;
  skillAdvisor: SkillImprovementAdvisor;
  relationshipAdvisor: RelationshipSuggestionAdvisor;
  relationshipMap: RelationshipMapRepository;
  indexRepo: SkillIndexRepository;
}

export interface SkillLabMcpServer {
  server: McpServer;
  deps: SkillLabMcpDeps;
}

export function wireSkillLabMcpServer(deps: SkillLabMcpDeps): SkillLabMcpServer {
  const server = new McpServer({
    name: "skill-lab",
    version: "0.2.0",
  });

  registerCatalogTools(server, deps.catalog);
  registerGraphHealthTools(server, { graph: deps.graph, health: deps.health });
  registerValidationTools(server, deps.validation);
  registerProposalTools(server, deps.skillAdvisor);
  registerRelationshipProposalTools(server, {
    catalog: deps.catalog,
    proposals: deps.proposals,
    relationshipAdvisor: deps.relationshipAdvisor,
  });
  registerMcpPrompts(server, {
    config: deps.config,
    catalog: deps.catalog,
    prompts: deps.prompts,
    relationshipMap: deps.relationshipMap,
  });
  registerCatalogResources(server, {
    catalog: deps.catalog,
    graph: deps.graph,
    health: deps.health,
    validation: deps.validation,
    relationshipMap: deps.relationshipMap,
    indexRepo: deps.indexRepo,
  });

  return { server, deps };
}
