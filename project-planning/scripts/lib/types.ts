/**
 * Shared types for project-planning scripts and manifest (.project-planning.yaml).
 */

export type PlanningManifest = {
  version: number;
  defaults: {
    epics_dir: string;
    stories_dir: string;
    tasks_dir?: string | null;
  };
  source_globs?: string[];
  naming?: {
    epic_prefix?: string;
    story_prefix?: string;
    task_prefix?: string;
  };
};

export type PlanningContext = {
  /** Absolute path to the project / planning workspace root */
  projectRoot: string;
  manifest: PlanningManifest;
  /** Path to the manifest file if one was loaded from disk */
  manifestPath: string | null;
  /** Set when legacy --project mode was used (Knowledge/Projects/{name}) */
  legacyProjectName?: string;
};

export type TraceRef = {
  path: string;
  anchor?: string;
};

export type ParsedFrontmatter = {
  raw: string;
  data: Record<string, unknown>;
};
