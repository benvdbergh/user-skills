import fs from "node:fs";
import path from "node:path";
import type { SkillLabConfig } from "../config/loadConfig.js";
import { SKILL_DETAIL_ADVISOR_AGENT_KINDS } from "./healthRemediationPolicy.js";
import type { Environment, SkillDetail, SkillSummary } from "./types.js";
import { FileSystemSkillRepository } from "../repositories/FileSystemSkillRepository.js";
import { SkillIndexRepository } from "../repositories/SkillIndexRepository.js";
import { EnvironmentMapRepository } from "../repositories/EnvironmentMapRepository.js";
import { resolvePathInfo } from "../config/pathModel.js";

export interface ListSkillsOptions {
  environmentId?: string;
}

export interface SearchSkillsOptions extends ListSkillsOptions {
  query: string;
}

function healthFromMissing(missingCount: number): SkillSummary["health"] {
  if (missingCount === 0) return { status: "ok", findings: 0 };
  return { status: "warning", findings: missingCount };
}

export class SkillCatalogService {
  private readonly indexRepo: SkillIndexRepository;
  private readonly envRepo: EnvironmentMapRepository;
  private readonly fsRepo: FileSystemSkillRepository;

  constructor(private readonly config: SkillLabConfig) {
    this.indexRepo = new SkillIndexRepository(config);
    this.envRepo = new EnvironmentMapRepository(config);
    this.fsRepo = new FileSystemSkillRepository(config);
  }

  listEnvironments(): Environment[] {
    return this.envRepo.listEnvironments();
  }

  private skillsRootForEnvironment(env: Environment): string {
    const indexInfo = resolvePathInfo(env.skillIndexPath);
    if (indexInfo.resolved && indexInfo.resolvable) {
      return path.dirname(indexInfo.resolved);
    }
    const envInfo = resolvePathInfo(env.path);
    if (envInfo.resolved && envInfo.resolvable) {
      const skillsDir = path.join(envInfo.resolved, "skills");
      if (fs.existsSync(skillsDir)) return skillsDir;
      return envInfo.resolved;
    }
    return this.config.skillsRoot;
  }

  listSkills(options: ListSkillsOptions = {}): SkillSummary[] {
    const envs = this.envRepo.listEnvironments();
    const selected = options.environmentId
      ? envs.filter((e) => e.id === options.environmentId)
      : envs;

    const summaries: SkillSummary[] = [];
    for (const env of selected) {
      summaries.push(...this.summariesForEnvironment(env));
    }
    return summaries.sort((a, b) => a.name.localeCompare(b.name));
  }

  searchSkills(options: SearchSkillsOptions): SkillSummary[] {
    const q = options.query.trim().toLowerCase();
    if (!q) return this.listSkills(options);
    return this.listSkills(options).filter((s) => {
      const hay = [
        s.name,
        s.description,
        ...s.triggers,
        ...s.workflows,
        s.path,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  getSkillDetail(environmentId: string, skillName: string): SkillDetail | null {
    const env = this.envRepo
      .listEnvironments()
      .find((e) => e.id === environmentId);
    if (!env) return null;

    const indexInfo = resolvePathInfo(env.skillIndexPath);
    if (!indexInfo.resolved || !indexInfo.resolvable) return null;

    const index = this.indexRepo.read(indexInfo.resolved);
    const entry =
      index.skills[skillName] ??
      Object.values(index.skills).find((s) => s.name === skillName);
    if (!entry) return null;

    const skillsRoot = this.skillsRootForEnvironment(env);
    const parsed = this.fsRepo.readParsed(skillsRoot, entry.path, entry.tier);
    const posixPath = this.fsRepo.posixPathFromRoot(
      skillsRoot,
      this.fsRepo.resolveSkillMdPath(skillsRoot, entry.path),
    );

    const missingCount = parsed.missingReferences.length;
    return {
      environmentId: env.id,
      scope: env.scope,
      name: parsed.name,
      path: posixPath,
      description: parsed.description,
      triggers: parsed.triggers.length ? parsed.triggers : entry.triggers,
      workflows: parsed.workflows.length ? parsed.workflows : entry.workflows,
      tier: parsed.tier,
      health: healthFromMissing(missingCount),
      license: parsed.license,
      compatibility: parsed.compatibility,
      allowedTools: parsed.allowedTools,
      metadata: parsed.metadata,
      descriptionLength: parsed.description.length,
      references: parsed.references,
      scripts: parsed.scripts,
      assets: parsed.assets,
      hasSkillEscalation: parsed.hasSkillEscalation,
      missingReferences: parsed.missingReferences,
      sourcePath: posixPath,
      advisorAgentKinds: [...SKILL_DETAIL_ADVISOR_AGENT_KINDS],
    };
  }

  private summariesForEnvironment(env: Environment): SkillSummary[] {
    const indexInfo = resolvePathInfo(env.skillIndexPath);
    if (!indexInfo.resolved || !indexInfo.resolvable) {
      // FR-004: skip unreachable environment; warnings surfaced via listEnvironments()
      return [];
    }

    const index = this.indexRepo.read(indexInfo.resolved);
    const skillsRoot = this.skillsRootForEnvironment(env);
    const out: SkillSummary[] = [];

    for (const [key, entry] of Object.entries(index.skills)) {
      let missingCount = 0;
      try {
        const parsed = this.fsRepo.readParsed(
          skillsRoot,
          entry.path,
          entry.tier,
        );
        missingCount = parsed.missingReferences.length;
      } catch {
        missingCount = 1;
      }

      out.push({
        environmentId: env.id,
        scope: env.scope,
        name: entry.name || key,
        path: entry.path,
        description: entry.fullDescription,
        triggers: entry.triggers,
        workflows: entry.workflows,
        tier: entry.tier,
        health: healthFromMissing(missingCount),
      });
    }

    return out;
  }
}
