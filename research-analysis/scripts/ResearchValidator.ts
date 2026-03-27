#!/usr/bin/env bun

/**
 * ResearchValidator.ts - Validates research completeness
 *
 * Checks research documents for completeness and quality.
 *
 * Usage:
 *   bun run ResearchValidator.ts --topic <topic-path> [--strict]
 */

import { parseArgs } from "util";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const TOPICS_DIR = join(KNOWLEDGE_DIR, "Topics");

interface ResearchValidatorOptions {
  topic: string;
  strict?: boolean;
}

function getTopicPath(topic: string): string {
  // If topic is just a name, search for it
  if (!topic.includes("/")) {
    const { readdirSync, statSync } = require("fs");
    if (!existsSync(TOPICS_DIR)) {
      throw new Error("Topics directory does not exist");
    }

    const categories = readdirSync(TOPICS_DIR).filter((item: string) => {
      const itemPath = join(TOPICS_DIR, item);
      return statSync(itemPath).isDirectory();
    });

    for (const cat of categories) {
      const topicPath = join(TOPICS_DIR, cat, `${topic}.md`);
      if (existsSync(topicPath)) {
        return topicPath;
      }
    }

    throw new Error(`Topic not found: ${topic}`);
  }

  // If topic is a path, resolve it
  if (topic.startsWith("/")) {
    return topic;
  }

  // Relative path from Topics directory
  return join(TOPICS_DIR, topic);
}

function validateResearch(topicPath: string, strict: boolean = false): {
  valid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(topicPath)) {
    return {
      valid: false,
      issues: [`Topic file not found: ${topicPath}`],
      warnings: [],
    };
  }

  const content = readFileSync(topicPath, "utf-8");

  // Check for required sections based on research type
  const requiredSections = [
    "Executive Summary",
    "Research Handoff",
  ];

  // Check for template placeholders
  const placeholderMatches = content.match(/\{\{(\w+)\}\}/g);
  if (placeholderMatches) {
    issues.push(`Found ${placeholderMatches.length} unresolved template placeholders`);
    if (strict) {
      placeholderMatches.forEach((placeholder) => {
        issues.push(`  - ${placeholder}`);
      });
    }
  }

  // Check for TODO comments
  const todoMatches = content.match(/<!-- TODO:.*?-->/g);
  if (todoMatches) {
    warnings.push(`Found ${todoMatches.length} TODO comments`);
    if (strict) {
      todoMatches.forEach((todo) => {
        warnings.push(`  - ${todo}`);
      });
    }
  }

  // Check for required sections (allow numbered sections like "## 1. Executive Summary")
  requiredSections.forEach((section) => {
    // Match "## Section" or "## 1. Section" or "## 7. Section"
    const escapedSection = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sectionRegex = new RegExp(`##+\\s+(?:\\d+\\.\\s+)?${escapedSection}`, "i");
    if (!sectionRegex.test(content)) {
      issues.push(`Missing required section: ${section}`);
    }
  });

  // Check for role-based handoff sections (allow numbered sections)
  const handoffRoles = ["Architect", "UX Designer", "PM"];
  const hasHandoff = /##+\s+(?:\d+\.\s+)?Research Handoff/i.test(content) || content.includes("### For Architect");
  if (!hasHandoff) {
    warnings.push("Research Handoff section may be incomplete");
  } else {
    handoffRoles.forEach((role) => {
      const roleRegex = new RegExp(`### For ${role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
      if (!roleRegex.test(content)) {
        warnings.push(`Missing handoff section for: ${role}`);
      }
    });
  }

  // Check for references
  if (!content.includes("## References") && !content.includes("## 8. References")) {
    warnings.push("References section may be missing");
  }

  // Check minimum content length
  const contentLength = content.replace(/^---[\s\S]*?---\n\n/, "").trim().length;
  if (contentLength < 500) {
    warnings.push("Research document seems too short (less than 500 characters)");
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      topic: { type: "string", required: true },
      strict: { type: "boolean" },
    },
  });

  const options = values as unknown as ResearchValidatorOptions;

  if (!options.topic) {
    console.error("Error: --topic is required");
    console.error("Usage: bun run ResearchValidator.ts --topic <topic-path> [--strict]");
    process.exit(1);
  }

  try {
    const topicPath = getTopicPath(options.topic);
    const result = validateResearch(topicPath, options.strict || false);

    console.log(`\n📋 Validation Results for: ${topicPath}\n`);

    if (result.valid) {
      console.log("✓ Research document is valid");
    } else {
      console.log("✗ Research document has issues:");
      result.issues.forEach((issue) => {
        console.log(`  - ${issue}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      result.warnings.forEach((warning) => {
        console.log(`  - ${warning}`);
      });
    }

    if (!result.valid) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch(console.error);
