import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config/loadConfig.js";
import { SkillCatalogService } from "../domain/SkillCatalogService.js";
import { SkillGraphService } from "../domain/SkillGraphService.js";
import { SkillHealthService } from "../domain/SkillHealthService.js";
import { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";
import { SkillIndexRepository } from "../repositories/SkillIndexRepository.js";
import { registerCatalogResources } from "./resources.js";
import { registerCatalogTools, registerGraphHealthTools } from "./tools.js";

export async function startMcpServer(): Promise<void> {
  const config = loadConfig();
  const catalog = new SkillCatalogService(config);
  const graph = new SkillGraphService(config, catalog);
  const health = new SkillHealthService(config, catalog);
  const server = new McpServer({
    name: "skill-lab",
    version: "0.2.0",
  });

  registerCatalogTools(server, catalog);
  registerGraphHealthTools(server, { graph, health });
  registerCatalogResources(server, {
    catalog,
    graph,
    health,
    relationshipMap: new RelationshipMapRepository(config),
    indexRepo: new SkillIndexRepository(config),
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
