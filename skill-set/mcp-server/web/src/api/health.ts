import { ApiError, apiFetch } from "./client";

export type HealthSeverity = "info" | "warning" | "error";

export interface HealthFinding {
  id: string;
  severity: HealthSeverity;
  category: string;
  message: string;
  sourcePath: string;
  recommendation?: string;
  environmentId?: string;
  skillName?: string;
}

export interface CatalogHealthSummary {
  info: number;
  warning: number;
  error: number;
  total: number;
}

export interface CatalogHealthReport {
  findings: HealthFinding[];
  scannedAt: string;
  durationMs: number;
  summary: CatalogHealthSummary;
}

/** Cached latest scan; null when none (HTTP 404). Does not trigger a rescan. */
export async function fetchHealthLatest(): Promise<CatalogHealthReport | null> {
  try {
    const body = await apiFetch<{ report: CatalogHealthReport }>(
      "/api/health/latest",
    );
    return body.report;
  } catch (err) {
    if (err instanceof ApiError && err.problem.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function fetchHealthReport(): Promise<CatalogHealthReport> {
  const body = await apiFetch<{ report: CatalogHealthReport }>("/api/health", {
    method: "POST",
  });
  return body.report;
}
