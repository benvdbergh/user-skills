import { z } from "zod";

export const HealthStatusSchema = z.enum(["ok", "warning", "error"]);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const SkillSummarySchema = z.object({
  environmentId: z.string(),
  scope: z.string(),
  name: z.string(),
  path: z.string(),
  description: z.string(),
  triggers: z.array(z.string()),
  workflows: z.array(z.string()),
  tier: z.enum(["always", "deferred"]),
  health: z.object({
    status: HealthStatusSchema,
    findings: z.number().int().nonnegative(),
  }),
});
export type SkillSummary = z.infer<typeof SkillSummarySchema>;

export const SkillFileRefSchema = z.object({
  kind: z.enum(["reference", "script", "asset"]),
  relativePath: z.string(),
  exists: z.boolean(),
});
export type SkillFileRef = z.infer<typeof SkillFileRefSchema>;

export const SkillDetailSchema = SkillSummarySchema.extend({
  license: z.string().optional(),
  compatibility: z.string().optional(),
  allowedTools: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  descriptionLength: z.number().int().nonnegative(),
  references: z.array(SkillFileRefSchema),
  scripts: z.array(SkillFileRefSchema),
  assets: z.array(SkillFileRefSchema),
  hasSkillEscalation: z.boolean(),
  missingReferences: z.array(z.string()),
  sourcePath: z.string(),
});
export type SkillDetail = z.infer<typeof SkillDetailSchema>;

export const HealthFindingSchema = z.object({
  id: z.string(),
  severity: z.enum(["info", "warning", "error"]),
  category: z.string(),
  message: z.string(),
  sourcePath: z.string(),
  recommendation: z.string().optional(),
});
export type HealthFinding = z.infer<typeof HealthFindingSchema>;

export const CatalogHealthSummarySchema = z.object({
  info: z.number().int().nonnegative(),
  warning: z.number().int().nonnegative(),
  error: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type CatalogHealthSummary = z.infer<typeof CatalogHealthSummarySchema>;

export const CatalogHealthReportSchema = z.object({
  findings: z.array(HealthFindingSchema),
  scannedAt: z.string(),
  durationMs: z.number().nonnegative(),
  summary: CatalogHealthSummarySchema,
});
export type CatalogHealthReport = z.infer<typeof CatalogHealthReportSchema>;

export const EnvironmentSchema = z.object({
  id: z.string(),
  scope: z.string(),
  path: z.string(),
  skillIndexPath: z.string(),
  displayName: z.string().optional(),
  inventoryPath: z.string().optional(),
  pathResolvable: z.boolean(),
  warnings: z.array(z.string()).optional(),
});
export type Environment = z.infer<typeof EnvironmentSchema>;

export const GraphNodeTypeSchema = z.enum([
  "skill",
  "mcp_tool",
  "environment",
  "workflow",
  "reference",
  "script",
]);
export type GraphNodeType = z.infer<typeof GraphNodeTypeSchema>;

export const SkillGraphNodeSchema = z.object({
  id: z.string(),
  type: GraphNodeTypeSchema,
  label: z.string(),
  scope: z.string().optional(),
  environmentId: z.string().optional(),
  project: z.string().optional(),
  sourcePath: z.string().optional(),
  health: z
    .object({
      status: HealthStatusSchema,
      findings: z.number().int().nonnegative(),
    })
    .optional(),
});
export type SkillGraphNode = z.infer<typeof SkillGraphNodeSchema>;

export const SkillGraphEdgeEvidenceSchema = z.object({
  sourceFile: z.string().optional(),
  quote: z.string().optional(),
});
export type SkillGraphEdgeEvidence = z.infer<
  typeof SkillGraphEdgeEvidenceSchema
>;

export const SkillGraphEdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.string(),
  confidence: z.number(),
  mappingIsApproximate: z.boolean(),
  evidence: SkillGraphEdgeEvidenceSchema.optional(),
  notes: z.string().optional(),
  candidateAgentGraphEdgeType: z.string().optional(),
});
export type SkillGraphEdge = z.infer<typeof SkillGraphEdgeSchema>;

export const GraphFilterSchema = z.object({
  nodeTypes: z.array(GraphNodeTypeSchema).optional(),
  relationshipTypes: z.array(z.string()).optional(),
  scope: z.string().optional(),
  project: z.string().optional(),
  confidenceMin: z.number().optional(),
  confidenceMax: z.number().optional(),
  healthStatus: HealthStatusSchema.optional(),
  limit: z.number().int().positive().optional(),
  cursor: z.string().optional(),
});
export type GraphFilter = z.infer<typeof GraphFilterSchema>;

export const GraphNeighborsQuerySchema = GraphFilterSchema.extend({
  nodeId: z.string(),
  depth: z.number().int().min(1).max(3).optional(),
});
export type GraphNeighborsQuery = z.infer<typeof GraphNeighborsQuerySchema>;

export const HighRiskRefactorSequenceSchema = z.object({
  id: z.string(),
  sharedCapability: z.string(),
  whyHighRisk: z.string(),
  downstreamSkills: z.array(z.string()),
  suggestedSafeSequence: z.array(z.string()),
});
export type HighRiskRefactorSequence = z.infer<
  typeof HighRiskRefactorSequenceSchema
>;

export const SkillGraphResultSchema = z.object({
  nodes: z.array(SkillGraphNodeSchema),
  edges: z.array(SkillGraphEdgeSchema),
  highRiskRefactorSequences: z.array(HighRiskRefactorSequenceSchema),
  nextCursor: z.string().optional(),
  mapVersion: z.number().optional(),
  mapUpdated: z.string().optional(),
});
export type SkillGraphResult = z.infer<typeof SkillGraphResultSchema>;

const RelationshipEvidenceSchema = z.object({
  source_file: z.string().optional(),
  quote: z.string().optional(),
});

export const RelationshipMapEntrySchema = z.object({
  id: z.string(),
  from_skill: z.string(),
  to_skill: z.string(),
  relationship_type: z.string(),
  candidate_agent_graph_edge_type: z.string().optional(),
  mapping_is_approximate: z.boolean(),
  evidence: RelationshipEvidenceSchema.optional(),
  confidence_score: z.number(),
  notes: z.string().optional(),
});
export type RelationshipMapEntry = z.infer<typeof RelationshipMapEntrySchema>;

export const RelationshipMapFileSchema = z.object({
  version: z.number().optional(),
  updated: z.string().optional(),
  external_endpoint_patterns: z.array(z.string()).optional(),
  skills: z.object({
    user_level: z.array(z.string()),
    project_level_ai_vault: z.array(z.string()).optional(),
  }),
  relationships: z.array(RelationshipMapEntrySchema),
  high_risk_refactor_sequences: z
    .array(
      z.object({
        id: z.string(),
        shared_capability: z.string(),
        why_high_risk: z.string(),
        downstream_skills: z.array(z.string()),
        suggested_safe_sequence: z.array(z.string()),
      }),
    )
    .optional(),
});
export type RelationshipMapFile = z.infer<typeof RelationshipMapFileSchema>;
