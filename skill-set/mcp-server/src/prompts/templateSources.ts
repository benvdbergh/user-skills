import type { PromptSourceRef } from "../domain/types.js";

/** File-path refs only — lifecycle rubric bodies live in skill-set/references (NFR-012). */
export type PromptTemplateSourcePlan = {
  skillSetRefs: PromptSourceRef[];
  targetSkillRefs?: PromptSourceRef[];
  includeSkillSetSkillMd?: boolean;
};

export const PROMPT_TEMPLATE_SOURCES: Record<string, PromptTemplateSourcePlan> =
  {
    "improve-skill-description": {
      skillSetRefs: [
        { relativePath: "skill-set/references/optimize.md" },
        { relativePath: "skill-set/references/authoring-guide.md" },
      ],
      targetSkillRefs: [{ relativePath: "SKILL.md" }],
    },
    "create-skill-escalation": {
      skillSetRefs: [
        { relativePath: "skill-set/references/authoring-guide.md" },
      ],
      targetSkillRefs: [{ relativePath: "SKILL.md" }],
    },
    "validate-skill-effectiveness": {
      skillSetRefs: [
        { relativePath: "skill-set/references/validate.md" },
        { relativePath: "skill-set/references/effectiveness-assessment.md" },
      ],
    },
    "suggest-relationships": {
      skillSetRefs: [
        { relativePath: "skill-set/references/synthesize.md" },
      ],
    },
    "analyze-trigger-conflicts": {
      skillSetRefs: [{ relativePath: "skill-set/references/lint.md" }],
    },
    "synthesize-new-skill": {
      skillSetRefs: [
        { relativePath: "skill-set/references/synthesize.md" },
        { relativePath: "skill-set/references/authoring-guide.md" },
      ],
      includeSkillSetSkillMd: true,
    },
  };

export const PROMPT_TEMPLATE_IDS = Object.keys(PROMPT_TEMPLATE_SOURCES);
