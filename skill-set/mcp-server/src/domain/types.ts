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
