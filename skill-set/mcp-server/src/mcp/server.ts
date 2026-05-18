import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config/loadConfig.js";
import { SkillCatalogService } from "../domain/SkillCatalogService.js";
import { registerCatalogTools } from "./tools.js";

export async function startMcpServer(): Promise<void> {
  const config = loadConfig();
  const catalog = new SkillCatalogService(config);
  const server = new McpServer({
    name: "skill-lab",
    version: "0.1.0",
  });

  registerCatalogTools(server, catalog);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
