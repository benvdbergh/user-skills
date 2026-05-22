import type { AgentRuntime, AgentSessionKind } from "../api/agent";

/** Skill-detail advisor buttons (US-034) — labels must match Health remediation CTAs. */
export const ADVISOR_SKILL_ACTIONS: readonly {
  kind: AgentSessionKind;
  label: string;
}[] = [
  { kind: "improve-skill", label: "Improve description" },
  { kind: "create-escalation", label: "Draft escalation" },
];

const SESSION_KIND_LABELS: Record<AgentSessionKind, string> = {
  "improve-skill": "Improve description",
  "create-escalation": "Draft escalation",
  "validate-skill": "Validate effectiveness",
  "suggest-relationships": "Suggest relationships",
  "analyze-trigger-conflicts": "Analyze trigger conflicts",
  "skill-patch": "Skill patch",
};

export function agentSessionKindLabel(
  kind: AgentSessionKind | undefined,
): string {
  if (!kind) return "Advisor session";
  return SESSION_KIND_LABELS[kind];
}

export function isClaudeRuntime(runtime: AgentRuntime): boolean {
  return runtime === "claude-headless" || runtime === "claude-background";
}
