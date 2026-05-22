import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import type { SkillGraphService } from "../domain/SkillGraphService.js";
import type { SkillHealthService } from "../domain/SkillHealthService.js";
import type { SkillValidationService } from "../domain/SkillValidationService.js";
import type { ChangeProposalService } from "../domain/ChangeProposalService.js";
import type { RelationshipSuggestionAdvisor } from "../ai/RelationshipSuggestionAdvisor.js";
import {
  RelationshipProposalSchema,
  SuggestedEdgeInputSchema,
  TriggerConflictReportSchema,
} from "../domain/types.js";
import {
  buildCatalogHealthPayload,
  buildGraphNeighborsPayload,
  buildSkillGraphPayload,
} from "../adapters/graphHealthPayload.js";
import {
  GraphNodeTypeSchema,
  HealthStatusSchema,
  SkillDetailSchema,
  SkillSummarySchema,
  ValidationReportSchema,
} from "../domain/types.js";
import { executeLintSkill } from "./toolExecutors.js";

export {
  buildCatalogHealthPayload,
  buildGraphNeighborsPayload,
  buildSkillGraphPayload,
} from "../adapters/graphHealthPayload.js";

const graphFilterInput = {
  nodeTypes: z
    .array(GraphNodeTypeSchema)
    .optional()
    .describe("Keep nodes whose type is listed"),
  relationshipTypes: z
    .array(z.string())
    .optional()
    .describe("Keep edges whose relationship type is listed"),
  scope: z.string().optional().describe("Filter by node scope"),
  project: z
    .string()
    .optional()
    .describe("Filter by environmentId or project field"),
  confidenceMin: z.number().optional().describe("Minimum edge confidence"),
  confidenceMax: z.number().optional().describe("Maximum edge confidence"),
  healthStatus: HealthStatusSchema.optional().describe(
    "Filter skill endpoints by catalog health status",
  ),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Max edges per page (default 500)"),
  cursor: z.string().optional().describe("Opaque pagination cursor from prior page"),
};

export interface GraphHealthDeps {
  graph: SkillGraphService;
  health: SkillHealthService;
}

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

export function registerGraphHealthTools(
  server: McpServer,
  deps: GraphHealthDeps,
): void {
  const { graph, health } = deps;

  server.registerTool(
    "get_skill_graph",
    {
      title: "Get skill graph",
      description:
        "Return filtered skill graph nodes, edges, and high-risk refactor sequences.",
      inputSchema: graphFilterInput,
    },
    async (input) => {
      const graphResult = buildSkillGraphPayload(graph, input);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ graph: graphResult }, null, 2),
          },
        ],
        structuredContent: { graph: graphResult },
      };
    },
  );

  server.registerTool(
    "graph_neighbors",
    {
      title: "Graph neighbors",
      description:
        "Return the local subgraph around a node (depth 1–3, default 1).",
      inputSchema: {
        nodeId: z
          .string()
          .min(1)
          .describe('Graph node id, e.g. "skill:user:demo-skill"'),
        depth: z
          .number()
          .int()
          .min(1)
          .max(3)
          .optional()
          .describe("BFS depth (max 3)"),
        ...graphFilterInput,
      },
    },
    async (input) => {
      const graphResult = buildGraphNeighborsPayload(graph, input);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ graph: graphResult }, null, 2),
          },
        ],
        structuredContent: { graph: graphResult },
      };
    },
  );

  server.registerTool(
    "check_catalog_health",
    {
      title: "Check catalog health",
      description:
        "Run catalog, index, map, path, and reference health checks.",
      inputSchema: {},
    },
    async () => {
      const report = buildCatalogHealthPayload(health);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ report }, null, 2),
          },
        ],
        structuredContent: { report },
      };
    },
  );
}

