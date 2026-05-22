import fs from "node:fs";
import path from "node:path";
import { catalogHealthLatestPath } from "../ai/generatedPaths.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import { resolvePathInfo, toPosixPath } from "../config/pathModel.js";
import { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";
import { SkillIndexRepository } from "../repositories/SkillIndexRepository.js";
import type { SkillIndexFile } from "../repositories/SkillIndexRepository.js";
import { SkillCatalogService } from "./SkillCatalogService.js";
import type {
  CatalogHealthReport,
  Environment,
  HealthFinding,
  RelationshipMapFile,
  SkillSummary,
} from "./types.js";
import { enrichHealthFindings } from "./healthRemediationPolicy.js";
import { CatalogHealthReportSchema } from "./types.js";

export {
  HEALTH_FINDING_CATEGORIES,
  type HealthFindingCategory,
} from "./healthRemediationPolicy.js";

const STALE_SKEW_MS = 1_000;

const DEFAULT_EXTERNAL_ENDPOINT_PATTERNS = [
  /^[a-z0-9][a-z0-9-]*-mcp(-server)?$/i,
  /^plugin-[a-z0-9][a-z0-9-]*$/i,
  /^user-[a-z0-9][a-z0-9_-]+$/i,
];

function compilePatterns(patterns: string[]): RegExp[] {
  const compiled: RegExp[] = [...DEFAULT_EXTERNAL_ENDPOINT_PATTERNS];
  for (const raw of patterns) {
    try {
      compiled.push(new RegExp(raw));
    } catch {
      // ignore invalid curator patterns
    }
  }
  return compiled;
}

function matchesExternalEndpoint(name: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => re.test(name));
}

function summarize(findings: HealthFinding[]) {
  const summary = { info: 0, warning: 0, error: 0, total: findings.length };
  for (const f of findings) {
    summary[f.severity] += 1;
  }
  return summary;
}

export class SkillHealthService {
  private readonly mapRepo: RelationshipMapRepository;
  private readonly indexRepo: SkillIndexRepository;
  private latest: CatalogHealthReport | null = null;

  constructor(
    private readonly config: SkillLabConfig,
    private readonly catalog: SkillCatalogService,
    mapRepo?: RelationshipMapRepository,
    indexRepo?: SkillIndexRepository,
  ) {
    this.mapRepo = mapRepo ?? new RelationshipMapRepository(config);
    this.indexRepo = indexRepo ?? new SkillIndexRepository(config);
    this.latest = this.loadPersistedLatest();
  }

  /** Last scan result without re-running checks (NFR-002). */
  getLatest(): CatalogHealthReport | null {
    return this.latest;
  }

  scan(): CatalogHealthReport {
    const started = Date.now();
    const findings: HealthFinding[] = [];

    const environments = this.catalog.listEnvironments();
    const skills = this.catalog.listSkills();
    const map = this.mapRepo.read();
    const externalPatterns = compilePatterns(map.external_endpoint_patterns ?? []);
    const knownSkillNames = this.collectKnownSkillNames(map, skills);

    for (const env of environments) {
      findings.push(...this.checkEnvironment(env));
      findings.push(...this.checkSkillIndex(env));
    }

    findings.push(...this.checkRelationshipEndpoints(map, knownSkillNames, externalPatterns));
    findings.push(...this.checkStaleGenerated(this.config.relationshipMapPath, map.updated));

    for (const skill of skills) {
      findings.push(...this.checkSkillArtifacts(skill));
    }

    const report = CatalogHealthReportSchema.parse({
      findings: enrichHealthFindings(findings),
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: summarize(findings),
    });
    this.latest = report;
    this.persistLatest(report);
    return report;
  }

