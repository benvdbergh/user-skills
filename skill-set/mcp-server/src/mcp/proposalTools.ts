import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SkillImprovementAdvisor } from "../ai/SkillImprovementAdvisor.js";
import { ProposalValidationError } from "../domain/proposalValidation.js";
import {
  PatchProposalSchema,
  ProposedFileChangeSchema,
  ProposeSkillPatchInputSchema,
  SourceCitationSchema,
} from "../domain/types.js";

export function registerProposalTools(
  server: McpServer,
  skillAdvisor: SkillImprovementAdvisor,
): void {
  server.registerTool(
    "propose_skill_patch",
    {
      title: "Propose skill patch",
      description:
        "Store a reviewable patch proposal (no direct file writes). Requires fileChanges with suggestedContent or unifiedDiff.",
      inputSchema: {
        environmentId: z.string(),
        skillName: z.string(),
        kind: z.string().optional(),
        sessionId: z.string().optional(),
        rationale: z.string().min(1),
        fileChanges: z.array(ProposedFileChangeSchema).min(1),
        citations: z.array(SourceCitationSchema).min(1),
        patchToken: z.string().optional(),
      },
    },
    async (input) => {
      try {
        const parsed = ProposeSkillPatchInputSchema.parse(input);
        const proposal = PatchProposalSchema.parse(
          skillAdvisor.proposePatch(parsed),
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ proposal }, null, 2),
            },
          ],
          structuredContent: { proposal },
        };
      } catch (err) {
        const message =
          err instanceof ProposalValidationError
            ? err.message
            : err instanceof Error
              ? err.message
              : "propose_skill_patch failed";
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: message }),
            },
          ],
        };
      }
    },
  );
}
