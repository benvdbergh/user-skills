#!/usr/bin/env bun

/**
 * EpicManager.ts - Epic lifecycle management
 *
 * Create, list, and update epics.
 *
 * Usage:
 *   bun run EpicManager.ts --project <name> --action <create|list|update> [options]
 */

import { parseArgs } from "util";
import { existsSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join, dirname } from "path";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const PROJECTS_DIR = join(KNOWLEDGE_DIR, "Projects");
const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

function getEpicsDir(project: string): string {
  return join(PROJECTS_DIR, project, "Epics");
}

/**
 * Get the next epic number by parsing existing epic filenames.
 * Returns 1 if no epics exist, or the next number after the highest existing epic number.
 */
function getNextEpicNumber(project: string): number {
  const epicsDir = getEpicsDir(project);
  if (!existsSync(epicsDir)) {
    return 1;
  }

  const files = readdirSync(epicsDir).filter((f) => f.endsWith(".md") && f.startsWith("Epic-"));
  
  if (files.length === 0) {
    return 1;
  }

  // Parse epic numbers from filenames like "Epic-1-Something.md" or "Epic-2-Another.md"
  const epicNumbers: number[] = [];
  for (const file of files) {
    const match = file.match(/^Epic-(\d+)-/);
    if (match) {
      epicNumbers.push(parseInt(match[1], 10));
    }
  }

  if (epicNumbers.length === 0) {
    return 1;
  }

  return Math.max(...epicNumbers) + 1;
}

