#!/usr/bin/env bun

/**
 * EpicManager.ts — Epic lifecycle (manifest-aware).
 *
 * Usage:
 *   bun run EpicManager.ts --project <name> | --root <dir> | --config <file> --action <create|list|update> ...
 */

import { parseArgs } from "util";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { contextFromArgs } from "./lib/cliShared";
import type { PlanningContext } from "./lib/types";
import { getEpicsDir, epicPrefix } from "./lib/planningPaths";
import { writeEpicFile } from "./lib/writePlanningArtifact";
import {
  parseMarkdownFrontmatter,
  getId,
  getStatus,
} from "./lib/frontmatter";

function createEpic(ctx: PlanningContext, epicName: string, description: string): void {
  writeEpicFile(ctx, epicName, description, []);
  console.log(`✓ Created epic: ${epicName}`);
}

function listEpics(ctx: PlanningContext): void {
  const epicsDir = getEpicsDir(ctx);
  const prefix = epicPrefix(ctx);
  if (!existsSync(epicsDir)) {
    console.log("No epics directory.");
    return;
  }
  const files = readdirSync(epicsDir).filter((f) => f.endsWith(".md") && f.startsWith(prefix));
  if (files.length === 0) {
    console.log("No epics.");
    return;
  }
  console.log(`\nEpics under ${epicsDir}`);
  console.log("=".repeat(50));
  files.forEach((file, i) => {
    const p = join(epicsDir, file);
    const content = readFileSync(p, "utf-8");
    const fm = parseMarkdownFrontmatter(content);
    const id = fm ? getId(fm.data) : undefined;
    const status = fm ? getStatus(fm.data) : undefined;
    const title = typeof fm?.data.title === "string" ? fm.data.title : file;
    console.log(`\n${i + 1}. ${title}`);
    if (id) {
      console.log(`   id: ${id}`);
    }
    if (status) {
      console.log(`   status: ${status}`);
    }
    console.log(`   file: ${file}`);
  });
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      root: { type: "string" },
      config: { type: "string" },
      action: { type: "string" },
      epic: { type: "string" },
      description: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (
    values.help ||
    !values.action ||
    !["create", "list", "update"].includes(values.action as string)
  ) {
    console.log(`
EpicManager — Epics (manifest-aware)

Usage:
  bun run EpicManager.ts (--project <name> | --root <dir> | --config <file>) --action <create|list|update> ...

Options:
  --project, --root, --config
  --action create|list|update
  --epic <name>     create
  --description     create
  -h, --help

Populate epic bodies by editing the .md file (replace <!-- TODO -->). No sidecar .prompt.md files.
`);
    process.exit(values.help ? 0 : 1);
  }

  const ctx = contextFromArgs({
    project: values.project,
    root: values.root,
    config: values.config,
  });

  try {
    if (values.action === "create") {
      if (!values.epic || !values.description) {
        console.error("--epic and --description required");
        process.exit(1);
      }
      createEpic(ctx, values.epic as string, values.description as string);
    } else if (values.action === "list") {
      listEpics(ctx);
    } else {
      console.log("Update not implemented");
      process.exit(1);
    }
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
