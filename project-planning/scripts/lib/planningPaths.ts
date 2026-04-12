import { join } from "path";
import type { PlanningContext } from "./types";

export function getEpicsDir(ctx: PlanningContext): string {
  return join(ctx.projectRoot, ctx.manifest.defaults.epics_dir);
}

export function getStoriesDir(ctx: PlanningContext): string {
  return join(ctx.projectRoot, ctx.manifest.defaults.stories_dir);
}

export function getTasksDir(ctx: PlanningContext): string | null {
  const t = ctx.manifest.defaults.tasks_dir;
  if (t === null || t === undefined || t === "") {
    return null;
  }
  return join(ctx.projectRoot, t);
}

export function getBriefPath(ctx: PlanningContext): string {
  return join(ctx.projectRoot, "brief.md");
}

export function epicPrefix(ctx: PlanningContext): string {
  return ctx.manifest.naming?.epic_prefix ?? "Epic-";
}

export function storyPrefix(ctx: PlanningContext): string {
  return ctx.manifest.naming?.story_prefix ?? "Story-";
}
