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

export const AgentSessionKindSchema = z.enum([
  "improve-skill",
  "create-escalation",
  "validate-skill",
  "suggest-relationships",
  "analyze-trigger-conflicts",
  "skill-patch",
]);
export type AgentSessionKind = z.infer<typeof AgentSessionKindSchema>;

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
  /** Advisor session kinds for skill detail (FR-043 / US-034). */
  advisorAgentKinds: z.array(AgentSessionKindSchema).optional(),
});
export type SkillDetail = z.infer<typeof SkillDetailSchema>;

export const HealthPrimaryActionSchema = z.enum(["manual", "agent", "none"]);
export type HealthPrimaryAction = z.infer<typeof HealthPrimaryActionSchema>;

export const HealthFindingSchema = z.object({
  id: z.string(),
  severity: z.enum(["info", "warning", "error"]),
  category: z.string(),
  message: z.string(),
  sourcePath: z.string(),
  recommendation: z.string().optional(),
  environmentId: z.string().optional(),
  skillName: z.string().optional(),
  primaryAction: HealthPrimaryActionSchema.optional(),
  agentKind: AgentSessionKindSchema.optional(),
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

export const PromptSourceRefSchema = z.object({
  relativePath: z.string(),
  sectionHeading: z.string().optional(),
});
export type PromptSourceRef = z.infer<typeof PromptSourceRefSchema>;

export const LoadedPromptSectionSchema = z.object({
  ref: PromptSourceRefSchema,
  content: z.string(),
  heading: z.string().optional(),
});
export type LoadedPromptSection = z.infer<typeof LoadedPromptSectionSchema>;

export const SourceCitationSchema = z.object({
  sourcePath: z.string(),
  heading: z.string().optional(),
  quote: z.string().optional(),
});
export type SourceCitation = z.infer<typeof SourceCitationSchema>;

export const PromptBundleSchema = z.object({
  templateId: z.string(),
  sections: z.array(LoadedPromptSectionSchema),
  sourceRefs: z.array(PromptSourceRefSchema),
  assembledPrompt: z.string(),
});
export type PromptBundle = z.infer<typeof PromptBundleSchema>;

export const PromptBundleContextSchema = z.object({
  environmentId: z.string().optional(),
  skillName: z.string().optional(),
  /** SKILL.md path relative to environment skills root (e.g. demo-skill/SKILL.md). */
  skillMdRelativePath: z.string().optional(),
  /** Injected catalog trigger lines for analyze-trigger-conflicts. */
  triggerCatalogText: z.string().optional(),
  /** Optional relationship map excerpt for suggest-relationships. */
  relationshipMapText: z.string().optional(),
  /** Health scan finding for create-escalation (from Suggest fix). */
  healthFindingText: z.string().optional(),
});
export type PromptBundleContext = z.infer<typeof PromptBundleContextSchema>;

export const AgentHealthFindingContextSchema = z.object({
  id: z.string().optional(),
  category: z.string(),
  message: z.string(),
  recommendation: z.string().optional(),
  sourcePath: z.string().optional(),
});
export type AgentHealthFindingContext = z.infer<
  typeof AgentHealthFindingContextSchema
>;

export const AgentRuntimeSchema = z.enum([
  "claude-headless",
  "claude-background",
  "stub",
]);
export type AgentRuntime = z.infer<typeof AgentRuntimeSchema>;

export const AgentAuthStatusSchema = z.object({
  authenticated: z.boolean(),
  provider: z.enum(["claude", "none"]),
  message: z.string().optional(),
});
export type AgentAuthStatus = z.infer<typeof AgentAuthStatusSchema>;

export const AgentTaskRequestSchema = z.object({
  runtime: AgentRuntimeSchema.optional(),
  kind: AgentSessionKindSchema,
  environmentId: z.string(),
  skillName: z.string(),
  promptTemplateId: z.string().optional(),
  /** When started from a health finding (e.g. missing escalation). */
  healthFinding: AgentHealthFindingContextSchema.optional(),
});
export type AgentTaskRequest = z.infer<typeof AgentTaskRequestSchema>;

export const AgentSessionStatusValueSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);
export type AgentSessionStatusValue = z.infer<
  typeof AgentSessionStatusValueSchema
>;

export const AgentSessionSchema = z.object({
  id: z.string(),
  status: AgentSessionStatusValueSchema,
  runtime: AgentRuntimeSchema,
  kind: AgentSessionKindSchema,
  environmentId: z.string(),
  skillName: z.string(),
  promptTemplateId: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  proposalIds: z.array(z.string()).optional(),
  error: z.string().optional(),
});
export type AgentSession = z.infer<typeof AgentSessionSchema>;

export const AgentSessionStatusSchema = AgentSessionSchema.extend({
  logTail: z.string().optional(),
  artifactDir: z.string().optional(),
  resumeShellCommand: z.string().optional(),
});
export type AgentSessionStatus = z.infer<typeof AgentSessionStatusSchema>;

export const ProposedFileChangeSchema = z.object({
  relativePath: z.string(),
  unifiedDiff: z.string().optional(),
  suggestedContent: z.string().optional(),
});
export type ProposedFileChange = z.infer<typeof ProposedFileChangeSchema>;

export const PatchProposalSchema = z.object({
  patchToken: z.string(),
  kind: z.string(),
  sessionId: z.string().optional(),
  environmentId: z.string(),
  skillName: z.string(),
  rationale: z.string(),
  fileChanges: z.array(ProposedFileChangeSchema),
  citations: z.array(SourceCitationSchema),
  createdAt: z.string(),
});
export type PatchProposal = z.infer<typeof PatchProposalSchema>;

export const ProposeSkillPatchInputSchema = z.object({
  environmentId: z.string(),
  skillName: z.string(),
  kind: z.string().optional(),
  sessionId: z.string().optional(),
  rationale: z.string().min(1),
  fileChanges: z.array(ProposedFileChangeSchema),
  citations: z.array(SourceCitationSchema).min(1),
  patchToken: z.string().optional(),
});
export type ProposeSkillPatchInput = z.infer<
  typeof ProposeSkillPatchInputSchema
>;

/** MCP `propose_skill_patch` inputSchema — derived from {@link ProposeSkillPatchInputSchema} (Contract SSOT). */
export const ProposeSkillPatchMcpInputSchema =
  ProposeSkillPatchInputSchema.shape;

export const EvidenceQuoteSchema = z.object({
  sourceFile: z.string().min(1),
  quote: z.string().min(1),
});
export type EvidenceQuote = z.infer<typeof EvidenceQuoteSchema>;

export const SuggestedEdgeInputSchema = z.object({
  fromSkill: z.string().min(1),
  toSkill: z.string().min(1),
  relationshipType: z.string().min(1),
  candidateAgentGraphEdgeType: z.string().optional(),
  confidence: z.number().min(0).max(1),
  mappingIsApproximate: z.boolean().optional(),
  rationale: z.string().optional(),
  evidence: z
    .object({
      sourceFile: z.string().optional(),
      quote: z.string().optional(),
    })
    .optional(),
});
export type SuggestedEdgeInput = z.infer<typeof SuggestedEdgeInputSchema>;

export const SuggestedEdgeSchema = z.object({
  fromSkill: z.string().min(1),
  toSkill: z.string().min(1),
  relationshipType: z.string().min(1),
  candidateAgentGraphEdgeType: z.string().optional(),
  confidence: z.number().min(0).max(1),
  mappingIsApproximate: z.boolean().optional(),
  rationale: z.string().optional(),
  evidence: EvidenceQuoteSchema,
});
export type SuggestedEdge = z.infer<typeof SuggestedEdgeSchema>;

export const RelationshipProposalSchema = z.object({
  patchToken: z.string(),
  kind: z.literal("relationship-suggestion"),
  sessionId: z.string().optional(),
  environmentId: z.string(),
  skillName: z.string().optional(),
  edges: z.array(SuggestedEdgeSchema),
  rejectedEdges: z
    .array(
      z.object({
        edge: SuggestedEdgeInputSchema,
        reason: z.string(),
      }),
    )
    .optional(),
  createdAt: z.string(),
});
export type RelationshipProposal = z.infer<typeof RelationshipProposalSchema>;

export const TriggerConflictSchema = z.object({
  triggerPhrase: z.string(),
  skillNames: z.array(z.string()),
  rationale: z.string(),
  severity: z.enum(["warning", "error"]),
});
export type TriggerConflict = z.infer<typeof TriggerConflictSchema>;

export const TriggerConflictReportSchema = z.object({
  patchToken: z.string(),
  kind: z.literal("trigger-conflict-report"),
  sessionId: z.string().optional(),
  environmentId: z.string().optional(),
  conflicts: z.array(TriggerConflictSchema),
  scannedSkillCount: z.number().int().nonnegative(),
  createdAt: z.string(),
});
export type TriggerConflictReport = z.infer<typeof TriggerConflictReportSchema>;

export const StoredProposalSchema = z.discriminatedUnion("proposalKind", [
  z.object({
    proposalKind: z.literal("patch"),
    proposal: PatchProposalSchema,
  }),
  z.object({
    proposalKind: z.literal("relationship"),
    proposal: RelationshipProposalSchema,
  }),
  z.object({
    proposalKind: z.literal("trigger-conflicts"),
    proposal: TriggerConflictReportSchema,
  }),
]);
export type StoredProposal = z.infer<typeof StoredProposalSchema>;

export const ValidationSeveritySchema = z.enum([
  "critical",
  "error",
  "warning",
  "info",
]);
export type ValidationSeverity = z.infer<typeof ValidationSeveritySchema>;

export const ValidationFindingSchema = z.object({
  id: z.string(),
  severity: ValidationSeveritySchema,
  category: z.string(),
  message: z.string(),
  recommendation: z.string().optional(),
  ruleId: z.string().optional(),
});
export type ValidationFinding = z.infer<typeof ValidationFindingSchema>;

export const LintCategorySummarySchema = z.object({
  category: z.string(),
  passed: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type LintCategorySummary = z.infer<typeof LintCategorySummarySchema>;

export const LintReportSchema = z.object({
  reportId: z.string(),
  environmentId: z.string(),
  skillName: z.string(),
  sourcePath: z.string(),
  scoredAt: z.string(),
  score: z.number().min(0).max(100),
  complianceLevel: z.string(),
  categories: z.array(LintCategorySummarySchema),
  findings: z.array(ValidationFindingSchema),
  recommendedFixes: z.array(z.string()),
  persisted: z.boolean().optional(),
});
export type LintReport = z.infer<typeof LintReportSchema>;

export const ValidationDimensionScoreSchema = z.object({
  dimension: z.string(),
  label: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number(),
  summary: z.string(),
});
export type ValidationDimensionScore = z.infer<
  typeof ValidationDimensionScoreSchema
>;

export const ValidationReportSchema = z.object({
  reportId: z.string(),
  environmentId: z.string(),
  skillName: z.string(),
  sourcePath: z.string(),
  scoredAt: z.string(),
  score: z.number().min(0).max(100),
  effectivenessLevel: z.string(),
  jobStatement: z.string().optional(),
  skillNecessity: z.string().optional(),
  dimensions: z.array(ValidationDimensionScoreSchema),
  findings: z.array(ValidationFindingSchema),
  blockingRemediations: z.array(z.string()),
  recommendations: z.array(z.string()),
  rubricTemplateId: z.string(),
  rubricCitations: z.array(SourceCitationSchema),
  deepValidateSessionId: z.string().optional(),
  persisted: z.boolean().optional(),
});
export type ValidationReport = z.infer<typeof ValidationReportSchema>;

export const ValidationDimensionDeltaSchema = z.object({
  dimension: z.string(),
  label: z.string(),
  before: z.number(),
  after: z.number(),
  delta: z.number(),
});
export type ValidationDimensionDelta = z.infer<
  typeof ValidationDimensionDeltaSchema
>;

export const ValidationCompareResultSchema = z.object({
  environmentId: z.string(),
  skillName: z.string(),
  beforeId: z.string(),
  afterId: z.string(),
  dimensionDeltas: z.array(ValidationDimensionDeltaSchema),
});
export type ValidationCompareResult = z.infer<
  typeof ValidationCompareResultSchema
>;

export const PersistedValidationEnvelopeSchema = z.discriminatedUnion(
  "kind",
  [
    z.object({ kind: z.literal("lint"), report: LintReportSchema }),
    z.object({ kind: z.literal("validation"), report: ValidationReportSchema }),
  ],
);
export type PersistedValidationEnvelope = z.infer<
  typeof PersistedValidationEnvelopeSchema
>;
