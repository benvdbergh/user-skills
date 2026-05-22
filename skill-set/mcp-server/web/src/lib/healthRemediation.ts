import type { AgentSessionKind } from "../api/agent";
import type { HealthFinding } from "../api/health";
import { agentSessionKindLabel } from "./agentSessionLabels";
import type { HealthCategoryCode } from "./healthView";

export type RemediationPrimary =
  | { mode: "manual"; label: "Copy fix steps" }
  | { mode: "agent"; kind: AgentSessionKind; label: string }
  | { mode: "none" };

export interface HealthRemediation {
  primary: RemediationPrimary;
  /** Inline reason when agent is the intended action but context is missing (FR-048). */
  agentDisabledReason: string | null;
}

const CATALOG_MANUAL_CATEGORIES = new Set<HealthCategoryCode>([
  "environment",
  "index",
  "staleness",
]);

function isKnownCategory(category: string): category is HealthCategoryCode {
  return (
    category === "environment" ||
    category === "index" ||
    category === "staleness" ||
    category === "relationships" ||
    category === "escalation" ||
    category === "references"
  );
}

export function agentDisabledReason(
  kind: AgentSessionKind,
  skillName: string | undefined,
  environmentId: string | undefined,
): string | null {
  if (skillName && environmentId) return null;
  const action = agentSessionKindLabel(kind);
  if (!skillName && !environmentId) {
    return `This finding has no skill or environment context, so ${action} cannot start.`;
  }
  if (!skillName) {
    return `No skill is linked to this finding — ${action} needs a target skill name.`;
  }
  return "No environment is available — select an environment in the shell header.";
}

export function resolveHealthRemediation(
  finding: Pick<
    HealthFinding,
    "category" | "skillName" | "environmentId" | "recommendation"
  >,
  fallbackEnvironmentId: string,
): HealthRemediation {
  const skillName = finding.skillName;
  const environmentId = finding.environmentId ?? fallbackEnvironmentId;
  const hasAgentContext = Boolean(skillName && environmentId);

  if (!isKnownCategory(finding.category)) {
    return {
      primary: finding.recommendation
        ? { mode: "manual", label: "Copy fix steps" }
        : { mode: "none" },
      agentDisabledReason: null,
    };
  }

  const category = finding.category;

  if (CATALOG_MANUAL_CATEGORIES.has(category)) {
    return {
      primary: { mode: "manual", label: "Copy fix steps" },
      agentDisabledReason: null,
    };
  }

  if (category === "relationships") {
    if (hasAgentContext) {
      return {
        primary: {
          mode: "agent",
          kind: "suggest-relationships",
          label: agentSessionKindLabel("suggest-relationships"),
        },
        agentDisabledReason: null,
      };
    }
    return {
      primary: { mode: "manual", label: "Copy fix steps" },
      agentDisabledReason: null,
    };
  }

  if (category === "escalation") {
    const kind: AgentSessionKind = "create-escalation";
    return {
      primary: {
        mode: "agent",
        kind,
        label: agentSessionKindLabel(kind),
      },
      agentDisabledReason: hasAgentContext
        ? null
        : agentDisabledReason(kind, skillName, environmentId || undefined),
    };
  }

  if (category === "references") {
    const kind: AgentSessionKind = "improve-skill";
    return {
      primary: {
        mode: "agent",
        kind,
        label: agentSessionKindLabel(kind),
      },
      agentDisabledReason: hasAgentContext
        ? null
        : agentDisabledReason(kind, skillName, environmentId || undefined),
    };
  }

  return {
    primary: { mode: "manual", label: "Copy fix steps" },
    agentDisabledReason: null,
  };
}
