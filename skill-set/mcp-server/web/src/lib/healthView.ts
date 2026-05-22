import type {
  CatalogHealthSummary,
  HealthFinding,
  HealthSeverity,
} from "../api/health";

export function filterFindingsByEnvironment(
  findings: HealthFinding[],
  environmentId: string,
): HealthFinding[] {
  if (!environmentId) return findings;
  return findings.filter(
    (f) => !f.environmentId || f.environmentId === environmentId,
  );
}

/** Health page copy — Info tier is scanner severity, not agent proposals (US-026, FR-047). */
export const INFO_TIER_LABEL = "Info";
export const INFO_TIER_SUMMARY_NOTE = "Non-blocking scanner notices";
export const INFO_TIER_EMPTY_HINT = "No info-tier findings from scanner";

export function shouldShowInfoSummaryCard(infoCount: number): boolean {
  return infoCount > 0;
}

export function summarizeFindings(
  findings: HealthFinding[],
): CatalogHealthSummary {
  const summary: CatalogHealthSummary = {
    info: 0,
    warning: 0,
    error: 0,
    total: 0,
  };
  for (const f of findings) {
    summary[f.severity] += 1;
    summary.total += 1;
  }
  return summary;
}

/** Aligns with `HEALTH_FINDING_CATEGORIES` in SkillHealthService. */
export const HEALTH_CATEGORY_CODES = [
  "environment",
  "index",
  "staleness",
  "relationships",
  "escalation",
  "references",
] as const;

export type HealthCategoryCode = (typeof HEALTH_CATEGORY_CODES)[number];

export interface HealthCategoryMeta {
  label: string;
  description: string;
}

export const HEALTH_CATEGORY_META: Record<HealthCategoryCode, HealthCategoryMeta> =
  {
    environment: {
      label: "Environment",
      description: "Resolvable paths and environment map entries",
    },
    index: {
      label: "Skill index",
      description: "Index counts vs embedded totals",
    },
    staleness: {
      label: "Staleness",
      description: "Generated timestamps vs file modification time",
    },
    relationships: {
      label: "Relationships",
      description: "Unknown or external relationship endpoints",
    },
    escalation: {
      label: "Escalation",
      description: "Missing skill-escalation reference artifacts",
    },
    references: {
      label: "References",
      description: "Broken paths linked from SKILL.md",
    },
  };

export function getHealthCategoryMeta(code: string): HealthCategoryMeta {
  const known = HEALTH_CATEGORY_META[code as HealthCategoryCode];
  if (known) return known;
  return { label: code, description: "" };
}

const SEVERITY_ORDER: Record<HealthSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

export function sortFindings(findings: HealthFinding[]): HealthFinding[] {
  return [...findings].sort((a, b) => {
    const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sev !== 0) return sev;
    const cat = a.category.localeCompare(b.category);
    if (cat !== 0) return cat;
    return a.message.localeCompare(b.message);
  });
}

export function filterFindings(
  findings: HealthFinding[],
  severity: HealthSeverity | "",
  category: string,
): HealthFinding[] {
  return findings.filter((f) => {
    if (severity && f.severity !== severity) return false;
    if (category && f.category !== category) return false;
    return true;
  });
}

export function distinctCategories(findings: HealthFinding[]): string[] {
  return [...new Set(findings.map((f) => f.category))].sort();
}

export function formatScannedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/** UI hint threshold — results may not reflect current catalog state. */
export const HEALTH_STALE_AFTER_MS = 5 * 60 * 1000;

export function healthStalenessMessage(
  scannedAt: string,
  staleAfterMs: number = HEALTH_STALE_AFTER_MS,
): string | null {
  try {
    const ageMs = Date.now() - new Date(scannedAt).getTime();
    if (ageMs < staleAfterMs) return null;
    const relative = relativeScannedAt(scannedAt);
    return `Results may be outdated (last scanned ${relative}). Run Rescan for current findings.`;
  } catch {
    return null;
  }
}

export function relativeScannedAt(iso: string): string {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return formatScannedAt(iso);
  } catch {
    return iso;
  }
}

export function filterFindingsWithSearch(
  findings: HealthFinding[],
  severity: HealthSeverity | "",
  category: string,
  search: string,
): HealthFinding[] {
  const q = search.trim().toLowerCase();
  return filterFindings(findings, severity, category).filter((f) => {
    if (!q) return true;
    return `${f.message} ${f.sourcePath} ${f.category}`.toLowerCase().includes(q);
  });
}

export interface CategoryAggregate {
  total: number;
  error: number;
  warning: number;
  info: number;
}

/** Screen-reader summary for category severity bars (not color-only). */
export function formatCategorySeveritySummary(
  counts: CategoryAggregate,
): string {
  const parts: string[] = [];
  if (counts.error > 0) {
    parts.push(`${counts.error} error${counts.error === 1 ? "" : "s"}`);
  }
  if (counts.warning > 0) {
    parts.push(
      `${counts.warning} warning${counts.warning === 1 ? "" : "s"}`,
    );
  }
  if (counts.info > 0) {
    parts.push(`${counts.info} info`);
  }
  if (parts.length === 0) {
    return `${counts.total} finding${counts.total === 1 ? "" : "s"}`;
  }
  return parts.join(", ");
}

export function aggregateByCategory(
  findings: HealthFinding[],
): [string, CategoryAggregate][] {
  const map = new Map<string, CategoryAggregate>();
  for (const f of findings) {
    const row = map.get(f.category) ?? {
      total: 0,
      error: 0,
      warning: 0,
      info: 0,
    };
    row.total += 1;
    row[f.severity] += 1;
    map.set(f.category, row);
  }
  return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
}
