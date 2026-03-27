#!/usr/bin/env bun

/**
 * ShardPRD.ts - Break PRD into Epics and Stories
 *
 * Analyzes PRD and creates epic/story structure.
 *
 * Usage:
 *   bun run ShardPRD.ts --project <name> [--prd <path>]
 */

import { parseArgs } from "util";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const PROJECTS_DIR = join(KNOWLEDGE_DIR, "Projects");
const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

function getPRDPath(project: string, customPath?: string): string {
  if (customPath) return customPath;
  return join(PROJECTS_DIR, project, "PRD.md");
}

function getEpicsDir(project: string): string {
  return join(PROJECTS_DIR, project, "Epics");
}

function getStoriesDir(project: string): string {
  return join(PROJECTS_DIR, project, "Stories");
}

function loadTemplate(templateName: string): string {
  const templatePath = join(PAI_DIR, "skills", "project-planning", "assets", templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return readFileSync(templatePath, "utf-8");
}

function parsePRD(prdPath: string): { sections: Array<{ title: string; content: string }>; userStories: string[] } } {
  const content = readFileSync(prdPath, "utf-8");
  const sections: Array<{ title: string; content: string }> = [];
  const userStories: string[] = [];

  // Extract sections (## headers)
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

  // Extract user stories (simple pattern matching)
  const storyRegex = /(?:As a|User story|Story):\s*(.+?)(?:\n|$)/gi;
  let storyMatch;
  while ((storyMatch = storyRegex.exec(content)) !== null) {
    userStories.push(storyMatch[1].trim());
  }

  return { sections, userStories };
}

function createEpic(project: string, epicName: string, description: string, prdSections: string[]): void {
  const epicsDir = getEpicsDir(project);
  const epicId = `EPIC-${Date.now()}`;
  const epicFileName = `Epic-${epicName.replace(/\s+/g, "-")}.md`;
  const epicPath = join(epicsDir, epicFileName);

  const template = loadTemplate("EpicTemplate.md");
  const date = new Date().toISOString().split("T")[0];

  const epicContent = template
    .replace(/\{\{epicName\}\}/g, epicName)
    .replace(/\{\{epicId\}\}/g, epicId)
    .replace(/\{\{status\}\}/g, "planned")
    .replace(/\{\{priority\}\}/g, "medium")
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{objectives\}\}/g, "<!-- TODO: Define epic objectives -->")
    .replace(/\{\{userStories\}\}/g, "<!-- TODO: Add user stories -->")
    .replace(/\{\{acceptanceCriteria\}\}/g, "<!-- TODO: Define acceptance criteria -->")
    .replace(/\{\{dependencies\}\}/g, "<!-- TODO: List dependencies -->")
    .replace(/\{\{prdSections\}\}/g, prdSections.map((s) => `- ${s}`).join("\n"))
    .replace(/\{\{notes\}\}/g, "<!-- TODO: Add notes -->");

  writeFileSync(epicPath, epicContent, "utf-8");
  console.log(`✓ Created epic: ${epicName}`);
}

function shardPRD(project: string, prdPath?: string): void {
  const actualPRDPath = getPRDPath(project, prdPath);
  if (!existsSync(actualPRDPath)) {
    throw new Error(`PRD not found: ${actualPRDPath}`);
  }

  console.log(`Sharding PRD: ${actualPRDPath}`);

  const { sections, userStories } = parsePRD(actualPRDPath);

  // Create epics from major sections
  const epicSections = sections.filter((s) => {
    const titleLower = s.title.toLowerCase();
    return (
      titleLower.includes("feature") ||
      titleLower.includes("requirement") ||
      titleLower.includes("user story") ||
      titleLower.includes("epic")
    );
  });

  if (epicSections.length === 0) {
    // Fallback: create epics from all sections
    epicSections.push(...sections.slice(0, 5)); // Limit to first 5 sections
  }

  const epicsDir = getEpicsDir(project);
  if (!existsSync(epicsDir)) {
    throw new Error(`Epics directory not found. Run WorkflowInit.ts first.`);
  }

  // Create epics
  epicSections.forEach((section, index) => {
    const epicName = section.title || `Epic ${index + 1}`;
    const description = section.content.substring(0, 200) || "No description";
    createEpic(project, epicName, description, [section.title]);
  });

  console.log(`\n✓ Created ${epicSections.length} epics`);
  console.log(`\n💡 Next steps:`);
  console.log(`  1. Review epics in ${epicsDir}`);
  console.log(`  2. Create stories for each epic`);
  console.log(`  3. Run PlanReview workflow to validate planning`);
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      prd: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help || !values.project) {
    console.log(`
ShardPRD - Break PRD into Epics and Stories

Usage:
  bun run ShardPRD.ts --project <name> [--prd <path>]

Options:
  --project <name>        Project name
  --prd <path>           Path to PRD file (defaults to project/PRD.md)
  -h, --help             Show this help

Examples:
  bun run ShardPRD.ts --project my-app
  bun run ShardPRD.ts --project my-app --prd ~/Knowledge/Projects/my-app/PRD.md
`);
    process.exit(values.help ? 0 : 1);
  }

  try {
    shardPRD(values.project as string, values.prd as string | undefined);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
