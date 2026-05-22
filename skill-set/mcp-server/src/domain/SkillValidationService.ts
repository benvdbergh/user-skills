import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import matter from "gray-matter";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import { resolvePathInfo } from "../config/pathModel.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import { validationReportDir } from "../ai/generatedPaths.js";
import type { AgentSessionRunner } from "../ai/AgentSessionRunner.js";
import type { PromptSourceService } from "../prompts/PromptSourceService.js";
import { parseSkillMd } from "./SkillMdParser.js";
import type { SkillCatalogService } from "./SkillCatalogService.js";
import {
  LintReportSchema,
  ValidationCompareResultSchema,
  ValidationReportSchema,
  PersistedValidationEnvelopeSchema,
  type LintReport,
  type SkillDetail,
  type ValidationCompareResult,
  type ValidationDimensionScore,
  type ValidationFinding,
  type ValidationReport,
} from "./types.js";

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Report filenames use `randomUUID()` — reject traversal via reportId (NFR-009). */
const REPORT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertValidReportId(reportId: string): void {
  if (!REPORT_ID.test(reportId)) {
    throw new Error(`Invalid report id: ${reportId}`);
  }
}

const LINT_DEDUCTIONS: Record<ValidationFinding["severity"], number> = {
  critical: 20,
  error: 10,
  warning: 5,
  info: 0,
};

const VALIDATE_DEDUCTIONS: Record<ValidationFinding["severity"], number> = {
  critical: 25,
  error: 15,
  warning: 5,
  info: 0,
};

const DIMENSION_WEIGHTS: {
  dimension: string;
  label: string;
  weight: number;
  categories: string[];
}[] = [
  {
    dimension: "instruction-quality",
    label: "Instruction Quality",
    weight: 0.3,
    categories: ["instruction-quality", "workflow-coherence"],
  },
  {
    dimension: "token-economics",
    label: "Token Economics",
    weight: 0.2,
    categories: ["token-economics"],
  },
  {
    dimension: "tool-context",
    label: "Tool & Context Fitness",
    weight: 0.2,
    categories: ["tool-context", "context"],
  },
  {
    dimension: "prompt-engineering",
    label: "Prompt Engineering",
    weight: 0.15,
    categories: ["prompt-engineering"],
  },
  {
    dimension: "ecosystem-fitness",
    label: "Ecosystem Fitness",
    weight: 0.15,
    categories: ["ecosystem-fitness", "escalation"],
  },
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /disregard\s+(your\s+)?(prior|previous)\s+instructions/i,
];

const CREDENTIAL_PATTERNS = [
  /\bsk-[a-zA-Z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_-]{16,}/i,
];

const STANDARD_SKILL_DIRS = new Set([
  "scripts",
  "references",
  "assets",
]);

const LATEST_LINT_POINTER = "latest-lint.json";
const LATEST_VALIDATION_POINTER = "latest-validation.json";
const LEGACY_LATEST_POINTER = "latest.json";

const REPORT_POINTER_FILES = new Set([
  LATEST_LINT_POINTER,
  LATEST_VALIDATION_POINTER,
  LEGACY_LATEST_POINTER,
]);

export interface LintOptions {
  persist?: boolean;
}

export interface ValidateOptions {
  persist?: boolean;
  deep?: boolean;
}

export interface RunValidationOptions {
  mode?: "lint" | "validate" | "both";
  persist?: boolean;
  deep?: boolean;
}

export class SkillValidationService {
  constructor(
    private readonly config: SkillLabConfig,
    private readonly catalog: SkillCatalogService,
    private readonly prompts: PromptSourceService,
    private readonly agent?: AgentSessionRunner,
  ) {}

