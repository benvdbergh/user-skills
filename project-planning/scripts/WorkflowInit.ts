#!/usr/bin/env bun

/**
 * WorkflowInit.ts — Initialize planning workspace (manifest + dirs + brief).
 *
 * Usage:
 *   bun run WorkflowInit.ts --project <name> --brief <description> [--action init|review]
 *   bun run WorkflowInit.ts --root <path> --brief <description>
 *   bun run WorkflowInit.ts --config <path/.project-planning.yaml> --brief <description>
 */

import { parseArgs } from "util";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, basename } from "path";
import { $ } from "bun";
import { contextFromArgs } from "./lib/cliShared";
import type { PlanningContext } from "./lib/types";
import { getEpicsDir, getStoriesDir, getBriefPath } from "./lib/planningPaths";
import { getPaiDir } from "./lib/paiDir";
import { MANIFEST_FILENAME } from "./lib/loadManifest";

function projectNameForState(ctx: PlanningContext): string {
  return ctx.legacyProjectName ?? basename(ctx.projectRoot);
}

function loadTemplate(templateName: string): string {
  const paiDir = getPaiDir();
  const templatePath = join(paiDir, "skills", "project-planning", "assets", templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return readFileSync(templatePath, "utf-8");
}

function ensureManifest(ctx: PlanningContext): void {
  const manifestPath = join(ctx.projectRoot, MANIFEST_FILENAME);
  if (existsSync(manifestPath)) {
    return;
  }
  const defaultPath = join(
    getPaiDir(),
    "skills",
    "project-planning",
    "assets",
    "default.project-planning.yaml"
  );
  if (existsSync(defaultPath)) {
    const content = readFileSync(defaultPath, "utf-8");
    writeFileSync(manifestPath, content, "utf-8");
    console.log(`✓ Created ${MANIFEST_FILENAME}`);
  }
}

function generateBrief(projectLabel: string, brief: string): string {
  const template = loadTemplate("ProjectBriefTemplate.md");
  const date = new Date().toISOString().split("T")[0];
  const frontmatterMatch = template.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
      .replace(/\{\{projectName\}\}/g, projectLabel)
      .replace(/\{\{date\}\}/g, date);
    const body = frontmatterMatch[2]
      .replace(/\{\{projectOverview\}\}/g, brief)
      .replace(/\{\{goals\}\}/g, "<!-- TODO: Define project goals -->")
      .replace(/\{\{scope\}\}/g, "<!-- TODO: Define project scope -->")
      .replace(/\{\{successCriteria\}\}/g, "<!-- TODO: Define success criteria -->")
      .replace(/\{\{timeline\}\}/g, "<!-- TODO: Define timeline -->")
      .replace(/\{\{team\}\}/g, "<!-- TODO: Define team -->")
      .replace(/\{\{notes\}\}/g, "<!-- TODO: Add notes -->");
    return `---\n${frontmatter}\n---\n\n${body}`;
  }
  return template
    .replace(/\{\{projectName\}\}/g, projectLabel)
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{projectOverview\}\}/g, brief)
    .replace(/\{\{goals\}\}/g, "<!-- TODO: Define project goals -->")
    .replace(/\{\{scope\}\}/g, "<!-- TODO: Define project scope -->")
    .replace(/\{\{successCriteria\}\}/g, "<!-- TODO: Define success criteria -->")
    .replace(/\{\{timeline\}\}/g, "<!-- TODO: Define timeline -->")
    .replace(/\{\{team\}\}/g, "<!-- TODO: Define team -->")
    .replace(/\{\{notes\}\}/g, "<!-- TODO: Add notes -->");
}

