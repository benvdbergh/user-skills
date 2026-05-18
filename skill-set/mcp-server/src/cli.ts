#!/usr/bin/env node
import { loadConfig, loadEnvironments } from "./config/loadConfig.js";
import { SkillCatalogService } from "./domain/SkillCatalogService.js";
import { startMcpServer } from "./mcp/server.js";

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? "help";

  if (cmd === "mcp") {
    await startMcpServer();
    return;
  }

  if (cmd === "doctor") {
    const config = loadConfig();
    const envs = loadEnvironments(config);
    const catalog = new SkillCatalogService(config);
    const skills = catalog.listSkills();
    console.log(
      JSON.stringify(
        {
          skillsRoot: config.skillsRoot,
          environmentMapPath: config.environmentMapPath,
          environments: envs.length,
          skillsListed: skills.length,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Skill Lab MCP control plane

Usage:
  npm run dev -- mcp       Start MCP server (stdio)
  npm run dev -- doctor    Print config and catalog counts

From package root after build:
  npm start -- mcp
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