  lint(
    environmentId: string,
    skillName: string,
    options: LintOptions = {},
  ): LintReport {
    const detail = this.requireDetail(environmentId, skillName);
    const findings = this.runLintChecks(detail);
    const categories = summarizeLintCategories(findings);
    const score = scoreFindings(findings, LINT_DEDUCTIONS);
    const report = LintReportSchema.parse({
      reportId: randomUUID(),
      environmentId,
      skillName,
      sourcePath: detail.sourcePath,
      scoredAt: new Date().toISOString(),
      score,
      complianceLevel: lintComplianceLevel(score),
      categories,
      findings,
      recommendedFixes: buildRecommendedFixes(findings),
    });
    if (options.persist) {
      report.persisted = this.persistReport(environmentId, skillName, {
        kind: "lint",
        report,
      });
    }
    return report;
  }

  async validate(
    environmentId: string,
    skillName: string,
    options: ValidateOptions = {},
  ): Promise<ValidationReport> {
    const detail = this.requireDetail(environmentId, skillName);
    const findings = this.runValidateChecks(detail);
    const dimensions = scoreDimensions(findings);
    const score = aggregateDimensionScore(dimensions);
    const rubricTemplateId = "validate-skill-effectiveness";
    const bundle = this.prompts.buildPromptBundle(rubricTemplateId, {
      environmentId,
      skillName,
      skillMdRelativePath: detail.path,
    });
    const rubricCitations = this.prompts.resolveCitations(
      bundle.sourceRefs,
      {
        environmentId,
        skillName,
        skillMdRelativePath: detail.path,
      },
    );

    const blockingRemediations = findings
      .filter((f) => f.severity === "critical" || f.severity === "error")
      .map((f) => f.recommendation ?? f.message);

    const report = ValidationReportSchema.parse({
      reportId: randomUUID(),
      environmentId,
      skillName,
      sourcePath: detail.sourcePath,
      scoredAt: new Date().toISOString(),
      score,
      effectivenessLevel: validateEffectivenessLevel(score),
      jobStatement: buildJobStatement(detail),
      skillNecessity: assessSkillNecessity(detail, findings),
      dimensions,
      findings,
      blockingRemediations,
      recommendations: buildValidateRecommendations(findings),
      rubricTemplateId,
      rubricCitations,
    });

    if (options.deep && this.agent) {
      const session = await this.agent.start({
        kind: "validate-skill",
        environmentId,
        skillName,
        runtime: "stub",
      });
      report.deepValidateSessionId = session.id;
    }

    if (options.persist) {
      report.persisted = this.persistReport(environmentId, skillName, {
        kind: "validation",
        report,
      });
    }

    return report;
  }

  async run(
    environmentId: string,
    skillName: string,
    options: RunValidationOptions = {},
  ): Promise<{ lint?: LintReport; validation?: ValidationReport }> {
    const mode = options.mode ?? "both";
    const persist = options.persist ?? false;
    const out: { lint?: LintReport; validation?: ValidationReport } = {};
    if (mode === "lint" || mode === "both") {
      out.lint = this.lint(environmentId, skillName, { persist });
    }
    if (mode === "validate" || mode === "both") {
      out.validation = await this.validate(environmentId, skillName, {
        persist,
        deep: options.deep,
      });
    }
    return out;
  }

