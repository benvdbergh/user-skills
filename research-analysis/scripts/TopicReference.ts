#!/usr/bin/env bun

/**
 * TopicReference.ts - Generates topic references for project documents
 *
 * Creates markdown reference links from project documents to research topics.
 *
 * Usage:
 *   bun run TopicReference.ts --topic <topic-path> --project <project-path> [--output <output-path>]
 */

import { parseArgs } from "util";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, relative, dirname, resolve } from "path";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const TOPICS_DIR = join(KNOWLEDGE_DIR, "Topics");
const PROJECTS_DIR = join(KNOWLEDGE_DIR, "Projects");

interface TopicReferenceOptions {
  topic: string;
  project: string;
  output?: string;
}

function getTopicPath(topic: string): string {
  // If topic is just a name, search for it
  if (!topic.includes("/")) {
    // Search all categories
    if (!existsSync(TOPICS_DIR)) {
      throw new Error("Topics directory does not exist");
    }

    const { readdirSync, statSync } = require("fs");
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

function getProjectPath(project: string): string {
  if (project.startsWith("/")) {
    return project;
  }

  return join(PROJECTS_DIR, project);
}

function generateReference(topicPath: string, projectPath: string): string {
  if (!existsSync(topicPath)) {
    throw new Error(`Topic file not found: ${topicPath}`);
  }

  if (!existsSync(projectPath)) {
    throw new Error(`Project directory not found: ${projectPath}`);
  }

  // Read topic to get title
  const topicContent = readFileSync(topicPath, "utf-8");
  const titleMatch = topicContent.match(/^#\s+(.+)$/m);
  const topicTitle = titleMatch ? titleMatch[1].replace(/^Deep Research:\s*/, "").replace(/^Market Research:\s*/, "").replace(/^Technical Analysis:\s*/, "").replace(/^Framework Comparison:\s*/, "").trim() : topicPath.split("/").pop()?.replace(".md", "") || "Topic";

  // Calculate relative path
  const relativePath = relative(projectPath, topicPath);
  const encodedPath = relativePath.split("/").map((part) => encodeURIComponent(part)).join("/");

  return `[${topicTitle}](${encodedPath})`;
}

function addReferenceToDocument(projectPath: string, reference: string, outputPath?: string): void {
  const targetPath = outputPath || join(projectPath, "PRD.md");

  if (!existsSync(targetPath)) {
    // Create new document with reference section
    const content = `# Project Document

## Research References

- ${reference}

`;
    writeFileSync(targetPath, content, "utf-8");
    console.log(`✓ Created document with reference: ${targetPath}`);
    return;
  }

  // Read existing document
  let content = readFileSync(targetPath, "utf-8");

  // Check if Research References section exists
  if (content.includes("## Research References")) {
    // Add reference to existing section
    const refSectionMatch = content.match(/(## Research References\n(?:\n|(?:- .+\n)+))/);
    if (refSectionMatch) {
      const refSection = refSectionMatch[1];
      const newRefSection = refSection.replace(/\n$/, `\n- ${reference}\n`);
      content = content.replace(refSectionMatch[0], newRefSection);
    } else {
      // Append to section
      content = content.replace(/(## Research References\n)/, `$1- ${reference}\n`);
    }
  } else {
    // Add new Research References section before References or at end
    if (content.includes("## References")) {
      content = content.replace(/(## References)/, `## Research References\n\n- ${reference}\n\n$1`);
    } else {
      content += `\n\n## Research References\n\n- ${reference}\n`;
    }
  }

  writeFileSync(targetPath, content, "utf-8");
  console.log(`✓ Added reference to document: ${targetPath}`);
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      topic: { type: "string", required: true },
      project: { type: "string", required: true },
      output: { type: "string" },
    },
  });

  const options = values as unknown as TopicReferenceOptions;

  try {
    const topicPath = getTopicPath(options.topic);
    const projectPath = getProjectPath(options.project);
    const reference = generateReference(topicPath, projectPath);

    console.log(`Reference: ${reference}`);

    // Add to document if project path is a directory
    const projectStat = require("fs").statSync(projectPath);
    if (projectStat.isDirectory()) {
      addReferenceToDocument(projectPath, reference, options.output);
    } else {
      console.log(`\nTo add to document, use:`);
      console.log(`  echo "- ${reference}" >> ${projectPath}`);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch(console.error);
