import { apiFetch } from "./client";

export interface SourceCitation {
  sourcePath: string;
  heading?: string;
  quote?: string;
}

export interface ProposedFileChange {
  relativePath: string;
  unifiedDiff?: string;
  suggestedContent?: string;
}

export interface PatchProposal {
  patchToken: string;
  kind: string;
  sessionId?: string;
  environmentId: string;
  skillName: string;
  rationale: string;
  fileChanges: ProposedFileChange[];
  citations: SourceCitation[];
  createdAt: string;
}

export interface SuggestedEdge {
  fromSkill: string;
  toSkill: string;
  relationshipType: string;
  candidateAgentGraphEdgeType?: string;
  confidence: number;
  mappingIsApproximate?: boolean;
  rationale?: string;
  evidence: { sourceFile: string; quote: string };
}

export interface RelationshipProposal {
  patchToken: string;
  kind: "relationship-suggestion";
  sessionId?: string;
  environmentId: string;
  skillName?: string;
  edges: SuggestedEdge[];
  rejectedEdges?: { edge: unknown; reason: string }[];
  createdAt: string;
}

export interface TriggerConflict {
  triggerPhrase: string;
  skillNames: string[];
  rationale: string;
  severity: "warning" | "error";
}

export interface TriggerConflictReport {
  patchToken: string;
  kind: "trigger-conflict-report";
  sessionId?: string;
  environmentId?: string;
  conflicts: TriggerConflict[];
  scannedSkillCount: number;
  createdAt: string;
}

export type StoredProposal =
  | { proposalKind: "patch"; proposal: PatchProposal }
  | { proposalKind: "relationship"; proposal: RelationshipProposal }
  | { proposalKind: "trigger-conflicts"; proposal: TriggerConflictReport };

export async function fetchProposalTokens(): Promise<string[]> {
  const body = await apiFetch<{ tokens: string[] }>("/api/proposals");
  return body.tokens;
}

export async function fetchStoredProposal(
  patchToken: string,
): Promise<StoredProposal> {
  return apiFetch<StoredProposal>(
    `/api/proposals/${encodeURIComponent(patchToken)}`,
  );
}

export function proposalTabKind(
  stored: StoredProposal,
): "patches" | "relationships" {
  return stored.proposalKind === "relationship" ? "relationships" : "patches";
}

export function proposalListLabel(stored: StoredProposal): string {
  if (stored.proposalKind === "patch") {
    return `${stored.proposal.skillName} · ${stored.proposal.kind}`;
  }
  if (stored.proposalKind === "relationship") {
    return `${stored.proposal.skillName ?? "graph"} · ${stored.proposal.edges.length} edges`;
  }
  return `Conflicts · ${stored.proposal.conflicts.length}`;
}
