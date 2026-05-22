import fs from "node:fs";
import path from "node:path";
import type { SkillLabConfig } from "../config/loadConfig.js";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import { toPosixPath } from "../config/pathModel.js";
import type { ChangeProposalService } from "../domain/ChangeProposalService.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import { assertPatchFileChanges } from "../domain/proposalValidation.js";
import {
  PatchProposalSchema,
  ProposeSkillPatchInputSchema,
  type PatchProposal,
  type ProposeSkillPatchInput,
  type ProposedFileChange,
} from "../domain/types.js";
import { buildUnifiedDiff } from "../git/unifiedDiff.js";
import { EnvironmentMapRepository } from "../repositories/EnvironmentMapRepository.js";
import { resolvePathInfo } from "../config/pathModel.js";

const ALLOWED_PREFIXES = ["SKILL.md", "references/", "scripts/"];

export class SkillImprovementAdvisor {
  private readonly envRepo: EnvironmentMapRepository;

  constructor(
    private readonly config: SkillLabConfig,
    private readonly catalog: SkillCatalogService,
    private readonly proposals: ChangeProposalService,
  ) {
    this.envRepo = new EnvironmentMapRepository(config);
  }

  proposePatch(raw: ProposeSkillPatchInput): PatchProposal {
    const input = ProposeSkillPatchInputSchema.parse(raw);
    const detail = this.catalog.getSkillDetail(
      input.environmentId,
      input.skillName,
    );
    if (!detail) {
      throw new Error(
        `Skill not found: ${input.environmentId}/${input.skillName}`,
      );
    }

    const kind = input.kind ?? "improve-skill";
    assertPatchFileChanges(kind, input.fileChanges);

    const fileChanges = input.fileChanges.map((change) =>
      this.enrichFileChange(
        input.environmentId,
        input.skillName,
        change,
      ),
    );

    return PatchProposalSchema.parse(
      this.proposals.ingestPatch({
        kind,
        sessionId: input.sessionId,
        environmentId: input.environmentId,
        skillName: input.skillName,
        fileChanges,
        citations: input.citations,
        rationale: input.rationale,
        patchToken: input.patchToken,
      }),
    );
  }

  materializeFileChanges(
    environmentId: string,
    skillName: string,
    fileChanges: ProposedFileChange[],
  ): ProposedFileChange[] {
    return fileChanges.map((change) =>
      this.enrichFileChange(environmentId, skillName, change),
    );
  }

  private enrichFileChange(
    environmentId: string,
    skillName: string,
    change: ProposedFileChange,
  ): ProposedFileChange {
    const relativePath = this.normalizeRelativePath(skillName, change.relativePath);
    this.assertAllowedSkillPath(relativePath, skillName);

    if (change.unifiedDiff?.trim()) {
      return { ...change, relativePath };
    }

    const current = this.readSkillFile(environmentId, relativePath);
    const suggested = change.suggestedContent ?? current;
    return {
      relativePath,
      suggestedContent: suggested,
      unifiedDiff: buildUnifiedDiff(relativePath, current, suggested),
    };
  }

  private normalizeRelativePath(skillName: string, relativePath: string): string {
    const posix = toPosixPath(relativePath.replace(/^\.\//, ""));
    if (posix.startsWith(`${skillName}/`)) {
      return posix;
    }
    const skillRelative = posix.startsWith("references/")
      || posix === "SKILL.md"
      || posix.startsWith("scripts/")
      ? posix
      : path.posix.join(skillName, posix);
    return skillRelative;
  }

  private assertAllowedSkillPath(relativePath: string, skillName: string): void {
    const suffix = relativePath.startsWith(`${skillName}/`)
      ? relativePath.slice(skillName.length + 1)
      : relativePath;
    const allowed = ALLOWED_PREFIXES.some(
      (p) => suffix === p.replace(/\/$/, "") || suffix.startsWith(p),
    );
    if (!allowed) {
      throw new Error(
        `Patch path not allowed (scope SKILL.md, references/, scripts/): ${relativePath}`,
      );
    }
  }

  private skillsRootForEnvironment(environmentId: string): string {
    const env = this.envRepo
      .listEnvironments()
      .find((e) => e.id === environmentId);
    if (!env) {
      throw new Error(`Environment not found: ${environmentId}`);
    }
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

  private readSkillFile(environmentId: string, relativePath: string): string {
    const skillsRoot = this.skillsRootForEnvironment(environmentId);
    const absolute = path.resolve(skillsRoot, relativePath);
    assertPathUnderRoots(absolute, this.config.allowedRoots);
    if (!fs.existsSync(absolute)) {
      return "";
    }
    return fs.readFileSync(absolute, "utf8");
  }
}