function loadTemplate(templateName: string): string {
  const templatePath = join(PAI_DIR, "skills", "project-planning", "assets", templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return readFileSync(templatePath, "utf-8");
}

function loadProjectContext(project: string): string {
  const projectDir = join(PROJECTS_DIR, project);
  let context = "";

  // Load brief.md
  const briefPath = join(projectDir, "brief.md");
  if (existsSync(briefPath)) {
    const brief = readFileSync(briefPath, "utf-8");
    context += `## Project Brief\n\n${brief.substring(0, 500)}...\n\n`;
  }

  // Load PRD.md if exists
  const prdPath = join(projectDir, "PRD.md");
  if (existsSync(prdPath)) {
    const prd = readFileSync(prdPath, "utf-8");
    context += `## PRD (excerpt)\n\n${prd.substring(0, 500)}...\n\n`;
  }

  // Load brain.md for decisions
  const brainPath = join(projectDir, ".state", "brain.md");
  if (existsSync(brainPath)) {
    const brain = readFileSync(brainPath, "utf-8");
    context += `## Recent Decisions\n\n${brain.substring(0, 500)}...\n\n`;
  }

  // Find analysis/comparison documents
  const analysisFiles = ["Langfuse-Comparison-Analysis.md", "End-to-End-Test-Summary.md"];
  for (const file of analysisFiles) {
    const analysisPath = join(projectDir, file);
    if (existsSync(analysisPath)) {
      const analysis = readFileSync(analysisPath, "utf-8");
      context += `## ${file}\n\n${analysis.substring(0, 500)}...\n\n`;
      break; // Just include one analysis doc
    }
  }

  return context || "No project context found.";
}

function generateContentPrompt(
  project: string,
  epicPath: string,
  epicName: string,
  description: string
): string {
  const projectContext = loadProjectContext(project);
  const epicFileName = epicPath.split("/").pop() || epicPath;

  return `# Populate Epic Content

Please populate the epic file with complete, detailed content based on the description and project context.

## Epic File
\`${epicPath}\`

## Epic Details
- **Name:** ${epicName}
- **Description:** ${description}
- **Project:** ${project}

## Project Context
${projectContext}

## Instructions

Please fill in the following sections in the epic file (replace all TODO comments):

1. **Objectives** (3-5 clear, measurable objectives)
   - What are the main goals of this epic?
   - What outcomes should be achieved?

2. **User Stories** (list of related user stories)
   - Link to existing stories if they exist
   - Or describe stories that should be created

3. **Acceptance Criteria** (measurable criteria for epic completion)
   - What must be true for this epic to be considered complete?
   - Include both functional and non-functional criteria

4. **Dependencies** (technical and project dependencies)
   - What does this epic depend on?
   - What other epics/stories must be completed first?
   - Technical dependencies (libraries, services, etc.)

5. **Related PRD Sections** (links to relevant PRD sections)
   - Reference specific sections from PRD.md if applicable
   - Or note if PRD doesn't exist yet

6. **Notes** (implementation considerations, risks, etc.)
   - Technical considerations
   - Known risks or challenges
   - Implementation approach notes

## Guidelines

- Be specific and actionable
- Use the project context to inform decisions
- Reference existing decisions from brain.md
- Consider tech stack constraints from constraints.yaml
- Make acceptance criteria measurable and testable
- Link to related documents where relevant

## Output Format

Edit the epic file directly, replacing all \`<!-- TODO: ... -->\` comments with actual content.
Keep the frontmatter and structure intact.
`;
}

function generatePromptFile(project: string, epicPath: string, epicName: string, description: string): void {
  const prompt = generateContentPrompt(project, epicPath, epicName, description);
  const promptPath = epicPath.replace(".md", ".prompt.md");
  
  writeFileSync(promptPath, prompt, "utf-8");
  console.log(`\n💡 Content generation prompt saved to: ${promptPath}`);
}

function createEpic(project: string, epicName: string, description: string): void {
  const epicsDir = getEpicsDir(project);
  if (!existsSync(epicsDir)) {
    throw new Error(`Epics directory not found. Run WorkflowInit.ts first.`);
  }

  const epicNumber = getNextEpicNumber(project);
  const epicId = `EPIC-${Date.now()}`;
  const epicSlug = epicName.replace(/\s+/g, "-");
  const epicFileName = `Epic-${epicNumber}-${epicSlug}.md`;
  const epicPath = join(epicsDir, epicFileName);

  if (existsSync(epicPath)) {
    throw new Error(`Epic already exists: ${epicName}`);
  }

  const template = loadTemplate("EpicTemplate.md");
  const date = new Date().toISOString().split("T")[0];

  const epicContent = template
    .replace(/\{\{epicNumber\}\}/g, epicNumber.toString())
    .replace(/\{\{epicName\}\}/g, epicName)
    .replace(/\{\{epicId\}\}/g, epicId)
    .replace(/\{\{projectName\}\}/g, project)
    .replace(/\{\{status\}\}/g, "planned")
    .replace(/\{\{priority\}\}/g, "medium")
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{objectives\}\}/g, "<!-- TODO: Define epic objectives -->")
    .replace(/\{\{userStories\}\}/g, "<!-- TODO: Add user stories -->")
    .replace(/\{\{acceptanceCriteria\}\}/g, "<!-- TODO: Define acceptance criteria -->")
    .replace(/\{\{dependencies\}\}/g, "<!-- TODO: List dependencies -->")
    .replace(/\{\{prdSections\}\}/g, "<!-- TODO: Link to PRD sections -->")
    .replace(/\{\{notes\}\}/g, "<!-- TODO: Add notes -->");

  writeFileSync(epicPath, epicContent, "utf-8");
  console.log(`✓ Created epic: ${epicName} (${epicFileName})`);

  // Generate prompt file for content population
  generatePromptFile(project, epicPath, epicName, description);
}

function isEpicPopulated(epicPath: string): boolean {
  if (!existsSync(epicPath)) {
    return false;
  }
  
  const content = readFileSync(epicPath, "utf-8");
  // Check if there are any TODO comments remaining
  const todoPattern = /<!--\s*TODO:.*?-->/g;
  return !todoPattern.test(content);
}

