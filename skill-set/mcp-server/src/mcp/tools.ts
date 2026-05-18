import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import {
  SkillDetailSchema,
  SkillSummarySchema,
} from "../domain/types.js";

export function registerCatalogTools(
  server: McpServer,
  catalog: SkillCatalogService,
): void {
  server.registerTool(
    "list_skills",
    {
      title: "List skills",
      description:
        "Return normalized skill summaries across configured environments.",
      inputSchema: {
        environmentId: z
          .string()
          .optional()
          .describe("Filter to one environment id (e.g. user)"),
      },
    },
    async ({ environmentId }) => {
      const skills = catalog.listSkills({ environmentId });
      const parsed = z.array(SkillSummarySchema).parse(skills);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ skills: parsed }, null, 2),
          },
        ],
        structuredContent: { skills: parsed },
      };
    },
  );

  server.registerTool(
    "search_skills",
    {
      title: "Search skills",
      description:
        "Search skills by name, trigger phrase, workflow, or description.",
      inputSchema: {
        query: z.string().min(1),
        environmentId: z.string().optional(),
      },
    },
    async ({ query, environmentId }) => {
      const skills = catalog.searchSkills({ query, environmentId });
      const parsed = z.array(SkillSummarySchema).parse(skills);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ skills: parsed }, null, 2),
          },
        ],
        structuredContent: { skills: parsed },
      };
    },
  );

  server.registerTool(
    "get_skill_detail",
    {
      title: "Get skill detail",
      description: "Return parsed detail for one skill in an environment.",
      inputSchema: {
        environmentId: z.string(),
        skillName: z.string(),
      },
    },
    async ({ environmentId, skillName }) => {
      const detail = catalog.getSkillDetail(environmentId, skillName);
      if (!detail) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: "not_found",
                message: `Skill not found: ${environmentId}/${skillName}`,
              }),
            },
          ],
        };
      }
      const parsed = SkillDetailSchema.parse(detail);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ skill: parsed }, null, 2),
          },
        ],
        structuredContent: { skill: parsed },
      };
    },
  );
}