  getLatest(
    environmentId: string,
    skillName: string,
  ): { lint?: LintReport; validation?: ValidationReport } {
    const dir = validationReportDir(
      this.config.skillsRoot,
      environmentId,
      skillName,
    );
    if (!fs.existsSync(dir)) return {};
    assertPathUnderRoots(dir, this.config.allowedRoots);

    let lint = readLatestEnvelope(
      dir,
      LATEST_LINT_POINTER,
      this.config.allowedRoots,
      "lint",
    )?.report;
    let validation = readLatestEnvelope(
      dir,
      LATEST_VALIDATION_POINTER,
      this.config.allowedRoots,
      "validation",
    )?.report;

    if (!lint || !validation) {
      const legacy = readLatestEnvelope(
        dir,
        LEGACY_LATEST_POINTER,
        this.config.allowedRoots,
      );
      if (legacy) {
        if (legacy.kind === "lint" && !lint) lint = legacy.report;
        if (legacy.kind === "validation" && !validation) {
          validation = legacy.report;
        }
      }
    }

    if (lint || validation) {
      const out: { lint?: LintReport; validation?: ValidationReport } = {};
      if (lint) out.lint = LintReportSchema.parse(lint);
      if (validation) out.validation = ValidationReportSchema.parse(validation);
      return out;
    }

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json") && !REPORT_POINTER_FILES.has(f))
      .filter((f) => REPORT_ID.test(f.slice(0, -".json".length)))
      .map((f) => {
        const filePath = path.join(dir, f);
        assertPathUnderRoots(filePath, this.config.allowedRoots);
        return {
          name: f,
          mtime: fs.statSync(filePath).mtimeMs,
        };
      })
      .sort((a, b) => b.mtime - a.mtime);

    for (const { name } of files) {
      const filePath = path.join(dir, name);
      assertPathUnderRoots(filePath, this.config.allowedRoots);
      const raw = JSON.parse(
        fs.readFileSync(filePath, "utf8"),
      ) as unknown;
      const envelope = PersistedValidationEnvelopeSchema.parse(raw);
      if (envelope.kind === "lint" && !lint) lint = envelope.report;
      if (envelope.kind === "validation" && !validation) {
        validation = envelope.report;
      }
      if (lint && validation) break;
    }
    return { lint, validation };
  }

  compare(
    environmentId: string,
    skillName: string,
    beforeId: string,
    afterId: string,
  ): ValidationCompareResult {
    const before = this.loadReport(environmentId, skillName, beforeId);
    const after = this.loadReport(environmentId, skillName, afterId);
    if (before.kind !== "validation" || after.kind !== "validation") {
      throw new Error("Compare requires validation reports for both ids");
    }
    const dimensionDeltas = before.report.dimensions.map((b) => {
      const a = after.report.dimensions.find((d) => d.dimension === b.dimension);
      const afterScore = a?.score ?? 0;
      return {
        dimension: b.dimension,
        label: b.label,
        before: b.score,
        after: afterScore,
        delta: afterScore - b.score,
      };
    });
    return ValidationCompareResultSchema.parse({
      environmentId,
      skillName,
      beforeId,
      afterId,
      dimensionDeltas,
    });
  }

  private requireDetail(
    environmentId: string,
    skillName: string,
  ): SkillDetail {
    const detail = this.catalog.getSkillDetail(environmentId, skillName);
    if (!detail) {
      throw new Error(`Skill not found: ${environmentId}/${skillName}`);
    }
    return detail;
  }

