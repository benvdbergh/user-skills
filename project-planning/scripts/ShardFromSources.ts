#!/usr/bin/env bun

/**
 * ShardFromSources — Break PRD / spec into epics using planning context (manifest or legacy --project).
 *
 * Usage:
 *   bun run ShardFromSources.ts --project <name> [--prd <path>]
 *   bun run ShardFromSources.ts --root <path> [--prd <path>]
 *   bun run ShardFromSources.ts --config <path-to-.project-planning.yaml> [--prd <path>]
 */

import { parseArgs } from "util";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { PlanningContext } from "./lib/types";
import { contextFromArgs } from "./lib/cliShared";
import { getEpicsDir } from "./lib/planningPaths";
import { writeEpicFile } from "./lib/writePlanningArtifact";

function getPRDPath(ctx: PlanningContext, customPath?: string): string {
  if (customPath) {
    return customPath;
  }
  return join(ctx.projectRoot, "PRD.md");
}

function parsePRD(prdPath: string): {
  sections: Array<{ title: string; content: string }>;
  userStories: string[];
} {
  const content = readFileSync(prdPath, "utf-8");
  const sections: Array<{ title: string; content: string }> = [];
  const sectionRegex = /^##\s+(.+)$/gm;
  let lastIndex = 0;
  let match;

  while ((match = sectionRegex.exec(content)) !== null) {
    if (sections.length > 0) {
      sections[sections.length - 1].content = content.substring(lastIndex, match.index).trim();
    }
    sections.push({ title: match[1], content: "" });
    lastIndex = match.index;
  }
  if (sections.length > 0) {
    sections[sections.length - 1].content = content.substring(lastIndex).trim();
  }

  const userStories: string[] = [];
  const storyRegex = /(?:As a|User story|Story):\s*(.+?)(?:\n|$)/gi;
  let storyMatch;
  while ((storyMatch = storyRegex.exec(content)) !== null) {
    userStories.push(storyMatch[1].trim());
  }

  return { sections, userStories };
}

export function shardFromSources(ctx: PlanningContext, prdPath?: string): void {
  const actualPRDPath = getPRDPath(ctx, prdPath);
  if (!existsSync(actualPRDPath)) {
    throw new Error(`PRD / spec file not found: ${actualPRDPath}`);
  }

  console.log(`Sharding from: ${actualPRDPath}`);

  const { sections } = parsePRD(actualPRDPath);

  let epicSections = sections.filter((s) => {
    const titleLower = s.title.toLowerCase();
    return (
      titleLower.includes("feature") ||
      titleLower.includes("requirement") ||
      titleLower.includes("user story") ||
      titleLower.includes("epic")
    );
  });

  if (epicSections.length === 0) {
    epicSections = sections.slice(0, Math.min(5, sections.length));
  }

  const epicsDir = getEpicsDir(ctx);
  if (!existsSync(epicsDir)) {
    throw new Error(`Epics directory not found: ${epicsDir}. Run WorkflowInit first.`);
  }

  epicSections.forEach((section, index) => {
    const epicName = section.title || `Epic ${index + 1}`;
    const description = section.content.substring(0, 200) || "No description";
    writeEpicFile(ctx, epicName, description, [section.title]);
    console.log(`✓ Epic file: ${epicName}`);
  });

  console.log(`\n✓ Created ${epicSections.length} epic(s) under ${epicsDir}`);
  console.log(`\nNext: review epics, add stories (StoryManager), run LintPlan.ts`);
}

export function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      root: { type: "string" },
      config: { type: "string" },
      prd: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`
ShardFromSources — Create epics from a PRD/spec markdown file

Usage:
  bun run ShardFromSources.ts --project <name> [--prd <path>]
  bun run ShardFromSources.ts --root <dir> [--prd <path>]
  bun run ShardFromSources.ts --config <path/.project-planning.yaml> [--prd <path>]

Options:
  --project <name>   Legacy: Knowledge/Projects/<name>
  --root <dir>       Project root (uses .project-planning.yaml if present)
  --config <file>    Explicit manifest path (project root = dirname)
  --prd <path>       PRD markdown (default: <root>/PRD.md)
  -h, --help
`);
    process.exit(0);
  }

  const ctx = contextFromArgs({
    project: values.project,
    root: values.root,
    config: values.config,
  });

  try {
    shardFromSources(ctx, values.prd as string | undefined);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
