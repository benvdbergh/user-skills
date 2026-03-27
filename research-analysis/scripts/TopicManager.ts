#!/usr/bin/env bun

/**
 * TopicManager.ts - Manages research topic lifecycle
 *
 * Handles topic lookup, creation, categorization, and listing.
 *
 * Usage:
 *   bun run TopicManager.ts --action <lookup|create|list|categorize> --topic <name> [--category <category>]
 */

import { parseArgs } from "util";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const TOPICS_DIR = join(KNOWLEDGE_DIR, "Topics");

interface TopicManagerOptions {
  action: "lookup" | "create" | "list" | "categorize";
  topic: string;
  category?: string;
}

function getCategoryDir(category: string): string {
  return join(TOPICS_DIR, category);
}

function getTopicPath(category: string, topic: string): string {
  return join(getCategoryDir(category), `${topic}.md`);
}

function topicLookup(topic: string, category?: string): void {
  if (category) {
    const topicPath = getTopicPath(category, topic);
    if (existsSync(topicPath)) {
      console.log(`✓ Topic found: ${topicPath}`);
      console.log(`  Reference: [${topic}](../../Topics/${category}/${encodeURIComponent(topic)}.md)`);
      return;
    }
  } else {
    // Search all categories
    if (!existsSync(TOPICS_DIR)) {
      console.log("✗ Topics directory does not exist");
      return;
    }

    const categories = readdirSync(TOPICS_DIR).filter((item) => {
      const itemPath = join(TOPICS_DIR, item);
      return statSync(itemPath).isDirectory();
    });

    for (const cat of categories) {
      const topicPath = getTopicPath(cat, topic);
      if (existsSync(topicPath)) {
        console.log(`✓ Topic found: ${topicPath}`);
        console.log(`  Category: ${cat}`);
        console.log(`  Reference: [${topic}](../../Topics/${cat}/${encodeURIComponent(topic)}.md)`);
        return;
      }
    }
  }

  console.log(`✗ Topic not found: ${topic}`);
  if (category) {
    console.log(`  Category: ${category}`);
  } else {
    console.log(`  Searched all categories`);
  }
  console.log(`  Suggestion: Create new research topic`);
}

function topicList(category?: string): void {
  if (!existsSync(TOPICS_DIR)) {
    console.log("Topics directory does not exist");
    return;
  }

  if (category) {
    const categoryDir = getCategoryDir(category);
    if (!existsSync(categoryDir)) {
      console.log(`Category does not exist: ${category}`);
      return;
    }

    const topics = readdirSync(categoryDir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(".md", ""));

    if (topics.length === 0) {
      console.log(`No topics found in category: ${category}`);
      return;
    }

    console.log(`Topics in category "${category}":`);
    topics.forEach((topic) => {
      console.log(`  - ${topic}`);
    });
  } else {
    const categories = readdirSync(TOPICS_DIR).filter((item) => {
      const itemPath = join(TOPICS_DIR, item);
      return statSync(itemPath).isDirectory();
    });

    if (categories.length === 0) {
      console.log("No categories found");
      return;
    }

    console.log("All topics by category:");
    for (const cat of categories) {
      const categoryDir = getCategoryDir(cat);
      const topics = readdirSync(categoryDir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(".md", ""));

      if (topics.length > 0) {
        console.log(`\n${cat}:`);
        topics.forEach((topic) => {
          console.log(`  - ${topic}`);
        });
      }
    }
  }
}

function topicCategorize(topic: string): void {
  // Suggest category based on topic name
  const topicLower = topic.toLowerCase();

  const categoryHints: Record<string, string[]> = {
    AI: ["ai", "ml", "machine learning", "llm", "langchain", "langfuse", "agent"],
    PAI: ["pai", "personal ai", "claude code"],
    Security: ["security", "auth", "encryption", "oauth", "jwt"],
    DevOps: ["devops", "ci/cd", "docker", "kubernetes", "deployment", "infrastructure"],
    Frontend: ["react", "vue", "angular", "frontend", "ui", "ux"],
    Backend: ["backend", "api", "server", "database", "postgres", "mysql"],
  };

  const suggestions: string[] = [];

  for (const [category, keywords] of Object.entries(categoryHints)) {
    if (keywords.some((keyword) => topicLower.includes(keyword))) {
      suggestions.push(category);
    }
  }

  if (suggestions.length > 0) {
    console.log(`Suggested categories for "${topic}":`);
    suggestions.forEach((cat) => {
      console.log(`  - ${cat}`);
    });
    console.log(`\nRecommended: ${suggestions[0]}`);
  } else {
    console.log(`No category suggestions for "${topic}"`);
    console.log(`Available categories: AI, PAI, Security, DevOps, Frontend, Backend`);
    console.log(`Use --category to specify manually`);
  }
}

function topicCreate(topic: string, category: string): void {
  const categoryDir = getCategoryDir(category);
  const topicPath = getTopicPath(category, topic);

  if (existsSync(topicPath)) {
    console.log(`✗ Topic already exists: ${topicPath}`);
    console.log(`  Use lookup to get reference link`);
    return;
  }

  // Create category directory if it doesn't exist
  if (!existsSync(categoryDir)) {
    const { mkdirSync } = require("fs");
    mkdirSync(categoryDir, { recursive: true });
    console.log(`✓ Created category directory: ${categoryDir}`);
  }

  console.log(`✓ Topic path ready: ${topicPath}`);
  console.log(`  Category: ${category}`);
  console.log(`  Use ResearchOrchestrator to conduct research and create topic`);
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      action: { type: "string", required: true },
      topic: { type: "string" },
      category: { type: "string" },
    },
  });

  const options = values as unknown as TopicManagerOptions;

  if (!options.action) {
    console.error("Error: --action is required");
    console.error("Usage: bun run TopicManager.ts --action <lookup|create|list|categorize> --topic <name> [--category <category>]");
    process.exit(1);
  }

  switch (options.action) {
    case "lookup":
      if (!options.topic) {
        console.error("Error: --topic is required for lookup");
        process.exit(1);
      }
      topicLookup(options.topic, options.category);
      break;

    case "list":
      topicList(options.category);
      break;

    case "categorize":
      if (!options.topic) {
        console.error("Error: --topic is required for categorize");
        process.exit(1);
      }
      topicCategorize(options.topic);
      break;

    case "create":
      if (!options.topic || !options.category) {
        console.error("Error: --topic and --category are required for create");
        process.exit(1);
      }
      topicCreate(options.topic, options.category);
      break;

    default:
      console.error(`Unknown action: ${options.action}`);
      console.error("Valid actions: lookup, list, categorize, create");
      process.exit(1);
  }
}

main().catch(console.error);
