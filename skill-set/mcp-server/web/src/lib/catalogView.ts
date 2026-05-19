import type { HealthStatus, SkillSummary } from "../api/catalog";
import { skillGraphNodeId } from "../api/catalog";

export interface CatalogFilters {
  scope: string;
  tier: string;
  cluster: string;
  project: string;
  health: string;
}

export const EMPTY_CATALOG_FILTERS: CatalogFilters = {
  scope: "",
  tier: "",
  cluster: "",
  project: "",
  health: "",
};

export interface CatalogRow extends SkillSummary {
  projectLabel: string;
  cluster: string;
  triggerCount: number;
  workflowCount: number;
  relationshipCount: number | null;
  metadataIssues: string[];
}

export function deriveCluster(path: string): string {
  const segment = path.split("/").filter(Boolean)[0];
  return segment ?? "—";
}

export function deriveProjectLabel(skill: SkillSummary): string {
  if (skill.scope === "project") {
    return skill.environmentId;
  }
  return "—";
}

/** Highlight rows from API health only (no duplicated domain rules). */
export function getMetadataIssues(skill: SkillSummary): string[] {
  const issues: string[] = [];
  if (skill.health.status !== "ok") {
    issues.push(`health: ${skill.health.status}`);
  }
  if (skill.health.findings > 0) {
    issues.push(`${skill.health.findings} finding(s)`);
  }
  return issues;
}

export function enrichSkill(
  skill: SkillSummary,
  relationshipCounts: Map<string, number> | null,
): CatalogRow {
  const nodeId = skillGraphNodeId(skill);
  const relationshipCount = relationshipCounts?.has(nodeId)
    ? (relationshipCounts.get(nodeId) ?? 0)
    : relationshipCounts
      ? 0
      : null;

  return {
    ...skill,
    projectLabel: deriveProjectLabel(skill),
    cluster: deriveCluster(skill.path),
    triggerCount: skill.triggers.length,
    workflowCount: skill.workflows.length,
    relationshipCount,
    metadataIssues: getMetadataIssues(skill),
  };
}

export function matchesSearch(skill: SkillSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    skill.name,
    skill.description,
    skill.path,
    skill.scope,
    skill.environmentId,
    ...skill.triggers,
    ...skill.workflows,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function matchesFilters(row: CatalogRow, filters: CatalogFilters): boolean {
  if (filters.scope && row.scope !== filters.scope) return false;
  if (filters.tier && row.tier !== filters.tier) return false;
  if (filters.cluster && row.cluster !== filters.cluster) return false;
  if (filters.project && row.projectLabel !== filters.project) return false;
  if (filters.health && row.health.status !== filters.health) return false;
  return true;
}

export function filterCatalogRows(
  rows: CatalogRow[],
  search: string,
  filters: CatalogFilters,
): CatalogRow[] {
  return rows.filter(
    (row) => matchesSearch(row, search) && matchesFilters(row, filters),
  );
}

export function distinctFilterValues(
  rows: CatalogRow[],
  key: keyof Pick<CatalogRow, "scope" | "tier" | "cluster" | "projectLabel">,
): string[] {
  return [...new Set(rows.map((r) => r[key]).filter((v) => v && v !== "—"))].sort();
}

export function healthStatusLabel(status: HealthStatus): string {
  if (status === "ok") return "OK";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
