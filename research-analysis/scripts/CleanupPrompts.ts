#!/usr/bin/env bun

/**
 * CleanupPrompts.ts - Clean up .prompt.md files for research topics
 *
 * Removes .prompt.md files after research documents have been fully populated.
 * Uses shared DocumentationUtils for consistency.
 *
 * Usage:
 *   bun run CleanupPrompts.ts --category <category> [--topic <topic-name>]
 */

import { parseArgs } from "util";
import { existsSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { cleanupPrompts, isPopulated } from "../../../Tools/DocumentationUtils";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const TOPICS_DIR = join(KNOWLEDGE_DIR, "Topics");

function cleanupCategory(category: string, topic?: string): void {
  const categoryDir = join(TOPICS_DIR, category);
  
  if (!existsSync(categoryDir)) {
    console.error(`Category directory not found: ${categoryDir}`);
    process.exit(1);
  }

  if (topic) {
    // Cleanup specific topic
    const topicPath = join(categoryDir, `${topic}.md`);
    const promptPath = join(categoryDir, `${topic}.prompt.md`);
    
    if (existsSync(topicPath) && existsSync(promptPath) && isPopulated(topicPath)) {
      unlinkSync(promptPath);
      console.log(`✓ Removed prompt for topic: ${topic}`);
    } else if (existsSync(promptPath) && !isPopulated(topicPath)) {
      console.log(`⚠ Topic "${topic}" still has TODO comments, keeping prompt file`);
    }
  } else {
    // Cleanup all topics in category
    const result = cleanupPrompts(categoryDir);
    
    if (result.cleaned === 0) {
      console.log(`No prompt files to clean up in category: ${category}`);
    } else {
      console.log(`\n✓ Cleaned up ${result.cleaned} prompt file(s) in category: ${category}`);
      result.files.forEach((file) => {
        console.log(`  - ${file}`);
      });
    }
  }
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      category: { type: "string" },
      topic: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help || !values.category) {
    console.log(`
CleanupPrompts - Remove .prompt.md files for populated research topics

Usage:
  bun run CleanupPrompts.ts --category <category> [--topic <topic-name>]

Options:
  --category <name>     Category name (e.g., AI, PAI, Security)
  --topic <name>        Optional: specific topic to cleanup
  -h, --help           Show this help

Examples:
  # Cleanup all prompts in AI category
  bun run CleanupPrompts.ts --category AI

  # Cleanup specific topic
  bun run CleanupPrompts.ts --category AI --topic "Langfuse deep research"
`);
    process.exit(values.help ? 0 : 1);
  }

  try {
    cleanupCategory(values.category as string, values.topic as string | undefined);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
