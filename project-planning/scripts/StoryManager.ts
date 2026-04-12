#!/usr/bin/env bun

/**
 * StoryManager.ts — Stories (manifest-aware).
 */

import { parseArgs } from "util";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { contextFromArgs } from "./lib/cliShared";
import type { PlanningContext } from "./lib/types";
import { getStoriesDir, storyPrefix } from "./lib/planningPaths";
import { writeStoryFile } from "./lib/writePlanningArtifact";
import { getEpicNumberByName } from "./lib/epicStoryNumbers";
import {
  parseMarkdownFrontmatter,
  getId,
  getStatus,
} from "./lib/frontmatter";

function createStory(
  ctx: PlanningContext,
  storyName: string,
  epicName: string,
  description: string
): void {
  const epicNumber = getEpicNumberByName(ctx, epicName);
  writeStoryFile(ctx, storyName, epicName, epicNumber, description);
  console.log(`✓ Created story: ${storyName}`);
}

function listStories(ctx: PlanningContext): void {
  const storiesDir = getStoriesDir(ctx);
  const prefix = storyPrefix(ctx);
  if (!existsSync(storiesDir)) {
    console.log("No stories directory.");
    return;
  }
  const files = readdirSync(storiesDir).filter((f) => f.endsWith(".md") && f.startsWith(prefix));
  if (files.length === 0) {
    console.log("No stories.");
    return;
  }
  console.log(`\nStories under ${storiesDir}`);
  console.log("=".repeat(50));
  files.forEach((file, i) => {
    const p = join(storiesDir, file);
    const content = readFileSync(p, "utf-8");
    const fm = parseMarkdownFrontmatter(content);
    const id = fm ? getId(fm.data) : undefined;
    const status = fm ? getStatus(fm.data) : undefined;
    const title = typeof fm?.data.title === "string" ? fm.data.title : file;
    const parent = typeof fm?.data.parent === "string" ? fm.data.parent : "";
    console.log(`\n${i + 1}. ${title}`);
    if (id) {
      console.log(`   id: ${id}`);
    }
    if (parent) {
      console.log(`   parent: ${parent}`);
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
      story: { type: "string" },
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
StoryManager — Stories (manifest-aware)

Usage:
  bun run StoryManager.ts (--project <n> | --root <dir> | --config <file>) --action <create|list|update> ...

  create: --story <name> --epic <name> --description <text>

Edit the .md file directly (replace <!-- TODO -->). No sidecar .prompt.md files.
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
      if (!values.story || !values.epic || !values.description) {
        console.error("--story, --epic, --description required");
        process.exit(1);
      }
      createStory(ctx, values.story as string, values.epic as string, values.description as string);
    } else if (values.action === "list") {
      listStories(ctx);
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
