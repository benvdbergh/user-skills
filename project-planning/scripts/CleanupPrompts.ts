#!/usr/bin/env bun

/**
 * CleanupPrompts.ts - Clean up .prompt.md files for populated epics and stories
 *
 * Uses shared DocumentationUtils for consistency across PAI skills.
 *
 * Usage:
 *   bun run CleanupPrompts.ts --project <name>
 */

import { parseArgs } from "util";
import { existsSync } from "fs";
import { join } from "path";
import { cleanupPrompts } from "../../../Tools/DocumentationUtils";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const PROJECTS_DIR = join(KNOWLEDGE_DIR, "Projects");

function cleanupProject(project: string): void {
  const projectDir = join(PROJECTS_DIR, project);
  
  if (!existsSync(projectDir)) {
    console.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  let totalCleaned = 0;

  // Clean up epic prompt files
  const epicsDir = join(projectDir, "Epics");
  if (existsSync(epicsDir)) {
    const result = cleanupPrompts(epicsDir, { prefix: "Epic-" });
    result.files.forEach((file) => {
      console.log(`✓ Removed epic prompt: ${file}`);
    });
    totalCleaned += result.cleaned;
  }

  // Clean up story prompt files
  const storiesDir = join(projectDir, "Stories");
  if (existsSync(storiesDir)) {
    const result = cleanupPrompts(storiesDir, { prefix: "Story-" });
    result.files.forEach((file) => {
      console.log(`✓ Removed story prompt: ${file}`);
    });
    totalCleaned += result.cleaned;
  }

  if (totalCleaned === 0) {
    console.log("No prompt files to clean up (all epics/stories still have TODOs or prompts already removed).");
  } else {
    console.log(`\n✓ Cleaned up ${totalCleaned} prompt file(s) for project: ${project}`);
  }
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help || !values.project) {
    console.log(`
CleanupPrompts - Remove .prompt.md files for populated epics and stories

Uses shared DocumentationUtils for consistency across PAI skills.

Usage:
  bun run CleanupPrompts.ts --project <name>

Options:
  --project <name>        Project name
  -h, --help             Show this help

Description:
  This script removes .prompt.md files for epics and stories that have been
  fully populated (no TODO comments remaining). It uses shared utilities from
  ~/.claude/Tools/DocumentationUtils.ts for consistency.

Examples:
  bun run CleanupPrompts.ts --project PAI-Dashboard
`);
    process.exit(values.help ? 0 : 1);
  }

  try {
    cleanupProject(values.project as string);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
