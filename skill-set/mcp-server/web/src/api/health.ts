import { apiFetch } from "./client";

export type HealthSeverity = "info" | "warning" | "error";

export interface HealthFinding {
  id: string;
  severity: HealthSeverity;
  category: string;
  message: string;
  sourcePath: string;
  recommendation?: string;
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

export async function fetchHealthReport(): Promise<CatalogHealthReport> {
  const body = await apiFetch<{ report: CatalogHealthReport }>("/api/health", {
    method: "POST",
  });
  return body.report;
}
