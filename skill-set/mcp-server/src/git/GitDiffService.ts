import type { ChangeProposalService } from "../domain/ChangeProposalService.js";
import type { SkillImprovementAdvisor } from "../ai/SkillImprovementAdvisor.js";

export interface PatchDiffPreview {
  patchToken: string;
  environmentId: string;
  skillName: string;
  unifiedDiff: string;
}

export class GitDiffService {
  constructor(
    private readonly proposals: ChangeProposalService,
    private readonly advisor: SkillImprovementAdvisor,
  ) {}

  previewPatch(patchToken: string): PatchDiffPreview {
    const proposal = this.proposals.get(patchToken);
    if (!proposal) {
      throw new Error(`Patch proposal not found: ${patchToken}`);
    }

    const materialized = this.advisor.materializeFileChanges(
      proposal.environmentId,
      proposal.skillName,
      proposal.fileChanges,
    );

    const unifiedDiff = materialized
      .map((c) => c.unifiedDiff ?? "")
      .filter(Boolean)
      .join("\n");

    return {
      patchToken,
      environmentId: proposal.environmentId,
      skillName: proposal.skillName,
      unifiedDiff,
    };
  }
}
