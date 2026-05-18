#!/usr/bin/env node
import { serve } from "@hono/node-server";
import { loadConfig, loadEnvironments } from "./config/loadConfig.js";
import { SkillCatalogService } from "./domain/SkillCatalogService.js";
import { SkillGraphService } from "./domain/SkillGraphService.js";
import { SkillHealthService } from "./domain/SkillHealthService.js";
import { createApi } from "./http/api.js";
import { startMcpServer } from "./mcp/server.js";

const LOCAL_BIND_HOST = "127.0.0.1";

async function startHttpServer(): Promise<void> {
  const config = loadConfig();
  const catalog = new SkillCatalogService(config);
  const graph = new SkillGraphService(config, catalog);
  const health = new SkillHealthService(config, catalog);
  const app = createApi({ catalog, graph, health });

  const port = config.httpPort;
  serve(
    {
      fetch: app.fetch,
      hostname: LOCAL_BIND_HOST,
      port,
    },
    (info) => {
      console.log(
        `Skill Lab HTTP listening on http://${info.address}:${info.port}`,
      );
    },
  );
}

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? "help";

  if (cmd === "mcp") {
    await startMcpServer();
    return;
  }

  if (cmd === "http") {
    await startHttpServer();
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
          httpHost: config.httpHost,
          httpPort: config.httpPort,
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
  npm run dev -- http      Start HTTP read API (127.0.0.1)
  npm run dev -- doctor    Print config and catalog counts

From package root after build:
  npm start -- mcp
  npm start -- http
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
