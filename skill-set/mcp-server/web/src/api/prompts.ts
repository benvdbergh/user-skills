import { apiFetch } from "./client";

export interface PromptSourceRef {
  relativePath: string;
  sectionHeading?: string;
}

export interface PromptBundle {
  templateId: string;
  sections: {
    ref: PromptSourceRef;
    content: string;
    heading?: string;
  }[];
  sourceRefs: PromptSourceRef[];
  assembledPrompt: string;
}

export interface PromptBundleResponse {
  prompt: PromptBundle;
  skillSetRoot: string;
}

export type LifecyclePromptId =
  | "improve-skill-description"
  | "create-skill-escalation"
  | "validate-skill-effectiveness"
  | "suggest-relationships"
  | "analyze-trigger-conflicts"
  | "synthesize-new-skill";

export const SKILL_DETAIL_PROMPTS: {
  id: LifecyclePromptId;
  label: string;
  requiresSkill: boolean;
}[] = [
  {
    id: "improve-skill-description",
    label: "Improve description",
    requiresSkill: true,
  },
  {
    id: "create-skill-escalation",
    label: "Draft escalation",
    requiresSkill: true,
  },
  {
    id: "validate-skill-effectiveness",
    label: "Validate effectiveness",
    requiresSkill: false,
  },
  {
    id: "suggest-relationships",
    label: "Suggest relationships",
    requiresSkill: false,
  },
  {
    id: "analyze-trigger-conflicts",
    label: "Analyze trigger conflicts",
    requiresSkill: false,
  },
  {
    id: "synthesize-new-skill",
    label: "Synthesize new skill",
    requiresSkill: false,
  },
];

export async function fetchPromptBundle(
  templateId: LifecyclePromptId,
  options?: { environmentId?: string; skillName?: string },
): Promise<PromptBundleResponse> {
  const params = new URLSearchParams();
  if (options?.environmentId) {
    params.set("environmentId", options.environmentId);
  }
  if (options?.skillName) {
    params.set("skillName", options.skillName);
  }
  const qs = params.toString();
  return apiFetch<PromptBundleResponse>(
    `/api/prompts/${encodeURIComponent(templateId)}${qs ? `?${qs}` : ""}`,
  );
}
