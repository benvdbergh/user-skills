#!/usr/bin/env bun

/**
 * StoryManager.ts - Story tracking
 *
 * Create, list, and update user stories.
 *
 * Usage:
 *   bun run StoryManager.ts --project <name> --action <create|list|update> [options]
 */

import { parseArgs } from "util";
import { existsSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const PROJECTS_DIR = join(KNOWLEDGE_DIR, "Projects");
const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

function getStoriesDir(project: string): string {
  return join(PROJECTS_DIR, project, "Stories");
}

/**
 * Get the epic number from an epic name by reading epic files.
 * Returns the epic number if found, or throws an error if epic doesn't exist.
 */
function getEpicNumber(project: string, epicName: string): number {
  const epicsDir = join(PROJECTS_DIR, project, "Epics");
  if (!existsSync(epicsDir)) {
    throw new Error(`Epics directory not found. Run WorkflowInit.ts first.`);
  }

  const files = readdirSync(epicsDir).filter((f) => f.endsWith(".md") && f.startsWith("Epic-"));
  
  // Try to find epic by name in the file content
  for (const file of files) {
    const epicPath = join(epicsDir, file);
    const content = readFileSync(epicPath, "utf-8");
    const nameMatch = content.match(/# Epic:\s*(.+)/);
    
    if (nameMatch && nameMatch[1].trim() === epicName) {
      // Extract number from filename
      const match = file.match(/^Epic-(\d+)-/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
  }

  // Fallback: try to find by filename slug
  const epicSlug = epicName.replace(/\s+/g, "-");
  for (const file of files) {
    if (file.includes(epicSlug)) {
      const match = file.match(/^Epic-(\d+)-/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
  }

  throw new Error(`Epic not found: ${epicName}`);
}

/**
 * Get the next story number for a given epic by parsing existing story filenames.
 * Returns 1 if no stories exist for this epic, or the next number after the highest existing story number.
 */
function getNextStoryNumber(project: string, epicNumber: number): number {
  const storiesDir = getStoriesDir(project);
  if (!existsSync(storiesDir)) {
    return 1;
  }

  const files = readdirSync(storiesDir).filter((f) => f.endsWith(".md") && f.startsWith("Story-"));
  
  // Parse story numbers for this epic from filenames like "Story-1-1-Something.md" or "Story-1-2-Another.md"
  const storyNumbers: number[] = [];
  for (const file of files) {
    const match = file.match(/^Story-(\d+)-(\d+)-/);
    if (match) {
      const fileEpicNumber = parseInt(match[1], 10);
      if (fileEpicNumber === epicNumber) {
        storyNumbers.push(parseInt(match[2], 10));
      }
    }
  }

  if (storyNumbers.length === 0) {
    return 1;
  }

  return Math.max(...storyNumbers) + 1;
}

function loadTemplate(templateName: string): string {
  const templatePath = join(PAI_DIR, "skills", "project-planning", "assets", templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return readFileSync(templatePath, "utf-8");
}

function loadProjectContext(project: string, epicName?: string): string {
  const projectDir = join(PROJECTS_DIR, project);
  let context = "";

  // Load brief.md
  const briefPath = join(projectDir, "brief.md");
  if (existsSync(briefPath)) {
    const brief = readFileSync(briefPath, "utf-8");
    context += `## Project Brief\n\n${brief.substring(0, 300)}...\n\n`;
  }

  // Load parent epic if specified
  if (epicName) {
    const epicPath = join(projectDir, "Epics", `Epic-${epicName.replace(/\s+/g, "-")}.md`);
    if (existsSync(epicPath)) {
      const epic = readFileSync(epicPath, "utf-8");
      context += `## Parent Epic: ${epicName}\n\n${epic.substring(0, 500)}...\n\n`;
    }
  }

  // Load constraints
  const constraintsPath = join(projectDir, ".state", "constraints.yaml");
  if (existsSync(constraintsPath)) {
    const constraints = readFileSync(constraintsPath, "utf-8");
    context += `## Tech Stack Constraints\n\n\`\`\`yaml\n${constraints}\n\`\`\`\n\n`;
  }

  return context || "No project context found.";
}

function generateContentPrompt(
  project: string,
  storyPath: string,
  storyName: string,
  epicName: string,
  description: string
): string {
  const projectContext = loadProjectContext(project, epicName);
  const storyFileName = storyPath.split("/").pop() || storyPath;

  return `# Populate Story Content

Please populate the story file with complete, detailed content based on the description, epic context, and project constraints.

## Story File
\`${storyPath}\`

## Story Details
- **Name:** ${storyName}
- **Epic:** ${epicName}
- **Description:** ${description}
- **Project:** ${project}

## Project Context
${projectContext}

## Instructions

Please fill in the following sections in the story file (replace all TODO comments):

1. **User Story** (As a... I want... So that...)
   - **User Type:** Who is the user? (e.g., "PAI administrator", "end user", "developer")
   - **Action:** What do they want to do? (be specific and actionable)
   - **Benefit:** Why do they want this? (the value/outcome)

2. **Acceptance Criteria** (measurable criteria for story completion)
   - What must be true for this story to be considered complete?
   - Use checkboxes format: \`- [ ] Criterion 1\`
   - Make criteria testable and specific
   - Include both happy path and edge cases

3. **Technical Notes** (implementation details)
   - Technical approach
   - Key files/components to modify
   - Data structures or APIs needed
   - Integration points
   - Performance considerations

4. **Dependencies** (what this story depends on)
   - Other stories that must be completed first
   - Technical dependencies (libraries, services)
   - Infrastructure requirements

5. **Related Stories** (links to related stories)
   - Stories that should be implemented together
   - Stories that depend on this one
   - Related stories in the same epic

6. **Notes** (additional considerations)
   - Risks or challenges
   - Alternative approaches considered
   - Future enhancements
   - Testing considerations

## Guidelines

- Follow the tech stack constraints (use Bun, Vue 3, TypeScript - avoid Node.js, React, Express)
- Be specific and implementation-ready
- Reference the parent epic's objectives
- Make acceptance criteria testable (can be verified with tests)
- Consider the existing codebase structure
- Link to related stories in the same epic

## Output Format

Edit the story file directly, replacing all \`<!-- TODO: ... -->\` comments with actual content.
Keep the frontmatter and structure intact.
Use proper markdown formatting.
`;
}

function generatePromptFile(
  project: string,
  storyPath: string,
  storyName: string,
  epicName: string,
  description: string
): void {
  const prompt = generateContentPrompt(project, storyPath, storyName, epicName, description);
  const promptPath = storyPath.replace(".md", ".prompt.md");
  
  writeFileSync(promptPath, prompt, "utf-8");
  console.log(`\n💡 Content generation prompt saved to: ${promptPath}`);
}

function createStory(project: string, storyName: string, epicName: string, description: string): void {
  const storiesDir = getStoriesDir(project);
  if (!existsSync(storiesDir)) {
    throw new Error(`Stories directory not found. Run WorkflowInit.ts first.`);
  }

  // Get epic number from epic name
  const epicNumber = getEpicNumber(project, epicName);
  const storyNumber = getNextStoryNumber(project, epicNumber);
  
  const storyId = `STORY-${Date.now()}`;
  const storySlug = storyName.replace(/\s+/g, "-");
  const storyFileName = `Story-${epicNumber}-${storyNumber}-${storySlug}.md`;
  const storyPath = join(storiesDir, storyFileName);

  if (existsSync(storyPath)) {
    throw new Error(`Story already exists: ${storyName}`);
  }

  const template = loadTemplate("StoryTemplate.md");
  const date = new Date().toISOString().split("T")[0];

  const storyContent = template
    .replace(/\{\{epicNumber\}\}/g, epicNumber.toString())
    .replace(/\{\{storyNumber\}\}/g, storyNumber.toString())
    .replace(/\{\{storyName\}\}/g, storyName)
    .replace(/\{\{storyId\}\}/g, storyId)
    .replace(/\{\{epicName\}\}/g, epicName)
    .replace(/\{\{projectName\}\}/g, project)
    .replace(/\{\{status\}\}/g, "planned")
    .replace(/\{\{priority\}\}/g, "medium")
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{userType\}\}/g, "user")
    .replace(/\{\{action\}\}/g, "<!-- TODO: Define action -->")
    .replace(/\{\{benefit\}\}/g, "<!-- TODO: Define benefit -->")
    .replace(/\{\{acceptanceCriteria\}\}/g, "<!-- TODO: Define acceptance criteria -->")
    .replace(/\{\{technicalNotes\}\}/g, "<!-- TODO: Add technical notes -->")
    .replace(/\{\{dependencies\}\}/g, "<!-- TODO: List dependencies -->")
    .replace(/\{\{relatedStories\}\}/g, "<!-- TODO: Link related stories -->")
    .replace(/\{\{notes\}\}/g, "<!-- TODO: Add notes -->");

  writeFileSync(storyPath, storyContent, "utf-8");
  console.log(`✓ Created story: ${storyName} (${storyFileName})`);

  // Generate prompt file for content population
  generatePromptFile(project, storyPath, storyName, epicName, description);
}

function isStoryPopulated(storyPath: string): boolean {
  if (!existsSync(storyPath)) {
    return false;
  }
  
  const content = readFileSync(storyPath, "utf-8");
  // Check if there are any TODO comments remaining
  const todoPattern = /<!--\s*TODO:.*?-->/g;
  return !todoPattern.test(content);
}

function cleanupPromptFiles(project: string): void {
  const storiesDir = getStoriesDir(project);
  if (!existsSync(storiesDir)) {
    console.log("No stories directory found. Run WorkflowInit.ts first.");
    return;
  }

  const storyFiles = readdirSync(storiesDir).filter((f) => f.endsWith(".md") && f.startsWith("Story-"));
  let cleanedCount = 0;
  
  storyFiles.forEach((file) => {
    const storyPath = join(storiesDir, file);
    const promptPath = storyPath.replace(".md", ".prompt.md");
    
    // Check if story is populated and prompt file exists
    if (isStoryPopulated(storyPath) && existsSync(promptPath)) {
      unlinkSync(promptPath);
      console.log(`✓ Removed prompt file: ${file.replace(".md", ".prompt.md")}`);
      cleanedCount++;
    }
  });
  
  if (cleanedCount === 0) {
    console.log("No prompt files to clean up (all stories still have TODOs or prompts already removed).");
  } else {
    console.log(`\n✓ Cleaned up ${cleanedCount} prompt file(s).`);
  }
}

function listStories(project: string): void {
  const storiesDir = getStoriesDir(project);
  if (!existsSync(storiesDir)) {
    console.log("No stories directory found. Run WorkflowInit.ts first.");
    return;
  }

  const files = readdirSync(storiesDir).filter((f) => f.endsWith(".md") && f.startsWith("Story-"));
  
  if (files.length === 0) {
    console.log("No stories found.");
    return;
  }

  console.log(`\nStories for project: ${project}`);
  console.log("=" .repeat(50));
  
  files.forEach((file, index) => {
    const storyPath = join(storiesDir, file);
    const content = readFileSync(storyPath, "utf-8");
    // Support both old format (# Story: Name) and new format (# Story-1-1: Name)
    const nameMatch = content.match(/# Story(?:-\d+-\d+)?:\s*(.+)/);
    const epicMatch = content.match(/\*\*Epic:\*\*\s*(.+)/);
    const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
    
    const name = nameMatch ? nameMatch[1] : file.replace(/^Story-\d+-\d+-/, "").replace("Story-", "").replace(".md", "");
    const epic = epicMatch ? epicMatch[1] : "unknown";
    const status = statusMatch ? statusMatch[1] : "unknown";
    
    console.log(`\n${index + 1}. ${name}`);
    console.log(`   Epic: ${epic}`);
    console.log(`   Status: ${status}`);
    console.log(`   File: ${file}`);
  });
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
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
    !values.project ||
    !values.action ||
    !["create", "list", "update", "cleanup"].includes(values.action as string)
  ) {
    console.log(`
StoryManager - Story Tracking

Usage:
  bun run StoryManager.ts --project <name> --action <create|list|update|cleanup> [options]

Options:
  --project <name>        Project name
  --action <action>       Action: create, list, update, or cleanup
  --story <name>         Story name (required for create/update)
  --epic <name>          Epic name (required for create)
  --description <desc>   Story description (required for create)
  -h, --help             Show this help

Actions:
  create                  Create a new story with skeleton content
  list                    List all stories for the project
  update                  Update an existing story (not yet implemented)
  cleanup                 Remove .prompt.md files for fully populated stories

Examples:
  bun run StoryManager.ts --project my-app --action create --story "User Login" --epic "Authentication" --description "User can log in with email and password"
  bun run StoryManager.ts --project my-app --action list
  bun run StoryManager.ts --project my-app --action cleanup
`);
    process.exit(values.help ? 0 : 1);
  }

  const project = values.project as string;
  const action = values.action as string;

  try {
    if (action === "create") {
      if (!values.story || !values.epic || !values.description) {
        console.error("--story, --epic, and --description are required for create action");
        process.exit(1);
      }
      createStory(project, values.story as string, values.epic as string, values.description as string);
    } else if (action === "list") {
      listStories(project);
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
