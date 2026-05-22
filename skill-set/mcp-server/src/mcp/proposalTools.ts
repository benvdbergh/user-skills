import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SkillImprovementAdvisor } from "../ai/SkillImprovementAdvisor.js";
import { ProposalValidationError } from "../domain/proposalValidation.js";
import {
  PatchProposalSchema,
  ProposeSkillPatchInputSchema,
  ProposeSkillPatchMcpInputSchema,
  type PatchProposal,
} from "../domain/types.js";

export type ProposeSkillPatchToolResult =
  | { ok: true; proposal: PatchProposal }
  | { ok: false; error: string };

/** Shared sample for MCP/HTTP parity tests (NFR-011). */
export function sampleProposeSkillPatchInput(
  overrides?: Partial<z.infer<typeof ProposeSkillPatchInputSchema>>,
): z.infer<typeof ProposeSkillPatchInputSchema> {
  return {
    environmentId: "user",
    skillName: "demo-skill",
    kind: "improve-skill",
    rationale: "MCP smoke patch proposal.",
    fileChanges: [
      {
        relativePath: "demo-skill/SKILL.md",
        suggestedContent:
          "---\nname: demo-skill\ndescription: Smoke.\n---\n\n# Demo\n",
      },
    ],
    citations: [{ sourcePath: "demo-skill/SKILL.md" }],
    ...overrides,
  };
}

export async function executeProposeSkillPatch(
  input: unknown,
  skillAdvisor: SkillImprovementAdvisor,
): Promise<ProposeSkillPatchToolResult> {
  try {
    const parsed = ProposeSkillPatchInputSchema.parse(input);
    const proposal = PatchProposalSchema.parse(
      skillAdvisor.proposePatch(parsed),
    );
    return { ok: true, proposal };
  } catch (err) {
    const message =
      err instanceof ProposalValidationError
        ? err.message
        : err instanceof Error
          ? err.message
          : "propose_skill_patch failed";
    return { ok: false, error: message };
  }
}

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
      inputSchema: ProposeSkillPatchMcpInputSchema,
    },
    async (input) => {
      const result = await executeProposeSkillPatch(input, skillAdvisor);
      if (!result.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: result.error }),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ proposal: result.proposal }, null, 2),
          },
        ],
        structuredContent: { proposal: result.proposal },
      };
    },
  );
}
