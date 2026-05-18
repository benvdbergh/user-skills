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
