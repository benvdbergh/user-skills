import type { HealthSeverity } from "../api/health";

/**
 * Health page URL query contract (deep-linkable; survives refresh).
 *
 * | Param      | Values                         | Absent = no filter   |
 * |------------|--------------------------------|----------------------|
 * | `severity` | `error` \| `warning` \| `info`  | All severities       |
 * | `category` | category code (e.g. `relationships`) | All categories |
 * | `q`        | free-text search               | No search filter     |
 *
 * Example: `/health?severity=error&category=relationships&q=missing`
 * Shell `environmentId` is preserved when updating health filters.
 */
export type HealthUrlSeverity = HealthSeverity | "";

export interface HealthUrlFilters {
  severity: HealthUrlSeverity;
  category: string;
  q: string;
}

const SEVERITY_PARAM_VALUES = new Set<string>(["error", "warning", "info"]);

export function parseHealthUrlFilters(
  params: URLSearchParams,
): HealthUrlFilters {
  const raw = params.get("severity") ?? "";
  const severity = SEVERITY_PARAM_VALUES.has(raw)
    ? (raw as HealthSeverity)
    : "";
  return {
    severity,
    category: params.get("category") ?? "",
    q: params.get("q") ?? "",
  };
}

/** BEN-52 alias */
export function parseHealthUrlParams(
  params: URLSearchParams,
): HealthUrlFilters {
  return parseHealthUrlFilters(params);
}

export interface BuildHealthPathOptions {
  severity?: HealthUrlSeverity;
  category?: string;
  q?: string;
  /** Shell-wide filter from `?environmentId=` */
  environmentId?: string;
}

export function buildHealthPath(options: BuildHealthPathOptions = {}): string {
  const search = new URLSearchParams();
  if (options.environmentId) {
    search.set("environmentId", options.environmentId);
  }
  if (options.severity) {
    search.set("severity", options.severity);
  }
  if (options.category) {
    search.set("category", options.category);
  }
  if (options.q?.trim()) {
    search.set("q", options.q.trim());
  }
  const qs = search.toString();
  return qs ? `/health?${qs}` : "/health";
}

/** Merge health filter params; preserves unrelated keys (e.g. environmentId). */
export function applyHealthUrlFilters(
  base: URLSearchParams,
  filters: HealthUrlFilters,
): URLSearchParams {
  const next = new URLSearchParams(base);
  if (filters.severity) next.set("severity", filters.severity);
  else next.delete("severity");
  if (filters.category) next.set("category", filters.category);
  else next.delete("category");
  if (filters.q) next.set("q", filters.q);
  else next.delete("q");
  return next;
}

export type HealthUrlParamUpdates = Partial<HealthUrlFilters>;

/** Partial update for in-page filter controls (preserves environmentId). */
export function applyHealthUrlUpdates(
  base: URLSearchParams,
  updates: HealthUrlParamUpdates,
): URLSearchParams {
  const current = parseHealthUrlFilters(base);
  return applyHealthUrlFilters(base, {
    severity:
      updates.severity !== undefined ? updates.severity : current.severity,
    category:
      updates.category !== undefined ? updates.category : current.category,
    q: updates.q !== undefined ? updates.q : current.q,
  });
}
