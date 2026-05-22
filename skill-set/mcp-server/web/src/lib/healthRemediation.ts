import type { AgentSessionKind } from "../api/agent";
import type { HealthFinding, HealthPrimaryAction } from "../api/health";
import { agentSessionKindLabel } from "./agentSessionLabels";

export type RemediationPrimary =
  | { mode: "manual"; label: "Copy fix steps" }
  | { mode: "agent"; kind: AgentSessionKind; label: string }
  | { mode: "none" };

export interface HealthRemediationView {
  primary: RemediationPrimary;
  /** Inline reason when agent is the intended action but context is missing (FR-048). */
  agentDisabledReason: string | null;
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

/** Maps server-owned remediation fields to presentation (FR-040). */
export function viewRemediationFromFinding(
  finding: Pick<
    HealthFinding,
    "primaryAction" | "agentKind" | "skillName" | "environmentId"
  >,
  fallbackEnvironmentId: string,
): HealthRemediationView {
  const skillName = finding.skillName;
  const environmentId = finding.environmentId ?? fallbackEnvironmentId;
  const primaryAction: HealthPrimaryAction = finding.primaryAction ?? "manual";

  if (primaryAction === "none") {
    return { primary: { mode: "none" }, agentDisabledReason: null };
  }

  if (primaryAction === "manual") {
    return {
      primary: { mode: "manual", label: "Copy fix steps" },
      agentDisabledReason: null,
    };
  }

  const kind = finding.agentKind;
  if (!kind) {
    return {
      primary: { mode: "manual", label: "Copy fix steps" },
      agentDisabledReason: null,
    };
  }

  const hasAgentContext = Boolean(skillName && environmentId);
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
