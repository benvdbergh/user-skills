import type { HealthFinding, HealthSeverity } from "../api/health";

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
