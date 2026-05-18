import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

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

export function internalProblem(
  c: Context,
  detail: string,
  instance?: string,
) {
  return problemResponse(c, {
    type: PROBLEM_TYPES.internal,
    title: "Internal server error",
    status: 500,
    detail,
    instance,
  });
}
