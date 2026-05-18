export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export class ApiError extends Error {
  readonly problem: ProblemDetail;

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
    this.problem = problem;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    if (contentType.includes("application/problem+json")) {
      const problem = (await res.json()) as ProblemDetail;
      throw new ApiError(problem);
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
