import type { SkillLabConfig } from "../config/loadConfig.js";
import { RelationshipSuggestionAdvisor } from "../ai/RelationshipSuggestionAdvisor.js";
import { SkillImprovementAdvisor } from "../ai/SkillImprovementAdvisor.js";
import type { ChangeProposalService } from "../domain/ChangeProposalService.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import { GitDiffService } from "../git/GitDiffService.js";
import { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";
import type { ProposalRouteDeps } from "./routes/proposals.js";

export function createProposalServices(
  config: SkillLabConfig,
  catalog: SkillCatalogService,
  proposals: ChangeProposalService,
): ProposalRouteDeps {
  const relationshipMap = new RelationshipMapRepository(config);
  const relationshipAdvisor = new RelationshipSuggestionAdvisor(
    catalog,
    relationshipMap,
  );
  const skillAdvisor = new SkillImprovementAdvisor(config, catalog, proposals);
  const gitDiff = new GitDiffService(proposals, skillAdvisor);
  return {
    catalog,
    proposals,
    relationshipAdvisor,
    skillAdvisor,
    gitDiff,
  };
}
