#!/usr/bin/env bun

/**
 * Specify.ts - Generate project specifications
 *
 * Generates specifications, PRDs, technical plans, and constitutions.
 *
 * Usage:
 *   bun run Specify.ts --project <name> --type <spec|prd|plan|constitution> [--output <path>] [--source <path>]
 */

import { parseArgs } from "util";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { $ } from "bun";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";
const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const PROJECTS_DIR = join(KNOWLEDGE_DIR, "Projects");

interface SpecifyOptions {
  project: string;
  type: "spec" | "prd" | "plan" | "constitution";
  output?: string;
  source?: string;
}

function getTemplatePath(type: string): string {
  const templatesDir = join(PAI_DIR, "skills", "specification", "assets");
  const templateMap: Record<string, string> = {
    spec: "SpecTemplate.md",
    prd: "PRDTemplate.md",
    plan: "PlanTemplate.md",
    constitution: "ConstitutionTemplate.md",
  };
  return join(templatesDir, templateMap[type] || templateMap.spec);
}

function getDefaultOutputPath(project: string, type: string): string {
  const projectDir = join(PROJECTS_DIR, project);
  const outputMap: Record<string, string> = {
    spec: join(projectDir, "specs", "spec.md"),
    prd: join(projectDir, "PRD.md"),
    plan: join(projectDir, "Plan.md"),
    constitution: join(projectDir, "CONSTITUTION.md"),
  };
  return outputMap[type] || outputMap.spec;
}

function loadTemplate(templatePath: string): string {
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return readFileSync(templatePath, "utf-8");
}

function generateContent(
  template: string,
  project: string,
  type: string,
  source?: string
): string {
  const date = new Date().toISOString().split("T")[0];
  const version = "1.0.0";

  let content = template
    .replace(/\{\{projectName\}\}/g, project)
    .replace(/\{\{productName\}\}/g, project)
    .replace(/\{\{version\}\}/g, version)
    .replace(/\{\{date\}\}/g, date);

  if (type === "plan" && source) {
    content = content.replace(/\{\{sourceDocument\}\}/g, source);
  }

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const body = frontmatterMatch[2];
    const processedBody = body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return `<!-- TODO: Fill in ${key} -->\n\n`;
    });
    return `---\n${frontmatter}\n---\n\n${processedBody}`;
  } else {
    content = content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return `<!-- TODO: Fill in ${key} -->\n\n`;
    });
  }

  return content;
}

async function ensureProjectDir(project: string): Promise<void> {
  const projectDir = join(PROJECTS_DIR, project);
  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
    console.log(`✓ Created project directory: ${projectDir}`);
  }
  const specsDir = join(projectDir, "specs");
  if (!existsSync(specsDir)) {
    mkdirSync(specsDir, { recursive: true });
  }
}

async function initializeVersionControl(projectDir: string): Promise<void> {
  const gitDir = join(projectDir, ".git");
  if (!existsSync(gitDir)) {
    try {
      await $`cd ${projectDir} && git init`.quiet();
      console.log(`✓ Initialized git repository`);
    } catch (error) {
      console.warn(`Warning: Could not initialize git: ${error}`);
    }
  }
}

async function specify(options: SpecifyOptions): Promise<void> {
  const { project, type, output, source } = options;
  const templatePath = getTemplatePath(type);
  const template = loadTemplate(templatePath);
  const content = generateContent(template, project, type, source);
  const outputPath = output || getDefaultOutputPath(project, type);
  await ensureProjectDir(project);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content, "utf-8");
  console.log(`✓ Generated ${type} at: ${outputPath}`);
  const projectDir = join(PROJECTS_DIR, project);
  await initializeVersionControl(projectDir);
  console.log(`\n💡 Next steps:`);
  console.log(`  1. Edit ${outputPath} to fill in the placeholders`);
  console.log(`  2. Run ValidateSpec.ts to check completeness`);
  if (type === "spec" || type === "prd") {
    console.log(`  3. Use ProjectPlanning skill to shard into epics/stories`);
  }
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      type: { type: "string" },
      output: { type: "string", short: "o" },
      source: { type: "string", short: "s" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (
    values.help ||
    !values.project ||
    !values.type ||
    !["spec", "prd", "plan", "constitution"].includes(values.type as string)
  ) {
    console.log(`
Specify - Generate Project Specifications

Usage:
  bun run Specify.ts --project <name> --type <spec|prd|plan|constitution> [options]

Options:
  --project <name>        Project name
  --type <type>           Document type: spec, prd, plan, or constitution
  -o, --output <path>     Output file path (optional)
  -s, --source <path>     Source document for plan generation (required for plan type)
  -h, --help              Show this help
`);
    process.exit(values.help ? 0 : 1);
  }

  specify({
    project: values.project as string,
    type: values.type as "spec" | "prd" | "plan" | "constitution",
    output: values.output as string | undefined,
    source: values.source as string | undefined,
  }).catch((error) => {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  });
}

if (import.meta.main) {
  main();
}