export function registerValidationTools(
  server: McpServer,
  validation: SkillValidationService,
): void {
  server.registerTool(
    "lint_skill",
    {
      title: "Lint skill",
      description:
        "Run deterministic structural lint checks for one skill (no LLM).",
      inputSchema: {
        environmentId: z.string(),
        skillName: z.string(),
        persist: z
          .boolean()
          .optional()
          .describe("Persist report under .generated/reports when writesEnabled"),
      },
    },
    async (input) => executeLintSkill(validation, input),
  );

  server.registerTool(
    "validate_skill",
    {
      title: "Validate skill",
      description:
        "Run rubric-based content validation for one skill using validate.md sources.",
      inputSchema: {
        environmentId: z.string(),
        skillName: z.string(),
        persist: z.boolean().optional(),
        deep: z
          .boolean()
          .optional()
          .describe("Start optional validate-skill agent session when runner is configured"),
      },
    },
    async ({ environmentId, skillName, persist, deep }) => {
      try {
        const report = await validation.validate(environmentId, skillName, {
          persist,
          deep,
        });
        const parsed = ValidationReportSchema.parse(report);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ validation: parsed }, null, 2),
            },
          ],
          structuredContent: { validation: parsed },
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Validation failed";
        return {
          isError: true,
          content: [
            { type: "text" as const, text: JSON.stringify({ error: message }) },
          ],
        };
      }
    },
  );
}

export interface RelationshipProposalToolDeps {
  catalog: SkillCatalogService;
  proposals: ChangeProposalService;
  relationshipAdvisor: RelationshipSuggestionAdvisor;
}

export function registerRelationshipProposalTools(
  server: McpServer,
  deps: RelationshipProposalToolDeps,
): void {
  const { catalog, proposals, relationshipAdvisor } = deps;

  server.registerTool(
    "suggest_relationship_edges",
    {
      title: "Suggest relationship edges",
      description:
        "Validate and store proposed relationship edges with evidence quotes (does not write skill-relationships.json).",
      inputSchema: {
        environmentId: z.string(),
        skillName: z
          .string()
          .optional()
          .describe("Anchor skill; when edges omitted, drafts from the relationship map"),
        sessionId: z.string().optional(),
        edges: z
          .array(SuggestedEdgeInputSchema)
          .optional()
          .describe("Proposed edges from the agent session"),
      },
    },
    async ({ environmentId, skillName, sessionId, edges }) => {
      try {
        const edgeInputs =
          edges ??
          (skillName
            ? relationshipAdvisor.draftEdgesForSkill(skillName)
            : []);
        const { accepted, rejected } =
          relationshipAdvisor.validateEdges(edgeInputs);
        if (accepted.length === 0) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  error: "validation_failed",
                  message:
                    rejected[0]?.reason ??
                    "No valid edges; evidence.quote and evidence.sourceFile are required",
                  rejected,
                }),
              },
            ],
          };
        }
        const proposal = proposals.ingestRelationship({
          environmentId,
          skillName,
          sessionId,
          edges: accepted,
          rejectedEdges: rejected.length > 0 ? rejected : undefined,
        });
        const parsed = RelationshipProposalSchema.parse(proposal);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ proposal: parsed, rejectedCount: rejected.length }, null, 2),
            },
          ],
          structuredContent: { proposal: parsed, rejectedCount: rejected.length },
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Relationship proposal failed";
        return {
          isError: true,
          content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
        };
      }
    },
  );

  server.registerTool(
    "detect_trigger_conflicts",
    {
      title: "Detect trigger conflicts",
      description:
        "Analyze overlapping trigger phrases across skills in the catalog.",
      inputSchema: {
        environmentId: z
          .string()
          .optional()
          .describe("Limit analysis to one environment"),
        sessionId: z.string().optional(),
      },
    },
    async ({ environmentId, sessionId }) => {
      try {
        const skills = catalog.listSkills({ environmentId });
        const conflicts = relationshipAdvisor.detectTriggerConflicts({
          environmentId,
        });
        const report = proposals.ingestTriggerConflicts({
          environmentId,
          sessionId,
          conflicts,
          scannedSkillCount: skills.length,
        });
        const parsed = TriggerConflictReportSchema.parse(report);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ report: parsed }, null, 2),
            },
          ],
          structuredContent: { report: parsed },
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Trigger conflict analysis failed";
        return {
          isError: true,
          content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
        };
      }
    },
  );
}
