#!/usr/bin/env bun

/**
 * ResearchOrchestrator.ts - Coordinates parallel research agents
 *
 * Orchestrates research execution, checks for existing topics, and coordinates
 * multiple research agents for comprehensive analysis.
 *
 * Usage:
 *   bun run ResearchOrchestrator.ts --topic <name> --category <category> --type <deep|market|technical|comparison> [--options <option1,option2>]
 */

import { parseArgs } from "util";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { $ } from "bun";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const TOPICS_DIR = join(KNOWLEDGE_DIR, "Topics");
const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

interface ResearchOrchestratorOptions {
  topic: string;
  category: string;
  type: "deep" | "market" | "technical" | "comparison";
  options?: string;
}

function getCategoryDir(category: string): string {
  return join(TOPICS_DIR, category);
}

function getTopicPath(category: string, topic: string): string {
  return join(getCategoryDir(category), `${topic}.md`);
}

function getTemplatePath(type: string): string {
  const templatesDir = join(PAI_DIR, "skills", "ResearchAnalysis", "Templates");
  const templateMap: Record<string, string> = {
    deep: "DeepResearchTemplate.md",
    market: "MarketResearchTemplate.md",
    technical: "TechnicalAnalysisTemplate.md",
    comparison: "ComparisonTemplate.md",
  };
  return join(templatesDir, templateMap[type] || templateMap.deep);
}

function checkTopicExists(category: string, topic: string): boolean {
  const topicPath = getTopicPath(category, topic);
  return existsSync(topicPath);
}

function loadTemplate(templatePath: string): string {
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return readFileSync(templatePath, "utf-8");
}

function generateResearchPrompt(
  topic: string,
  category: string,
  type: string,
  options?: string
): string {
  const date = new Date().toISOString().split("T")[0];
  const template = loadTemplate(getTemplatePath(type));

  // Basic replacements
  let prompt = `# Research Task: ${topic}

**Category:** ${category}
**Research Type:** ${type}
**Date:** ${date}

## Instructions

Please conduct comprehensive research on "${topic}" following the template structure below.

${options ? `**Comparison Options:** ${options}\n` : ""}

## Template Structure

${template}

## Research Guidelines

1. **Comprehensive Coverage**: Fill in all sections of the template
2. **Role-Based Handoff**: Include findings for Architect, UX Designer, and PM roles
3. **Technical Depth**: Provide detailed technical information where applicable
4. **References**: Include links to documentation, resources, and related topics
5. **Quality**: Ensure research is accurate, up-to-date, and actionable

## Output

Generate a complete research document following the template structure.
Replace all template placeholders ({{...}}) with actual research content.
`;

  return prompt;
}

async function orchestrateResearch(
  topic: string,
  category: string,
  type: string,
  options?: string
): Promise<void> {
  // Check if topic already exists
  if (checkTopicExists(category, topic)) {
    const topicPath = getTopicPath(category, topic);
    console.log(`✓ Topic already exists: ${topicPath}`);
    console.log(`  Use TopicManager --action lookup to get reference`);
    return;
  }

  // Create category directory if it doesn't exist
  const categoryDir = getCategoryDir(category);
  if (!existsSync(categoryDir)) {
    mkdirSync(categoryDir, { recursive: true });
    console.log(`✓ Created category directory: ${categoryDir}`);
  }

  // Generate research prompt
  const prompt = generateResearchPrompt(topic, category, type, options);
  const promptPath = getTopicPath(category, topic).replace(".md", ".prompt.md");
  writeFileSync(promptPath, prompt, "utf-8");

  console.log(`✓ Research prompt generated: ${promptPath}`);
  console.log(`\n📋 Next Steps:`);
  console.log(`  1. Review the prompt: ${promptPath}`);
  console.log(`  2. Use research agents (technical-analyst, market-researcher, competitive-analyst)`);
  console.log(`  3. Conduct research following the template structure`);
  console.log(`  4. Use ResearchSynthesizer to combine findings`);
  console.log(`  5. Use ResearchValidator to validate completeness`);
  console.log(`  6. Save final research to: ${getTopicPath(category, topic)}`);

  // Determine which agents to spawn
  const agents: string[] = [];
  switch (type) {
    case "deep":
      agents.push("technical-analyst", "market-researcher");
      break;
    case "market":
      agents.push("market-researcher", "competitive-analyst");
      break;
    case "technical":
      agents.push("technical-analyst");
      break;
    case "comparison":
      agents.push("competitive-analyst");
      break;
  }

  if (agents.length > 0) {
    console.log(`\n🤖 Recommended Agents:`);
    agents.forEach((agent) => {
      console.log(`  - ${agent}`);
    });
    console.log(`\n  Use Agents skill to spawn these agents for parallel research`);
  }
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      topic: { type: "string", required: true },
      category: { type: "string", required: true },
      type: { type: "string", required: true },
      options: { type: "string" },
    },
  });

  const options = values as unknown as ResearchOrchestratorOptions;

  if (!options.topic || !options.category || !options.type) {
    console.error("Error: --topic, --category, and --type are required");
    console.error("Usage: bun run ResearchOrchestrator.ts --topic <name> --category <category> --type <deep|market|technical|comparison> [--options <option1,option2>]");
    process.exit(1);
  }

  if (!["deep", "market", "technical", "comparison"].includes(options.type)) {
    console.error(`Error: Invalid type: ${options.type}`);
    console.error("Valid types: deep, market, technical, comparison");
    process.exit(1);
  }

  try {
    await orchestrateResearch(options.topic, options.category, options.type, options.options);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch(console.error);