function cleanupPromptFiles(project: string): void {
  const epicsDir = getEpicsDir(project);
  if (!existsSync(epicsDir)) {
    console.log("No epics directory found. Run WorkflowInit.ts first.");
    return;
  }

  const epicFiles = readdirSync(epicsDir).filter((f) => f.endsWith(".md") && f.startsWith("Epic-"));
  let cleanedCount = 0;
  
  epicFiles.forEach((file) => {
    const epicPath = join(epicsDir, file);
    const promptPath = epicPath.replace(".md", ".prompt.md");
    
    // Check if epic is populated and prompt file exists
    if (isEpicPopulated(epicPath) && existsSync(promptPath)) {
      unlinkSync(promptPath);
      console.log(`✓ Removed prompt file: ${file.replace(".md", ".prompt.md")}`);
      cleanedCount++;
    }
  });
  
  if (cleanedCount === 0) {
    console.log("No prompt files to clean up (all epics still have TODOs or prompts already removed).");
  } else {
    console.log(`\n✓ Cleaned up ${cleanedCount} prompt file(s).`);
  }
}

function listEpics(project: string): void {
  const epicsDir = getEpicsDir(project);
  if (!existsSync(epicsDir)) {
    console.log("No epics directory found. Run WorkflowInit.ts first.");
    return;
  }

  const files = readdirSync(epicsDir).filter((f) => f.endsWith(".md") && f.startsWith("Epic-"));
  
  if (files.length === 0) {
    console.log("No epics found.");
    return;
  }

  console.log(`\nEpics for project: ${project}`);
  console.log("=" .repeat(50));
  
  files.forEach((file, index) => {
    const epicPath = join(epicsDir, file);
    const content = readFileSync(epicPath, "utf-8");
    // Support both old format (# Epic: Name) and new format (# Epic-1: Name)
    const nameMatch = content.match(/# Epic(?:-\d+)?:\s*(.+)/);
    const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
    const priorityMatch = content.match(/\*\*Priority:\*\*\s*(.+)/);
    
    const name = nameMatch ? nameMatch[1] : file.replace(/^Epic-\d+-/, "").replace("Epic-", "").replace(".md", "");
    const status = statusMatch ? statusMatch[1] : "unknown";
    const priority = priorityMatch ? priorityMatch[1] : "unknown";
    
    console.log(`\n${index + 1}. ${name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Priority: ${priority}`);
    console.log(`   File: ${file}`);
  });
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
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
    !values.project ||
    !values.action ||
    !["create", "list", "update", "cleanup"].includes(values.action as string)
  ) {
    console.log(`
EpicManager - Epic Lifecycle Management

Usage:
  bun run EpicManager.ts --project <name> --action <create|list|update|cleanup> [options]

Options:
  --project <name>        Project name
  --action <action>       Action: create, list, update, or cleanup
  --epic <name>          Epic name (required for create/update)
  --description <desc>   Epic description (required for create)
  -h, --help             Show this help

Actions:
  create                  Create a new epic with skeleton content
  list                    List all epics for the project
  update                  Update an existing epic (not yet implemented)
  cleanup                 Remove .prompt.md files for fully populated epics

Examples:
  bun run EpicManager.ts --project my-app --action create --epic "Authentication" --description "User authentication and authorization"
  bun run EpicManager.ts --project my-app --action list
  bun run EpicManager.ts --project my-app --action cleanup
`);
    process.exit(values.help ? 0 : 1);
  }

  const project = values.project as string;
  const action = values.action as string;

  try {
    if (action === "create") {
      if (!values.epic || !values.description) {
        console.error("--epic and --description are required for create action");
        process.exit(1);
      }
      createEpic(project, values.epic as string, values.description as string);
    } else if (action === "list") {
      listEpics(project);
    } else if (action === "update") {
      console.log("Update action not yet implemented");
      process.exit(1);
    } else if (action === "cleanup") {
      cleanupPromptFiles(project);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
