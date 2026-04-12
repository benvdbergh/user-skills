import { existsSync, readFileSync } from "fs";
import { parse } from "yaml";
import type { PlanningManifest } from "./types";

export const MANIFEST_FILENAME = ".project-planning.yaml";

export function defaultManifest(): PlanningManifest {
  return {
    version: 1,
    defaults: {
      epics_dir: "Epics",
      stories_dir: "Stories",
      tasks_dir: null,
    },
    source_globs: ["PRD.md"],
    naming: {
      epic_prefix: "Epic-",
      story_prefix: "Story-",
      task_prefix: "Task-",
    },
  };
}

/** Legacy Knowledge/Projects/{project} layout (no on-disk manifest). */
export function legacyManifest(): PlanningManifest {
  return defaultManifest();
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function mergeManifest(partial: unknown): PlanningManifest {
  const base = defaultManifest();
  if (!isRecord(partial)) {
    return base;
  }
  const defaultsIn = isRecord(partial.defaults) ? partial.defaults : {};
  return {
    version: typeof partial.version === "number" ? partial.version : base.version,
    defaults: {
      epics_dir:
        typeof defaultsIn.epics_dir === "string" ? defaultsIn.epics_dir : base.defaults.epics_dir,
      stories_dir:
        typeof defaultsIn.stories_dir === "string"
          ? defaultsIn.stories_dir
          : base.defaults.stories_dir,
      tasks_dir:
        defaultsIn.tasks_dir === null || defaultsIn.tasks_dir === undefined
          ? base.defaults.tasks_dir
          : String(defaultsIn.tasks_dir),
    },
    source_globs: Array.isArray(partial.source_globs)
      ? partial.source_globs.filter((g): g is string => typeof g === "string")
      : base.source_globs,
    naming: isRecord(partial.naming)
      ? {
          epic_prefix:
            typeof partial.naming.epic_prefix === "string"
              ? partial.naming.epic_prefix
              : base.naming!.epic_prefix,
          story_prefix:
            typeof partial.naming.story_prefix === "string"
              ? partial.naming.story_prefix
              : base.naming!.story_prefix,
          task_prefix:
            typeof partial.naming.task_prefix === "string"
              ? partial.naming.task_prefix
              : base.naming!.task_prefix,
        }
      : base.naming,
  };
}

export function loadManifestFromFile(absolutePath: string): PlanningManifest {
  if (!existsSync(absolutePath)) {
    return defaultManifest();
  }
  const text = readFileSync(absolutePath, "utf-8");
  const doc = parse(text);
  return mergeManifest(doc);
}
