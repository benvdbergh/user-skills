#!/usr/bin/env bun

/**
 * ProjectResearchSummary.ts - Saves project-specific research summaries
 *
 * Saves research summaries to project-specific Research folders instead of
 * general Topics directory. Used when research is conducted for a specific project.
 *
 * Usage:
 *   bun run ProjectResearchSummary.ts --project <project-name> --summary <summary-content> --title <title> [--topic-refs <topic1,topic2>]
 */

import { parseArgs } from "util";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || "/home/ben/Knowledge";
const PROJECTS_DIR = join(KNOWLEDGE_DIR, "Projects");

interface ProjectResearchSummaryOptions {
  project: string;
  summary: string;
  title: string;
  topicRefs?: string;
  researchType?: string;
}

function getProjectDir(projectName: string): string {
  return join(PROJECTS_DIR, projectName);
}

function getResearchDir(projectName: string): string {
  return join(getProjectDir(projectName), "Research");
}

function ensureResearchDir(projectName: string): string {
  const researchDir = getResearchDir(projectName);
  if (!existsSync(researchDir)) {
    mkdirSync(researchDir, { recursive: true });
    console.log(`✓ Created Research directory: ${researchDir}`);
  }
  return researchDir;
}

function getProjectNameFromBrief(projectPath: string): string | null {
  const briefPath = join(projectPath, "brief.md");
  if (!existsSync(briefPath)) {
    return null;
  }

  const content = readFileSync(briefPath, "utf-8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatter = frontmatterMatch[1];
  const projectMatch = frontmatter.match(/^project:\s*(.+)$/m);
  return projectMatch ? projectMatch[1].trim() : null;
}

function detectProjectName(projectInput: string): string {
  // If it's a path, extract project name
  if (projectInput.includes("/")) {
    const parts = projectInput.split("/");
    const projectsIndex = parts.indexOf("Projects");
    if (projectsIndex >= 0 && parts[projectsIndex + 1]) {
      return parts[projectsIndex + 1];
    }
    // Try to extract from full path
    const projectDir = projectInput.startsWith("/")
      ? projectInput
      : join(PROJECTS_DIR, projectInput);
    if (existsSync(projectDir)) {
      const detectedName = getProjectNameFromBrief(projectDir) || projectInput.split("/").pop() || projectInput;
      return detectedName;
    }
  }

  // Check if it's a project directory name
  const projectDir = join(PROJECTS_DIR, projectInput);
  if (existsSync(projectDir)) {
    const detectedName = getProjectNameFromBrief(projectDir) || projectInput;
    return detectedName;
  }

  return projectInput;
}

function generateSummaryContent(
  title: string,
  summary: string,
  projectName: string,
  topicRefs?: string[],
  researchType?: string
): string {
  const date = new Date().toISOString().split("T")[0];
  const researchTypeLabel = researchType || "Project Research";

  let content = `---
title: ${title}
type: research-summary
project: ${projectName}
research_type: ${researchType}
created: ${date}
updated: ${date}
status: complete
---

# ${title}

**Project:** ${projectName}  
**Research Type:** ${researchTypeLabel}  
**Date:** ${date}  
**Status:** Complete

## Research Summary

${summary}
`;

  if (topicRefs && topicRefs.length > 0) {
    content += `\n## Related Research Topics\n\n`;
    topicRefs.forEach((topicRef) => {
      // If it's a path, convert to relative link
      if (topicRef.includes("/")) {
        const relativePath = topicRef.replace(/.*\/Knowledge\//, "../../");
        const topicName = topicRef.split("/").pop()?.replace(".md", "") || topicRef;
        content += `- [${topicName}](${relativePath})\n`;
      } else {
        content += `- ${topicRef}\n`;
      }
    });
  }

  content += `\n## Notes

This research summary is specific to the ${projectName} project. For general research topics, see ~/Knowledge/Topics/.
`;

  return content;
}

function sanitizeFileName(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function saveProjectResearchSummary(
  project: string,
  summary: string,
  title: string,
  topicRefs?: string[],
  researchType?: string
): Promise<string> {
  const projectName = detectProjectName(project);
  const researchDir = ensureResearchDir(projectName);

  // Validate project exists
  const projectDir = getProjectDir(projectName);
  if (!existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  // Generate filename from title
  const fileName = `${sanitizeFileName(title)}.md`;
  const filePath = join(researchDir, fileName);

  // Generate content
  const content = generateSummaryContent(title, summary, projectName, topicRefs, researchType);

  // Write file
  writeFileSync(filePath, content, "utf-8");

  return filePath;
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      summary: { type: "string" },
      title: { type: "string" },
      "topic-refs": { type: "string" },
      "research-type": { type: "string" },
    },
  });

  const options: ProjectResearchSummaryOptions = {
    project: values.project as string,
    summary: values.summary as string,
    title: values.title as string,
    topicRefs: values["topic-refs"] as string | undefined,
    researchType: values["research-type"] as string | undefined,
  };

  if (!options.project || !options.summary || !options.title) {
    console.error("Error: --project, --summary, and --title are required");
    console.error("Usage: bun run ProjectResearchSummary.ts --project <project-name> --summary <summary-content> --title <title> [--topic-refs <topic1,topic2>] [--research-type <type>]");
    process.exit(1);
  }

  try {
    const topicRefs = options.topicRefs
      ? options.topicRefs.split(",").map((ref) => ref.trim())
      : undefined;

    const filePath = await saveProjectResearchSummary(
      options.project,
      options.summary,
      options.title,
      topicRefs,
      options.researchType
    );

    console.log(`✓ Project research summary saved to: ${filePath}`);
    console.log(`  Project: ${detectProjectName(options.project)}`);
    if (topicRefs) {
      console.log(`  Related topics: ${topicRefs.length}`);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch(console.error);
