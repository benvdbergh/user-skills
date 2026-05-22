import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { PathAccessError } from "../config/pathGuard.js";
import { ProposalValidationError } from "../domain/proposalValidation.js";
import { QueryParamError } from "./queryParams.js";

/** Client-safe `detail` strings — never include host filesystem paths (FR-040). */
export const SAFE_CLIENT_DETAILS = {
  internal: "An unexpected error occurred",
  pathForbidden: "Path is outside configured skills roots",
} as const;

export interface ProblemDetail {
  type: string;
  title: string;
  status: ContentfulStatusCode;
  detail?: string;
  instance?: string;
}

export const PROBLEM_TYPES = {
  validation: "https://skill-lab.dev/problems/validation-error",
  notFound: "https://skill-lab.dev/problems/not-found",
  forbidden: "https://skill-lab.dev/problems/forbidden",
  internal: "https://skill-lab.dev/problems/internal-error",
} as const;

export function problemResponse(c: Context, problem: ProblemDetail) {
  return c.json(problem, problem.status, {
    "Content-Type": "application/problem+json",
  });
}

export function validationProblem(
  c: Context,
  detail: string,
  instance?: string,
) {
  return problemResponse(c, {
    type: PROBLEM_TYPES.validation,
    title: "Validation failed",
    status: 400,
    detail,
    instance,
  });
}

export function notFoundProblem(
  c: Context,
  detail: string,
  instance?: string,
) {
  return problemResponse(c, {
    type: PROBLEM_TYPES.notFound,
    title: "Not found",
    status: 404,
    detail,
    instance,
  });
}

export function forbiddenProblem(
  c: Context,
  detail: string,
  instance?: string,
) {
  return problemResponse(c, {
    type: PROBLEM_TYPES.forbidden,
    title: "Forbidden",
    status: 403,
    detail,
    instance,
  });
}

export function internalProblem(c: Context, instance?: string) {
  return problemResponse(c, {
    type: PROBLEM_TYPES.internal,
    title: "Internal server error",
    status: 500,
    detail: SAFE_CLIENT_DETAILS.internal,
    instance,
  });
}

export function logApiError(err: unknown, instance?: string): void {
  const label = instance ? `[skill-lab ${instance}]` : "[skill-lab]";
  if (err instanceof Error) {
    console.error(label, err);
  } else {
    console.error(label, err);
  }
}

export function handleApiError(c: Context, err: unknown) {
  const instance = c.req.path;

  if (err instanceof PathAccessError) {
    logApiError(err, instance);
    return forbiddenProblem(c, SAFE_CLIENT_DETAILS.pathForbidden, instance);
  }
  if (err instanceof QueryParamError) {
    return validationProblem(c, err.message, instance);
  }
  if (err instanceof ProposalValidationError) {
    return validationProblem(c, err.message, instance);
  }

  logApiError(err, instance);
  return internalProblem(c, instance);
}
