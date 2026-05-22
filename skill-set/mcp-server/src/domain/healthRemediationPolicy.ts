import type { AgentSessionKind, HealthFinding, HealthPrimaryAction } from "./types.js";

/** Stable finding category codes emitted by scan() — mirrored in web healthView metadata. */
export const HEALTH_FINDING_CATEGORIES = [
  "environment",
  "index",
  "staleness",
  "relationships",
  "escalation",
  "references",
] as const;

export type HealthFindingCategory = (typeof HEALTH_FINDING_CATEGORIES)[number];

/** Agent kinds offered on skill detail — must match escalation/references remediation (US-034). */
export const SKILL_DETAIL_ADVISOR_AGENT_KINDS = [
  "improve-skill",
  "create-escalation",
] as const satisfies readonly AgentSessionKind[];

const CATALOG_MANUAL_CATEGORIES = new Set<HealthFindingCategory>([
  "environment",
  "index",
  "staleness",
]);

function isKnownCategory(category: string): category is HealthFindingCategory {
  return (HEALTH_FINDING_CATEGORIES as readonly string[]).includes(category);
}

/** Category → primary action policy (FR-043); consumed by SkillHealthService and adapters. */
export function resolveHealthRemediationPolicy(
  finding: Pick<HealthFinding, "category" | "skillName" | "recommendation">,
): { primaryAction: HealthPrimaryAction; agentKind?: AgentSessionKind } {
  if (!isKnownCategory(finding.category)) {
    return {
      primaryAction: finding.recommendation ? "manual" : "none",
    };
  }

  const category = finding.category;

  if (CATALOG_MANUAL_CATEGORIES.has(category)) {
    return { primaryAction: "manual" };
  }

  if (category === "relationships") {
    if (finding.skillName) {
      return {
        primaryAction: "agent",
        agentKind: "suggest-relationships",
      };
    }
    return { primaryAction: "manual" };
  }

  if (category === "escalation") {
    return { primaryAction: "agent", agentKind: "create-escalation" };
  }

  if (category === "references") {
    return { primaryAction: "agent", agentKind: "improve-skill" };
  }

  return { primaryAction: "manual" };
}

export function enrichHealthFinding(finding: HealthFinding): HealthFinding {
  const { primaryAction, agentKind } = resolveHealthRemediationPolicy(finding);
  return {
    ...finding,
    primaryAction,
    ...(agentKind !== undefined ? { agentKind } : {}),
  };
}

export function enrichHealthFindings(findings: HealthFinding[]): HealthFinding[] {
  return findings.map(enrichHealthFinding);
}
