import type { SkillValidationService } from "../domain/SkillValidationService.js";
import { LintReportSchema } from "../domain/types.js";

export type McpToolCallResult = {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

export function executeLintSkill(
  validation: SkillValidationService,
  input: { environmentId: string; skillName: string; persist?: boolean },
): McpToolCallResult {
  try {
    const report = validation.lint(input.environmentId, input.skillName, {
      persist: input.persist,
    });
    const parsed = LintReportSchema.parse(report);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ lint: parsed }, null, 2),
        },
      ],
      structuredContent: { lint: parsed },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lint failed";
    return {
      isError: true,
      content: [
        { type: "text", text: JSON.stringify({ error: message }) },
      ],
    };
  }
}
