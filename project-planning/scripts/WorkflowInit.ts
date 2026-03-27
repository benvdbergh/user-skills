#!/usr/bin/env bun

/**
 * WorkflowInit.ts - Initialize BMAD-style project workflow
 *
 * Sets up project structure and planning phase.
 *
 * Usage:
 *   bun run WorkflowInit.ts --project <name> --brief <description> [--action <init|review>]
 */

import { parseArgs } from "util";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { $ } from "bun";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const PROJECTS_DIR = join(KNOWLEDGE_DIR, "Projects");
const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

function getProjectDir(project: string): string {
  return join(PROJECTS_DIR, project);
}

function getBriefPath(project: string): string {
  return join(getProjectDir(project), "brief.md");
}

function getEpicsDir(project: string): string {
  return join(getProjectDir(project), "Epics");
}

function getStoriesDir(project: string): string {
  return join(getProjectDir(project), "Stories");
}

function loadTemplate(templateName: string): string {
  const templatePath = join(PAI_DIR, "skills", "project-planning", "assets", templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return readFileSync(templatePath, "utf-8");
}

function generateBrief(project: string, brief: string): string {
  const template = loadTemplate("ProjectBriefTemplate.md");
  const date = new Date().toISOString().split("T")[0];

  // Handle frontmatter and body separately
  const frontmatterMatch = template.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
      .replace(/\{\{projectName\}\}/g, project)
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
  } else {
    // Old format (backward compatibility)
    return template
      .replace(/\{\{projectName\}\}/g, project)
      .replace(/\{\{date\}\}/g, date)
      .replace(/\{\{projectOverview\}\}/g, brief)
      .replace(/\{\{goals\}\}/g, "<!-- TODO: Define project goals -->")
      .replace(/\{\{scope\}\}/g, "<!-- TODO: Define project scope -->")
      .replace(/\{\{successCriteria\}\}/g, "<!-- TODO: Define success criteria -->")
      .replace(/\{\{timeline\}\}/g, "<!-- TODO: Define timeline -->")
      .replace(/\{\{team\}\}/g, "<!-- TODO: Define team -->")
      .replace(/\{\{notes\}\}/g, "<!-- TODO: Add notes -->");
  }
}

async function initializeWorkflow(project: string, brief: string): Promise<void> {
  const projectDir = getProjectDir(project);

  // Create project directory structure
  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
    console.log(`✓ Created project directory: ${projectDir}`);
  }

  // Create Epics directory
  const epicsDir = getEpicsDir(project);
  if (!existsSync(epicsDir)) {
    mkdirSync(epicsDir, { recursive: true });
    console.log(`✓ Created Epics directory`);
  }

  // Create Stories directory
  const storiesDir = getStoriesDir(project);
  if (!existsSync(storiesDir)) {
    mkdirSync(storiesDir, { recursive: true });
    console.log(`✓ Created Stories directory`);
  }

  // Create specs directory
  const specsDir = join(projectDir, "specs");
  if (!existsSync(specsDir)) {
    mkdirSync(specsDir, { recursive: true });
    console.log(`✓ Created specs directory`);
  }

  // Generate brief.md
  const briefPath = getBriefPath(project);
  if (!existsSync(briefPath)) {
    const briefContent = generateBrief(project, brief);
    writeFileSync(briefPath, briefContent, "utf-8");
    console.log(`✓ Created brief.md`);
  }

  // Initialize state management
  try {
    await $`bun run ${PAI_DIR}/skills/StateManagement/Tools/StateManager.ts --project ${project} --action init`.quiet();
    console.log(`✓ Initialized state management`);
  } catch (error) {
    console.warn(`Warning: Could not initialize state: ${error}`);
  }

  // Initialize git if not exists
  const gitDir = join(projectDir, ".git");
  if (!existsSync(gitDir)) {
    try {
      await $`cd ${projectDir} && git init`.quiet();
      console.log(`✓ Initialized git repository`);
    } catch (error) {
      console.warn(`Warning: Could not initialize git: ${error}`);
    }
  }

  console.log(`\n✓ Workflow initialized for project: ${project}`);
  console.log(`\n💡 Next steps:`);
  console.log(`  1. Create PRD: bun run $PAI_DIR/skills/specification/scripts/Specify.ts --project ${project} --type prd`);
  console.log(`  2. Shard PRD: bun run $PAI_DIR/skills/project-planning/scripts/ShardPRD.ts --project ${project}`);
}

function reviewPlanning(project: string): void {
  const projectDir = getProjectDir(project);
  if (!existsSync(projectDir)) {
    console.error(`Project not found: ${project}`);
    process.exit(1);
  }

  console.log(`\nPlanning Review for: ${project}`);
  console.log("=" .repeat(50));

  // Check for required files
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

  // Check for epics
  const epicsDir = getEpicsDir(project);
  if (existsSync(epicsDir)) {
    // Count epic files (simplified - would need proper file listing)
    console.log(`✓ Epics directory exists`);
  } else {
    console.log(`⚠️  Epics directory missing`);
  }

  // Check for stories
  const storiesDir = getStoriesDir(project);
  if (existsSync(storiesDir)) {
    console.log(`✓ Stories directory exists`);
  } else {
    console.log(`⚠️  Stories directory missing`);
  }

  // Check state
  const stateDir = join(projectDir, ".state");
  if (existsSync(stateDir)) {
    console.log(`✓ State management initialized`);
  } else {
    console.log(`⚠️  State management not initialized`);
  }

  if (missingFiles.length > 0) {
    console.log(`\n❌ Missing files: ${missingFiles.join(", ")}`);
    process.exit(1);
  } else {
    console.log(`\n✓ Planning structure is complete`);
  }
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      brief: { type: "string" },
      action: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`
WorkflowInit - Initialize BMAD-Style Project Workflow

Usage:
  bun run WorkflowInit.ts --project <name> --brief <description> [--action <init|review>]

Options:
  --project <name>        Project name
  --brief <description>   Project brief description
  --action <action>       Action: init (default) or review
  -h, --help              Show this help

Examples:
  bun run WorkflowInit.ts --project my-app --brief "Task management application"
  bun run WorkflowInit.ts --project my-app --action review
`);
    process.exit(0);
  }

  if (!values.project) {
    console.error("--project is required");
    process.exit(1);
  }

  const action = (values.action as string) || "init";
  const project = values.project as string;

  if (action === "review") {
    reviewPlanning(project);
  } else if (action === "init") {
    if (!values.brief) {
      console.error("--brief is required for init action");
      process.exit(1);
    }
    initializeWorkflow(project, values.brief as string).catch((error) => {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    });
  } else {
    console.error(`Unknown action: ${action}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
