import { apiFetch } from "./client";
import type { SourceCitation } from "./proposals";

export type ValidationSeverity =
  | "critical"
  | "error"
  | "warning"
  | "info";

export interface ValidationFinding {
  id: string;
  severity: ValidationSeverity;
  category: string;
  message: string;
  recommendation?: string;
  ruleId?: string;
}

export interface LintCategorySummary {
  category: string;
  passed: number;
  total: number;
}

export interface LintReport {
  reportId: string;
  environmentId: string;
  skillName: string;
  sourcePath: string;
  scoredAt: string;
  score: number;
  complianceLevel: string;
  categories: LintCategorySummary[];
  findings: ValidationFinding[];
  recommendedFixes: string[];
  persisted?: boolean;
}

export interface ValidationDimensionScore {
  dimension: string;
  label: string;
  score: number;
  weight: number;
  summary: string;
}

export interface ValidationReport {
  reportId: string;
  environmentId: string;
  skillName: string;
  sourcePath: string;
  scoredAt: string;
  score: number;
  effectivenessLevel: string;
  jobStatement?: string;
  skillNecessity?: string;
  dimensions: ValidationDimensionScore[];
  findings: ValidationFinding[];
  blockingRemediations: string[];
  recommendations: string[];
  rubricTemplateId: string;
  rubricCitations: SourceCitation[];
  deepValidateSessionId?: string;
  persisted?: boolean;
}

export interface ValidationLatestResponse {
  lint?: LintReport;
  validation?: ValidationReport;
}

export async function runSkillValidation(
  environmentId: string,
  skillName: string,
  options?: { mode?: "lint" | "validate" | "both"; persist?: boolean },
): Promise<ValidationLatestResponse> {
  return apiFetch<ValidationLatestResponse>(
    `/api/validation/${encodeURIComponent(environmentId)}/${encodeURIComponent(skillName)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: options?.mode ?? "lint",
        persist: options?.persist ?? false,
      }),
    },
  );
}

export async function fetchLatestValidation(
  environmentId: string,
  skillName: string,
): Promise<ValidationLatestResponse | null> {
  try {
    return await apiFetch<ValidationLatestResponse>(
      `/api/validation/${encodeURIComponent(environmentId)}/${encodeURIComponent(skillName)}/latest`,
    );
  } catch {
    return null;
  }
}
