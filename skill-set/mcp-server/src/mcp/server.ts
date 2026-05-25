import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config/loadConfig.js";
import { SkillCatalogService } from "../domain/SkillCatalogService.js";
import { SkillGraphService } from "../domain/SkillGraphService.js";
import { SkillHealthService } from "../domain/SkillHealthService.js";
import { createAgentServices } from "../http/createAgentServices.js";
import { createProposalServices } from "../http/createProposalServices.js";
import { createValidationServices } from "../http/createValidationServices.js";
import { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";
import { SkillIndexRepository } from "../repositories/SkillIndexRepository.js";
import { wireSkillLabMcpServer } from "./skillLabMcpServer.js";

export async function startMcpServer(): Promise<void> {
  const config = loadConfig();
  const catalog = new SkillCatalogService(config);
  const graph = new SkillGraphService(config, catalog);
  const health = new SkillHealthService(config, catalog);
  const { agent, proposals, prompts } = createAgentServices(config, catalog);
  const { validation } = createValidationServices(config, catalog, agent);
  const proposalRoutes = createProposalServices(config, catalog, proposals);
  const relationshipMap = new RelationshipMapRepository(config);

  const { server } = wireSkillLabMcpServer({
    config,
    catalog,
    graph,
    health,
    validation,
    agent,
    proposals,
    prompts,
    skillAdvisor: proposalRoutes.skillAdvisor,
    relationshipAdvisor: proposalRoutes.relationshipAdvisor,
    relationshipMap,
    indexRepo: new SkillIndexRepository(config),
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}