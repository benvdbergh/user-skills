import type { AgentSessionKind } from "../domain/types.js";

export const KIND_TO_PROMPT_TEMPLATE: Record<AgentSessionKind, string> = {
  "improve-skill": "improve-skill-description",
  "create-escalation": "create-skill-escalation",
  "validate-skill": "validate-skill-effectiveness",
  "suggest-relationships": "suggest-relationships",
  "analyze-trigger-conflicts": "analyze-trigger-conflicts",
  "skill-patch": "improve-skill-description",
};

export function resolvePromptTemplateId(
  kind: AgentSessionKind,
  explicit?: string,
): string {
  return explicit ?? KIND_TO_PROMPT_TEMPLATE[kind];
}
