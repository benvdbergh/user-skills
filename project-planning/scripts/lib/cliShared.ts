import { resolvePlanningContext, type ResolveOptions } from "./resolveContext";
import type { PlanningContext } from "./types";

export const standardPlanningOptions = {
  root: { type: "string" as const },
  config: { type: "string" as const },
  project: { type: "string" as const },
  help: { type: "boolean" as const, short: "h" as const },
};

export function contextFromArgs(values: {
  root?: string;
  config?: string;
  project?: string;
}): PlanningContext {
  return resolvePlanningContext({
    root: values.root,
    config: values.config,
    project: values.project,
  } as ResolveOptions);
}

export function requireContext(
  values: { root?: string; config?: string; project?: string },
  requireOneOf: "any" | "projectOrRoot" = "any"
): PlanningContext {
  const ctx = contextFromArgs(values);
  if (requireOneOf === "projectOrRoot") {
    if (!values.project && !values.root && !values.config && !process.env.PROJECT_PLANNING_CONFIG) {
      throw new Error("Provide --project (legacy), --root, or --config");
    }
  }
  return ctx;
}
