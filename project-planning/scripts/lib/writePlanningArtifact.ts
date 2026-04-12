import { existsSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import type { PlanningContext } from "./types";
import { getEpicsDir, getStoriesDir, epicPrefix, storyPrefix } from "./planningPaths";
import { getNextEpicNumber, getNextStoryNumber } from "./epicStoryNumbers";
import { getPaiDir } from "./paiDir";

export function loadSkillTemplate(templateName: string, paiDir?: string): string {
  const root = paiDir ?? getPaiDir();
  const templatePath = join(root, "skills", "project-planning", "assets", templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return readFileSync(templatePath, "utf-8");
}

export function projectLabel(ctx: PlanningContext): string {
  return ctx.legacyProjectName ?? basename(ctx.projectRoot);
}

export function writeEpicFile(
  ctx: PlanningContext,
  epicName: string,
  description: string,
  prdSectionLines: string[],
  paiDir?: string
): string {
  const epicsDir = getEpicsDir(ctx);
  if (!existsSync(epicsDir)) {
    throw new Error(`Epics directory not found: ${epicsDir}`);
  }
  const epicNumber = getNextEpicNumber(ctx);
  const epicId = `EPIC-${epicNumber}`;
  const epicSlug = epicName.replace(/\s+/g, "-");
  const prefix = epicPrefix(ctx);
  const epicFileName = `${prefix}${epicNumber}-${epicSlug}.md`;
  const epicPath = join(epicsDir, epicFileName);
  if (existsSync(epicPath)) {
    throw new Error(`Epic file already exists: ${epicFileName}`);
  }
  const template = loadSkillTemplate("EpicTemplate.md", paiDir);
  const date = new Date().toISOString().split("T")[0];
  const project = projectLabel(ctx);
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
    .replace(
      /\{\{prdSections\}\}/g,
      prdSectionLines.length ? prdSectionLines.map((s) => `- ${s}`).join("\n") : "<!-- TODO: Link to PRD / spec sections -->"
    )
    .replace(/\{\{notes\}\}/g, "<!-- TODO: Add notes -->");
  writeFileSync(epicPath, epicContent, "utf-8");
  return epicPath;
}

export function writeStoryFile(
  ctx: PlanningContext,
  storyName: string,
  epicName: string,
  epicNumber: number,
  description: string,
  paiDir?: string
): string {
  const storiesDir = getStoriesDir(ctx);
  if (!existsSync(storiesDir)) {
    throw new Error(`Stories directory not found: ${storiesDir}`);
  }
  const storyNumber = getNextStoryNumber(ctx, epicNumber);
  const storyId = `STORY-${epicNumber}-${storyNumber}`;
  const storySlug = storyName.replace(/\s+/g, "-");
  const prefix = storyPrefix(ctx);
  const storyFileName = `${prefix}${epicNumber}-${storyNumber}-${storySlug}.md`;
  const storyPath = join(storiesDir, storyFileName);
  if (existsSync(storyPath)) {
    throw new Error(`Story already exists: ${storyFileName}`);
  }
  const template = loadSkillTemplate("StoryTemplate.md", paiDir);
  const date = new Date().toISOString().split("T")[0];
  const project = projectLabel(ctx);
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
  return storyPath;
}
