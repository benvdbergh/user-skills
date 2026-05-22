import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadConfig } from "../config/loadConfig.js";

import { SkillCatalogService } from "../domain/SkillCatalogService.js";

import { SkillGraphService } from "../domain/SkillGraphService.js";

import { SkillHealthService } from "../domain/SkillHealthService.js";

import { PromptSourceService } from "../prompts/PromptSourceService.js";

import { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";

import { SkillIndexRepository } from "../repositories/SkillIndexRepository.js";

import { registerCatalogResources } from "./resources.js";

import { ChangeProposalService } from "../domain/ChangeProposalService.js";

import { SkillImprovementAdvisor } from "../ai/SkillImprovementAdvisor.js";

import { RelationshipSuggestionAdvisor } from "../ai/RelationshipSuggestionAdvisor.js";

import { createValidationService } from "../http/createValidationServices.js";

import { registerProposalTools } from "./proposalTools.js";

import { registerMcpPrompts } from "./prompts.js";

import {

  registerCatalogTools,

  registerGraphHealthTools,

  registerRelationshipProposalTools,

  registerValidationTools,

} from "./tools.js";



export async function startMcpServer(): Promise<void> {

  const config = loadConfig();

  const catalog = new SkillCatalogService(config);

  const graph = new SkillGraphService(config, catalog);

  const health = new SkillHealthService(config, catalog);

  const validation = createValidationService(config, catalog);

  const proposals = new ChangeProposalService(config);

  const skillAdvisor = new SkillImprovementAdvisor(config, catalog, proposals);

  const prompts = new PromptSourceService(config);

  const relationshipMap = new RelationshipMapRepository(config);

  const relationshipAdvisor = new RelationshipSuggestionAdvisor(

    catalog,

    relationshipMap,

  );

  const server = new McpServer({

    name: "skill-lab",

    version: "0.2.0",

  });



  registerCatalogTools(server, catalog);

  registerGraphHealthTools(server, { graph, health });

  registerValidationTools(server, validation);

  registerProposalTools(server, skillAdvisor);

  registerRelationshipProposalTools(server, {

    catalog,

    proposals,

    relationshipAdvisor,

  });

  registerMcpPrompts(server, {

    config,

    catalog,

    prompts,

    relationshipMap,

  });

  registerCatalogResources(server, {

    catalog,

    graph,

    health,

    validation,

    relationshipMap,

    indexRepo: new SkillIndexRepository(config),

  });



  const transport = new StdioServerTransport();

  await server.connect(transport);

}

