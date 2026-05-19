#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { serve } from "@hono/node-server";
import { loadConfig, loadEnvironments } from "./config/loadConfig.js";
import { SkillCatalogService } from "./domain/SkillCatalogService.js";
import { SkillGraphService } from "./domain/SkillGraphService.js";
import { SkillHealthService } from "./domain/SkillHealthService.js";
import { createApi } from "./http/api.js";
import { startMcpServer } from "./mcp/server.js";

function resolveWebDist(packageRoot: string): string | undefined {
  const staticDir = path.join(packageRoot, "web", "dist");
  const indexPath = path.join(staticDir, "index.html");
  return fs.existsSync(indexPath) ? staticDir : undefined;
}

async function startHttpServer(options?: {
  staticDir?: string;
}): Promise<void> {
  const config = loadConfig();
  const catalog = new SkillCatalogService(config);
  const graph = new SkillGraphService(config, catalog);
  const health = new SkillHealthService(config, catalog);
  const staticDir = options?.staticDir;
  const app = createApi(
    { catalog, graph, health },
    staticDir ? { staticDir } : undefined,
  );

  const port = config.httpPort;
  const hostname = config.httpHost;
  serve(
    {
      fetch: app.fetch,
      hostname,
      port,
    },
    (info) => {
      console.log(
        `Skill Lab HTTP listening on http://${info.address}:${info.port}`,
      );
      if (staticDir) {
        console.log(`Dashboard static files: ${staticDir}`);
      }
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

  if (cmd === "serve") {
    const config = loadConfig();
    const staticDir = resolveWebDist(config.packageRoot);
    if (!staticDir) {
      console.warn(
        "web/dist not found. Build the UI (npm run web:build) or use split dev:\n" +
          "  Terminal 1: npm run dev -- http\n" +
          "  Terminal 2: npm run web:dev",
      );
    }
    await startHttpServer({ staticDir });
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
          webDist: resolveWebDist(config.packageRoot) ?? null,
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
  npm run dev -- serve     API + built dashboard (web/dist)
  npm run dev -- doctor    Print config and catalog counts

Dashboard (split dev — API + Vite, /api proxied to httpPort):
  Terminal 1: npm run dev -- http
  Terminal 2: npm run web:dev

Dashboard (production-like — build UI first):
  npm run web:build
  npm run dev -- serve

From package root after build:
  npm start -- mcp
  npm start -- http
  npm start -- serve
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