  private loadPersistedLatest(): CatalogHealthReport | null {
    const filePath = catalogHealthLatestPath(this.config.skillsRoot);
    if (!fs.existsSync(filePath)) return null;
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
      const parsed = CatalogHealthReportSchema.parse(raw);
      return {
        ...parsed,
        findings: enrichHealthFindings(parsed.findings),
      };
    } catch {
      return null;
    }
  }

  private persistLatest(report: CatalogHealthReport): void {
    const filePath = catalogHealthLatestPath(this.config.skillsRoot);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), "utf8");
  }

  private collectKnownSkillNames(
    map: RelationshipMapFile,
    skills: SkillSummary[],
  ): Set<string> {
    const names = new Set<string>();
    for (const name of map.skills.user_level) names.add(name);
    for (const name of map.skills.project_level_ai_vault ?? []) names.add(name);
    for (const skill of skills) names.add(skill.name);
    return names;
  }

  private checkEnvironment(env: Environment): HealthFinding[] {
    if (env.pathResolvable) return [];
    return [
      {
        id: `health-env-path-${env.id}`,
        severity: "error",
        category: "environment",
        message: `Environment "${env.id}" has non-resolvable paths for this machine.`,
        sourcePath: env.skillIndexPath,
        recommendation:
          "Fix environment map paths or set environmentOverrides in skill-lab.config.json.",
      },
    ];
  }

  private checkSkillIndex(env: Environment): HealthFinding[] {
    const indexInfo = resolvePathInfo(env.skillIndexPath);
    if (!indexInfo.resolved || !indexInfo.resolvable) return [];

    const index = this.indexRepo.read(indexInfo.resolved);
    const findings: HealthFinding[] = [];
    const sourcePath = toPosixPath(indexInfo.resolved);

    findings.push(
      ...this.checkIndexCounts(env.id, sourcePath, index),
      ...this.checkStaleGenerated(sourcePath, index.generated),
    );
    return findings;
  }

  private checkIndexCounts(
    environmentId: string,
    sourcePath: string,
    index: SkillIndexFile,
  ): HealthFinding[] {
    const entries = Object.values(index.skills);
    const actualTotal = entries.length;
    const actualAlways = entries.filter((e) => e.tier === "always").length;
    const actualDeferred = entries.filter((e) => e.tier === "deferred").length;
    const findings: HealthFinding[] = [];

    const mismatches: string[] = [];
    if (index.totalSkills !== actualTotal) {
      mismatches.push(
        `totalSkills is ${index.totalSkills} but ${actualTotal} skills are indexed`,
      );
    }
    if (index.alwaysLoadedCount !== actualAlways) {
      mismatches.push(
        `alwaysLoadedCount is ${index.alwaysLoadedCount} but ${actualAlways} skills have tier=always`,
      );
    }
    if (index.deferredCount !== actualDeferred) {
      mismatches.push(
        `deferredCount is ${index.deferredCount} but ${actualDeferred} skills have tier=deferred`,
      );
    }

    if (mismatches.length) {
      findings.push({
        id: `health-index-count-mismatch-${environmentId}`,
        severity: "warning",
        category: "index",
        message: mismatches.join("; ") + ".",
        sourcePath,
        environmentId,
        recommendation:
          "Regenerate skill-index.json with skill-set/scripts/update_skill_index.py.",
      });
    }
    return findings;
  }

  private checkStaleGenerated(
    sourcePath: string,
    declaredIso?: string,
  ): HealthFinding[] {
    if (!declaredIso) return [];
    const declaredMs = Date.parse(declaredIso);
    if (Number.isNaN(declaredMs)) return [];

    const pathInfo = resolvePathInfo(sourcePath);
    if (!pathInfo.resolved || !pathInfo.resolvable) return [];

    const mtimeMs = fs.statSync(pathInfo.resolved).mtimeMs;
    if (mtimeMs <= declaredMs + STALE_SKEW_MS) return [];

    return [
      {
        id: `health-stale-generated-${path.basename(sourcePath)}`,
        severity: "warning",
        category: "staleness",
        message: `${toPosixPath(sourcePath)} was modified after embedded timestamp ${declaredIso}.`,
        sourcePath: toPosixPath(sourcePath),
        recommendation:
          "Regenerate the file and update its embedded generated/updated timestamp.",
      },
    ];
  }

  private checkRelationshipEndpoints(
    map: RelationshipMapFile,
    knownSkillNames: Set<string>,
    externalPatterns: RegExp[],
  ): HealthFinding[] {
    const findings: HealthFinding[] = [];
    const unknown = new Set<string>();

    for (const rel of map.relationships) {
      for (const endpoint of [rel.from_skill, rel.to_skill]) {
        if (knownSkillNames.has(endpoint)) continue;
        if (matchesExternalEndpoint(endpoint, externalPatterns)) continue;
        unknown.add(endpoint);
      }
    }

    for (const endpoint of unknown) {
      findings.push({
        id: `health-unknown-endpoint-${endpoint}`,
        severity: "warning",
        category: "relationships",
        message: `Relationship endpoint "${endpoint}" is not in known skill lists and does not match external endpoint patterns.`,
        sourcePath: toPosixPath(this.config.relationshipMapPath),
        recommendation:
          "Add the skill to skill-relationships.json skill lists, fix the endpoint name, or add an external_endpoint_patterns entry.",
      });
    }
    return findings;
  }

  private checkSkillArtifacts(skill: SkillSummary): HealthFinding[] {
    const detail = this.catalog.getSkillDetail(skill.environmentId, skill.name);
    if (!detail) return [];

    const findings: HealthFinding[] = [];
    const sourcePath = detail.sourcePath;

    if (!detail.hasSkillEscalation && !this.isVendorSkillPath(sourcePath)) {
      findings.push({
        id: `health-missing-escalation-${skill.environmentId}-${skill.name}`,
        severity: "warning",
        category: "escalation",
        message: `Skill "${skill.name}" is missing references/skill-escalation.md.`,
        sourcePath,
        environmentId: skill.environmentId,
        skillName: skill.name,
        recommendation:
          "Add references/skill-escalation.md per skill-set boundary standard.",
      });
    }

    for (const missing of detail.missingReferences) {
      findings.push({
        id: `health-missing-ref-${skill.environmentId}-${skill.name}-${missing.replace(/\//g, "-")}`,
        severity: "warning",
        category: "references",
        message: `Skill "${skill.name}" references missing file ${missing}.`,
        sourcePath,
        environmentId: skill.environmentId,
        skillName: skill.name,
        recommendation: `Create ${missing} or remove the reference from SKILL.md.`,
      });
    }

    return findings;
  }

  private isVendorSkillPath(sourcePath: string): boolean {
    return /(?:^|\/)vendor(?:\/|$)/i.test(sourcePath);
  }
}
