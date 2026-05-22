import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import type { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";
import {
  SuggestedEdgeSchema,
  type RelationshipMapEntry,
  type SuggestedEdge,
  type SuggestedEdgeInput,
  type TriggerConflict,
} from "../domain/types.js";

export interface EdgeValidationResult {
  accepted: SuggestedEdge[];
  rejected: { edge: SuggestedEdgeInput; reason: string }[];
}

function mapEntryToSuggestedEdge(entry: RelationshipMapEntry): SuggestedEdge {
  const sourceFile = entry.evidence?.source_file?.trim();
  const quote = entry.evidence?.quote?.trim();
  if (!sourceFile || !quote) {
    throw new Error(`Map entry ${entry.id} lacks evidence for proposal draft`);
  }
  return SuggestedEdgeSchema.parse({
    fromSkill: entry.from_skill,
    toSkill: entry.to_skill,
    relationshipType: entry.relationship_type,
    candidateAgentGraphEdgeType: entry.candidate_agent_graph_edge_type,
    confidence: entry.confidence_score,
    mappingIsApproximate: entry.mapping_is_approximate,
    rationale: entry.notes,
    evidence: { sourceFile, quote },
  });
}

export function validateSuggestedEdges(
  edges: SuggestedEdgeInput[],
): EdgeValidationResult {
  const accepted: SuggestedEdge[] = [];
  const rejected: EdgeValidationResult["rejected"] = [];

  for (const edge of edges) {
    const sourceFile = edge.evidence?.sourceFile?.trim();
    const quote = edge.evidence?.quote?.trim();
    if (!sourceFile || !quote) {
      rejected.push({
        edge,
        reason: "evidence.quote and evidence.sourceFile are required",
      });
      continue;
    }
    const parsed = SuggestedEdgeSchema.safeParse({
      ...edge,
      evidence: { sourceFile, quote },
    });
    if (!parsed.success) {
      rejected.push({
        edge,
        reason: parsed.error.issues.map((i) => i.message).join("; "),
      });
      continue;
    }
    accepted.push(parsed.data);
  }

  return { accepted, rejected };
}

function normalizeTrigger(phrase: string): string {
  return phrase.trim().toLowerCase();
}

export class RelationshipSuggestionAdvisor {
  constructor(
    private readonly catalog: SkillCatalogService,
    private readonly relationshipMap: RelationshipMapRepository,
  ) {}

  /** Draft edges from the relationship map for an anchor skill (read-only map). */
  draftEdgesForSkill(skillName: string): SuggestedEdge[] {
    const map = this.relationshipMap.read();
    return map.relationships
      .filter((r) => r.from_skill === skillName)
      .map((r) => mapEntryToSuggestedEdge(r));
  }

  validateEdges(edges: SuggestedEdgeInput[]): EdgeValidationResult {
    return validateSuggestedEdges(edges);
  }

  detectTriggerConflicts(options?: {
    environmentId?: string;
  }): TriggerConflict[] {
    const skills = this.catalog.listSkills({
      environmentId: options?.environmentId,
    });
    const byTrigger = new Map<string, Set<string>>();

    for (const skill of skills) {
      for (const trigger of skill.triggers) {
        const key = normalizeTrigger(trigger);
        if (!key) continue;
        const names = byTrigger.get(key) ?? new Set<string>();
        names.add(skill.name);
        byTrigger.set(key, names);
      }
    }

    const conflicts: TriggerConflict[] = [];
    for (const [triggerPhrase, skillNames] of byTrigger) {
      if (skillNames.size < 2) continue;
      conflicts.push({
        triggerPhrase,
        skillNames: [...skillNames].sort(),
        rationale: `Trigger phrase is shared by ${skillNames.size} skills.`,
        severity: "warning",
      });
    }

    return conflicts.sort((a, b) =>
      a.triggerPhrase.localeCompare(b.triggerPhrase),
    );
  }
}