  private skillMdAbsolutePath(detail: SkillDetail): string {
    const env = this.catalog
      .listEnvironments()
      .find((e) => e.id === detail.environmentId);
    if (!env) {
      throw new Error(`Environment not found: ${detail.environmentId}`);
    }
    const indexInfo = resolvePathInfo(env.skillIndexPath);
    if (!indexInfo.resolved || !indexInfo.resolvable) {
      throw new Error(`Skill index not resolvable for ${detail.environmentId}`);
    }
    const skillsRoot = path.dirname(indexInfo.resolved);
    return path.join(skillsRoot, detail.path.replace(/\//g, path.sep));
  }

  private readSkillFiles(detail: SkillDetail): {
    skillMdPath: string;
    skillDir: string;
    body: string;
    frontmatter: Record<string, unknown>;
    parsed: ReturnType<typeof parseSkillMd>;
  } {
    const skillMdPath = assertPathUnderRoots(
      this.skillMdAbsolutePath(detail),
      this.config.allowedRoots,
    );
    const skillDir = path.dirname(skillMdPath);
    const text = fs.readFileSync(skillMdPath, "utf8");
    const { data, content } = matter(text);
    const parsed = parseSkillMd(skillMdPath, detail.tier);
    return {
      skillMdPath,
      skillDir,
      body: content,
      frontmatter: data as Record<string, unknown>,
      parsed,
    };
  }

  private runLintChecks(detail: SkillDetail): ValidationFinding[] {
    const findings: ValidationFinding[] = [];
    const { skillMdPath, skillDir, body, frontmatter, parsed } =
      this.readSkillFiles(detail);
    const folderName = path.basename(skillDir);

    if (!fs.existsSync(skillMdPath)) {
      findings.push(lintFinding("S1", "critical", "structural", "SKILL.md is missing"));
    }

    if (!KEBAB.test(folderName)) {
      findings.push(
        lintFinding(
          "S2",
          "critical",
          "structural",
          `Folder name "${folderName}" is not kebab-case`,
          `Rename folder to a kebab-case slug matching the skill name`,
        ),
      );
    }

    if (fs.existsSync(path.join(skillDir, "README.md"))) {
      findings.push(
        lintFinding(
          "S3",
          "warning",
          "structural",
          "README.md found inside skill folder",
          "Remove README.md; use SKILL.md as the entry point",
        ),
      );
    }

    const traversal = /\.\.\//;
    if (traversal.test(body) || traversal.test(parsed.description)) {
      findings.push(
        lintFinding(
          "S4",
          "critical",
          "structural",
          "Path traversal (../) found in skill references",
        ),
      );
    }

    for (const entry of fs.readdirSync(skillDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (!STANDARD_SKILL_DIRS.has(entry.name)) {
        findings.push(
          lintFinding(
            "S5",
            "warning",
            "structural",
            `Non-standard directory "${entry.name}" in skill folder`,
          ),
        );
      }
    }

    for (const missing of detail.missingReferences) {
      findings.push(
        lintFinding(
          "S6",
          "error",
          "structural",
          `Referenced file missing: ${missing}`,
          `Create ${missing} or remove the reference from SKILL.md`,
        ),
      );
    }

    if (!body.trim()) {
      findings.push(
        lintFinding(
          "S7",
          "error",
          "structural",
          "SKILL.md body is empty beyond frontmatter",
        ),
      );
    }

    const raw = fs.readFileSync(skillMdPath, "utf8");
    if (!raw.startsWith("---")) {
      findings.push(
        lintFinding("Y1", "critical", "syntax", "YAML frontmatter opening --- missing"),
      );
    } else if (!/^---\s*$/m.test(raw.slice(3))) {
      findings.push(
        lintFinding("Y1", "critical", "syntax", "YAML frontmatter closing --- missing"),
      );
    }

    const name = String(frontmatter.name ?? "");
    if (!name) {
      findings.push(lintFinding("Y2", "critical", "syntax", "`name` field is missing"));
    } else if (!KEBAB.test(name)) {
      findings.push(
        lintFinding(
          "Y3",
          "critical",
          "syntax",
          `\`name\` "${name}" is not kebab-case`,
        ),
      );
    }

    if (name && name !== folderName) {
      findings.push(
        lintFinding(
          "Y4",
          "error",
          "syntax",
          `\`name\` "${name}" does not match folder "${folderName}"`,
        ),
      );
    }

    const description = String(frontmatter.description ?? "");
    if (!description) {
      findings.push(
        lintFinding("Y5", "critical", "syntax", "`description` field is missing"),
      );
    } else {
      if (!/use when/i.test(description)) {
        findings.push(
          lintFinding(
            "Y6",
            "warning",
            "syntax",
            "Description lacks USE WHEN / trigger phrasing",
          ),
        );
      }
      if (description.length > 1024) {
        findings.push(
          lintFinding(
            "Y7",
            "error",
            "syntax",
            `Description is ${description.length} characters (max 1024)`,
          ),
        );
      }
    }

    const fmJson = JSON.stringify(frontmatter);
    if (/[<>]/.test(fmJson)) {
      findings.push(
        lintFinding("Y8", "critical", "syntax", "XML-like tags in frontmatter values"),
      );
    }

    if (/^claude|^anthropic/i.test(name)) {
      findings.push(
        lintFinding(
          "Y10",
          "critical",
          "syntax",
          "`name` must not start with claude or anthropic",
        ),
      );
    }

    if (!/^#\s/m.test(body)) {
      findings.push(
        lintFinding("M1", "warning", "syntax", "No markdown heading in SKILL.md body"),
      );
    }

    if (parsed.workflows.length && !/##\s+Workflow/i.test(body)) {
      findings.push(
        lintFinding(
          "M2",
          "warning",
          "syntax",
          "Workflow references exist but ## Workflow Routing section is missing",
        ),
      );
    }

    if (!/##\s+Examples/i.test(body)) {
      findings.push(
        lintFinding("M3", "warning", "syntax", "## Examples section is missing"),
      );
    }

    const wordCount = body.split(/\s+/).filter(Boolean).length;
    if (wordCount > 5000) {
      findings.push(
        lintFinding(
          "M4",
          "warning",
          "syntax",
          `SKILL.md body is ~${wordCount} words; consider moving detail to references/`,
        ),
      );
    }

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(body)) {
        findings.push(
          lintFinding(
            "X1",
            "critical",
            "security",
            "Possible prompt-injection pattern in SKILL.md",
          ),
        );
        break;
      }
    }

    for (const pattern of CREDENTIAL_PATTERNS) {
      if (pattern.test(body)) {
        findings.push(
          lintFinding(
            "X2",
            "critical",
            "security",
            "Possible credential literal in SKILL.md",
          ),
        );
        break;
      }
    }

    if (/[A-Za-z]:\\|\/Users\/|\/home\//.test(body)) {
      findings.push(
        lintFinding(
          "P1",
          "warning",
          "portability",
          "Hardcoded absolute path detected in SKILL.md",
        ),
      );
    }

    if (/##\s+MCP\s+Dependencies/i.test(body)) {
      if (!/##\s+Tool\s+Safety\s+Policy/i.test(body)) {
        findings.push(
          lintFinding(
            "I4",
            "warning",
            "mcp-integration",
            "MCP Dependencies present but Tool Safety Policy section is missing",
          ),
        );
      }
    }

    return findings;
  }

  private runValidateChecks(detail: SkillDetail): ValidationFinding[] {
    const findings: ValidationFinding[] = [];
    const { body, parsed } = this.readSkillFiles(detail);

    if (!parsed.description) {
      findings.push(
        validateFinding(
          "IQ2",
          "error",
          "instruction-quality",
          "Description is empty — agent cannot route to this skill",
        ),
      );
    }

    if (parsed.triggers.length === 0) {
      findings.push(
        validateFinding(
          "IQ3",
          "warning",
          "instruction-quality",
          "No trigger phrases extracted from description",
        ),
      );
    }

    const wordCount = body.split(/\s+/).filter(Boolean).length;
    if (wordCount > 5000) {
      findings.push(
        validateFinding(
          "TE4",
          "warning",
          "token-economics",
          `SKILL.md body is ~${wordCount} words; push detail to references/`,
        ),
      );
    }

    if (detail.missingReferences.length) {
      for (const missing of detail.missingReferences) {
        findings.push(
          validateFinding(
            "CS2",
            "error",
            "tool-context",
            `Unreachable reference: ${missing}`,
            `Create ${missing} or fix the link in SKILL.md`,
          ),
        );
      }
    }

    if (!detail.hasSkillEscalation) {
      findings.push(
        validateFinding(
          "SA6",
          "error",
          "escalation",
          "Missing references/skill-escalation.md",
          "Create references/skill-escalation.md with owns / does-not-own / escalation map",
        ),
      );
    }

    const desc = parsed.description;
    if (/\byou\b/i.test(desc) || /\bI\b/.test(desc)) {
      findings.push(
        validateFinding(
          "PE6",
          "warning",
          "prompt-engineering",
          "Description should use third person (avoid I/You)",
        ),
      );
    }

    if (/<[a-zA-Z][^>]*>/.test(body)) {
      findings.push(
        validateFinding(
          "PE1",
          "critical",
          "prompt-engineering",
          "XML-style tags used for structure; prefer markdown headings",
        ),
      );
    }

    if (!/##\s+Examples/i.test(body)) {
      findings.push(
        validateFinding(
          "PE2",
          "warning",
          "prompt-engineering",
          "No ## Examples section with concrete usage patterns",
        ),
      );
    }

    const otherSkills = this.catalog
      .listSkills({ environmentId: detail.environmentId })
      .filter((s) => s.name !== detail.name);
    const overlap = otherSkills.filter((s) => {
      const shared = s.triggers.filter((t) =>
        parsed.triggers.some(
          (pt) =>
            pt.toLowerCase().includes(t.toLowerCase()) ||
            t.toLowerCase().includes(pt.toLowerCase()),
        ),
      );
      return shared.length > 0;
    });
    if (overlap.length) {
      findings.push(
        validateFinding(
          "EF-overlap",
          "warning",
          "ecosystem-fitness",
          `Trigger overlap with: ${overlap.map((s) => s.name).join(", ")}`,
        ),
      );
    }

    return findings;
  }

  private persistReport(
    environmentId: string,
    skillName: string,
    envelope: { kind: "lint"; report: LintReport } | { kind: "validation"; report: ValidationReport },
  ): boolean {
    if (!this.config.writesEnabled) return false;
    const dir = validationReportDir(
      this.config.skillsRoot,
      environmentId,
      skillName,
    );
    assertPathUnderRoots(dir, this.config.allowedRoots);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${envelope.report.reportId}.json`);
    assertPathUnderRoots(filePath, this.config.allowedRoots);
    fs.writeFileSync(filePath, JSON.stringify(envelope, null, 2), "utf8");
    const pointerName =
      envelope.kind === "lint" ? LATEST_LINT_POINTER : LATEST_VALIDATION_POINTER;
    const latestPath = path.join(dir, pointerName);
    fs.writeFileSync(latestPath, JSON.stringify(envelope, null, 2), "utf8");
    return true;
  }

  private loadReport(
    environmentId: string,
    skillName: string,
    reportId: string,
  ) {
    assertValidReportId(reportId);
    const dir = validationReportDir(
      this.config.skillsRoot,
      environmentId,
      skillName,
    );
    assertPathUnderRoots(dir, this.config.allowedRoots);
    const filePath = assertPathUnderRoots(
      path.join(dir, `${reportId}.json`),
      this.config.allowedRoots,
    );
    if (!fs.existsSync(filePath)) {
      throw new Error(`Validation report not found: ${reportId}`);
    }
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
    return PersistedValidationEnvelopeSchema.parse(raw);
  }
}

function readLatestEnvelope(
  dir: string,
  pointerFile: string,
  allowedRoots: string[],
  expectedKind?: "lint" | "validation",
):
  | { kind: "lint"; report: LintReport }
  | { kind: "validation"; report: ValidationReport }
  | undefined {
  const pointerPath = assertPathUnderRoots(
    path.join(dir, pointerFile),
    allowedRoots,
  );
  if (!fs.existsSync(pointerPath)) return undefined;
  const envelope = PersistedValidationEnvelopeSchema.parse(
    JSON.parse(fs.readFileSync(pointerPath, "utf8")) as unknown,
  );
  if (expectedKind && envelope.kind !== expectedKind) return undefined;
  return envelope;
}

function lintFinding(
  ruleId: string,
  severity: ValidationFinding["severity"],
  category: string,
  message: string,
  recommendation?: string,
): ValidationFinding {
  return {
    id: `${ruleId}-${category}`,
    ruleId,
    severity,
    category,
    message,
    recommendation,
  };
}

function validateFinding(
  ruleId: string,
  severity: ValidationFinding["severity"],
  category: string,
  message: string,
  recommendation?: string,
): ValidationFinding {
  return lintFinding(ruleId, severity, category, message, recommendation);
}

function scoreFindings(
  findings: ValidationFinding[],
  deductions: Record<ValidationFinding["severity"], number>,
): number {
  let score = 100;
  for (const f of findings) {
    score -= deductions[f.severity];
  }
  return Math.max(0, Math.min(100, score));
}

function summarizeLintCategories(findings: ValidationFinding[]) {
  const byCat = new Map<string, { fail: number; total: number }>();
  const ruleCategories = [
    "structural",
    "syntax",
    "security",
    "portability",
    "mcp-integration",
  ];
  for (const cat of ruleCategories) {
    byCat.set(cat, { fail: 0, total: 0 });
  }
  for (const f of findings) {
    const entry = byCat.get(f.category) ?? { fail: 0, total: 0 };
    entry.fail += 1;
    byCat.set(f.category, entry);
  }
  const checksPerCategory: Record<string, number> = {
    structural: 7,
    syntax: 14,
    security: 2,
    portability: 1,
    "mcp-integration": 1,
  };
  return [...byCat.entries()].map(([category, { fail }]) => {
    const total = checksPerCategory[category] ?? Math.max(fail, 1);
    return {
      category,
      passed: Math.max(0, total - fail),
      total,
    };
  });
}

function lintComplianceLevel(score: number): string {
  if (score >= 90) return "fully-compliant";
  if (score >= 70) return "minor-issues";
  if (score >= 50) return "needs-attention";
  return "significant-issues";
}

function validateEffectivenessLevel(score: number): string {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "needs-work";
  if (score >= 40) return "poor";
  return "redesign";
}

function scoreDimensions(
  findings: ValidationFinding[],
): ValidationDimensionScore[] {
  return DIMENSION_WEIGHTS.map(({ dimension, label, weight, categories }) => {
    const relevant = findings.filter((f) => categories.includes(f.category));
    const score = scoreFindings(relevant, VALIDATE_DEDUCTIONS);
    const top = relevant.find((f) => f.severity === "critical" || f.severity === "error");
    return {
      dimension,
      label,
      score,
      weight,
      summary: top?.message ?? (relevant.length ? `${relevant.length} findings` : "No issues"),
    };
  });
}

function aggregateDimensionScore(dimensions: ValidationDimensionScore[]): number {
  const total = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  return Math.round(Math.max(0, Math.min(100, total)));
}

function buildJobStatement(detail: SkillDetail): string {
  const trigger =
    detail.triggers[0] ?? "the user invokes matching triggers";
  return `This skill enables the agent to perform "${detail.name}" work when ${trigger}, using guidance in SKILL.md and references.`;
}

function assessSkillNecessity(
  detail: SkillDetail,
  findings: ValidationFinding[],
): string {
  const hasOrchestration =
    detail.workflows.length > 0 || detail.references.length > 2;
  const missingEscalation = findings.some((f) => f.ruleId === "SA6");
  if (missingEscalation) return "Questionable — blocking escalation artifact missing";
  if (hasOrchestration) return "Confirmed — multi-step workflows and references present";
  return "Confirmed — indexed skill with procedural references";
}

function buildRecommendedFixes(findings: ValidationFinding[]): string[] {
  return findings
    .filter((f) => f.recommendation)
    .map((f) => f.recommendation!)
    .slice(0, 12);
}

function buildValidateRecommendations(findings: ValidationFinding[]): string[] {
  const order = ["critical", "error", "warning"] as const;
  const out: string[] = [];
  for (const sev of order) {
    for (const f of findings.filter((x) => x.severity === sev)) {
      out.push(f.recommendation ?? f.message);
    }
  }
  return out.slice(0, 15);
}