async function initializeWorkflow(ctx: PlanningContext, brief: string): Promise<void> {
  const projectDir = ctx.projectRoot;
  const projectLabel = projectNameForState(ctx);

  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
    console.log(`✓ Created project directory: ${projectDir}`);
  }

  ensureManifest(ctx);

  const epicsDir = getEpicsDir(ctx);
  if (!existsSync(epicsDir)) {
    mkdirSync(epicsDir, { recursive: true });
    console.log(`✓ Created epics directory: ${epicsDir}`);
  }

  const storiesDir = getStoriesDir(ctx);
  if (!existsSync(storiesDir)) {
    mkdirSync(storiesDir, { recursive: true });
    console.log(`✓ Created stories directory: ${storiesDir}`);
  }

  const specsDir = join(projectDir, "specs");
  if (!existsSync(specsDir)) {
    mkdirSync(specsDir, { recursive: true });
    console.log(`✓ Created specs directory`);
  }

  const briefPath = getBriefPath(ctx);
  if (!existsSync(briefPath)) {
    writeFileSync(briefPath, generateBrief(projectLabel, brief), "utf-8");
    console.log(`✓ Created brief.md`);
  }

  const paiDir = getPaiDir();
  const stateScript = join(paiDir, "skills", "StateManagement", "Tools", "StateManager.ts");
  if (existsSync(stateScript)) {
    try {
      await $`bun run ${stateScript} --project ${projectLabel} --action init`.quiet();
      console.log(`✓ Initialized state management`);
    } catch (error) {
      console.warn(`Warning: Could not initialize state: ${error}`);
    }
  }

  const gitDir = join(projectDir, ".git");
  if (!existsSync(gitDir)) {
    try {
      await $`cd ${projectDir} && git init`.quiet();
      console.log(`✓ Initialized git repository`);
    } catch (error) {
      console.warn(`Warning: Could not initialize git: ${error}`);
    }
  }

  console.log(`\n✓ Workflow initialized at: ${projectDir}`);
  console.log(`\nNext steps:`);
  console.log(`  1. PRD/spec: specification skill or add PRD.md under root`);
  console.log(
    `  2. Shard: bun run ${paiDir}/skills/project-planning/scripts/ShardFromSources.ts --root "${projectDir}"`
  );
}

function reviewPlanning(ctx: PlanningContext): void {
  const projectDir = ctx.projectRoot;
  const projectLabel = projectNameForState(ctx);
  if (!existsSync(projectDir)) {
    console.error(`Project not found: ${projectDir}`);
    process.exit(1);
  }

  console.log(`\nPlanning review: ${projectLabel}`);
  console.log("=".repeat(50));

  const requiredFiles = ["brief.md", "PRD.md"];
  const missingFiles: string[] = [];
  for (const file of requiredFiles) {
    const filePath = join(projectDir, file);
    if (!existsSync(filePath)) {
      missingFiles.push(file);
    } else {
      console.log(`✓ ${file} exists`);
    }
  }

  const epicsDir = getEpicsDir(ctx);
  if (existsSync(epicsDir)) {
    console.log(`✓ Epics directory exists`);
  } else {
    console.log(`⚠️  Epics directory missing`);
  }

  const storiesDir = getStoriesDir(ctx);
  if (existsSync(storiesDir)) {
    console.log(`✓ Stories directory exists`);
  } else {
    console.log(`⚠️  Stories directory missing`);
  }

  const stateDir = join(projectDir, ".state");
  if (existsSync(stateDir)) {
    console.log(`✓ State directory present`);
  } else {
    console.log(`⚠️  State directory missing`);
  }

  console.log(`\nRun LintPlan.ts and see references/plan-quality-review.md for full gates.`);

  if (missingFiles.length > 0) {
    console.log(`\n❌ Missing files: ${missingFiles.join(", ")}`);
    process.exit(1);
  }
  console.log(`\n✓ Basic planning structure present`);
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      root: { type: "string" },
      config: { type: "string" },
      brief: { type: "string" },
      action: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`
WorkflowInit — Initialize planning workspace

Usage:
  bun run WorkflowInit.ts --project <name> --brief <text> [--action init|review]
  bun run WorkflowInit.ts --root <dir> --brief <text>
  bun run WorkflowInit.ts --config <path/.project-planning.yaml> --brief <text>

Options:
  --project <name>   Legacy: \$KNOWLEDGE_DIR/Projects/<name>
  --root <dir>       Project root
  --config <file>    Manifest path (root = dirname)
  --brief <text>     Required for init
  --action <name>    init (default) | review
  -h, --help
`);
    process.exit(0);
  }

  const ctx = contextFromArgs({
    project: values.project,
    root: values.root,
    config: values.config,
  });

  const action = (values.action as string) || "init";

  if (action === "review") {
    reviewPlanning(ctx);
    return;
  }

  if (action !== "init") {
    console.error(`Unknown action: ${action}`);
    process.exit(1);
  }

  if (!values.brief) {
    console.error("--brief is required for init");
    process.exit(1);
  }

  initializeWorkflow(ctx, values.brief as string).catch((error) => {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  });
}

if (import.meta.main) {
  main();
}
