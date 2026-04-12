import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { PlanningContext } from "./types";
import { getEpicsDir, getStoriesDir, epicPrefix, storyPrefix } from "./planningPaths";
import { parseMarkdownFrontmatter } from "./frontmatter";

export function getNextEpicNumber(ctx: PlanningContext): number {
  const epicsDir = getEpicsDir(ctx);
  const prefix = epicPrefix(ctx);
  if (!existsSync(epicsDir)) {
    return 1;
  }
  const files = readdirSync(epicsDir).filter(
    (f) => f.endsWith(".md") && f.startsWith(prefix)
  );
  if (files.length === 0) {
    return 1;
  }
  const nums: number[] = [];
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^${escaped}(\\d+)-`);
  for (const file of files) {
    const m = file.match(re);
    if (m) {
      nums.push(parseInt(m[1], 10));
    }
  }
  if (nums.length === 0) {
    return 1;
  }
  return Math.max(...nums) + 1;
}

/** Resolve epic number by matching display name against H1 or frontmatter title. */
export function getEpicNumberByName(ctx: PlanningContext, epicName: string): number {
  const epicsDir = getEpicsDir(ctx);
  const prefix = epicPrefix(ctx);
  if (!existsSync(epicsDir)) {
    throw new Error(`Epics directory not found. Run WorkflowInit or create ${epicsDir}`);
  }
  const files = readdirSync(epicsDir).filter(
    (f) => f.endsWith(".md") && f.startsWith(prefix)
  );
  const slug = epicName.replace(/\s+/g, "-");
  for (const file of files) {
    if (file.includes(slug)) {
      const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = file.match(new RegExp(`^${escaped}(\\d+)-`));
      if (m) {
        return parseInt(m[1], 10);
      }
    }
  }
  for (const file of files) {
    const p = join(epicsDir, file);
    const content = readFileSync(p, "utf-8");
    const fm = parseMarkdownFrontmatter(content);
    if (fm?.data.title === epicName) {
      const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = file.match(new RegExp(`^${escaped}(\\d+)-`));
      if (m) {
        return parseInt(m[1], 10);
      }
    }
    const nameMatch = content.match(/# Epic(?:-\d+)?:\s*(.+)/);
    if (nameMatch && nameMatch[1].trim() === epicName) {
      const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = file.match(new RegExp(`^${escaped}(\\d+)-`));
      if (m) {
        return parseInt(m[1], 10);
      }
    }
  }
  throw new Error(`Epic not found: ${epicName}`);
}

export function getNextStoryNumber(ctx: PlanningContext, epicNumber: number): number {
  const storiesDir = getStoriesDir(ctx);
  const prefix = storyPrefix(ctx);
  if (!existsSync(storiesDir)) {
    return 1;
  }
  const files = readdirSync(storiesDir).filter(
    (f) => f.endsWith(".md") && f.startsWith(prefix)
  );
  const nums: number[] = [];
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^${escaped}(\\d+)-(\\d+)-`);
  for (const file of files) {
    const m = file.match(re);
    if (m) {
      const fileEpic = parseInt(m[1], 10);
      if (fileEpic === epicNumber) {
        nums.push(parseInt(m[2], 10));
      }
    }
  }
  if (nums.length === 0) {
    return 1;
  }
  return Math.max(...nums) + 1;
}
