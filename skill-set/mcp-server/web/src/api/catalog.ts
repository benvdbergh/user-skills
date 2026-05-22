import type { AgentSessionKind } from "./agent";
import { apiFetch } from "./client";

export type HealthStatus = "ok" | "warning" | "error";

export interface SkillSummary {
  environmentId: string;
  scope: string;
  name: string;
  path: string;
  description: string;
  triggers: string[];
  workflows: string[];
  tier: "always" | "deferred";
  health: {
    status: HealthStatus;
    findings: number;
  };
}

export interface SkillFileRef {
  kind: "reference" | "script" | "asset";
  relativePath: string;
  exists: boolean;
}

export interface SkillDetail extends SkillSummary {
  license?: string;
  compatibility?: string;
  allowedTools?: string;
  metadata?: Record<string, unknown>;
  descriptionLength: number;
  references: SkillFileRef[];
  scripts: SkillFileRef[];
  assets: SkillFileRef[];
  hasSkillEscalation: boolean;
  missingReferences: string[];
  sourcePath: string;
  advisorAgentKinds?: AgentSessionKind[];
}

export interface Environment {
  id: string;
  scope: string;
  path: string;
  skillIndexPath: string;
  displayName?: string;
  inventoryPath?: string;
  pathResolvable: boolean;
  warnings?: string[];
}

export async function fetchEnvironments(): Promise<Environment[]> {
  const body = await apiFetch<{ environments: Environment[] }>(
    "/api/environments",
  );
  return body.environments;
}

export async function fetchSkills(
  environmentId?: string,
): Promise<SkillSummary[]> {
  const query = environmentId
    ? `?environmentId=${encodeURIComponent(environmentId)}`
    : "";
  const body = await apiFetch<{ skills: SkillSummary[] }>(
    `/api/skills${query}`,
  );
  return body.skills;
}

/** Incident edge counts per skill node id (`skill:{scope}:{name}`). */
export async function fetchRelationshipCounts(): Promise<
  Map<string, number>
> {
  try {
    const body = await apiFetch<{ counts: Record<string, number> }>(
      "/api/graph/skill-relationship-counts",
    );
    return new Map(Object.entries(body.counts));
  } catch {
    return new Map();
  }
}

export function skillGraphNodeId(
  skill: Pick<SkillSummary, "scope" | "name">,
): string {
  return `skill:${skill.scope}:${skill.name}`;
}

export async function fetchSkillDetail(
  environmentId: string,
  skillName: string,
): Promise<SkillDetail> {
  const body = await apiFetch<{ skill: SkillDetail }>(
    `/api/skills/${encodeURIComponent(environmentId)}/${encodeURIComponent(skillName)}`,
  );
  return body.skill;
}
