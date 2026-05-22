import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import {
  PatchProposalSchema,
  RelationshipProposalSchema,
  TriggerConflictReportSchema,
  type PatchProposal,
  type ProposedFileChange,
  type RelationshipProposal,
  type SourceCitation,
  type StoredProposal,
  type TriggerConflictReport,
} from "./types.js";
import { generatedRoot, proposalFilePath } from "../ai/generatedPaths.js";
import { assertPatchFileChanges } from "./proposalValidation.js";

export interface IngestPatchInput {
  kind: string;
  sessionId?: string;
  environmentId: string;
  skillName: string;
  rationale: string;
  fileChanges: ProposedFileChange[];
  citations: SourceCitation[];
  patchToken?: string;
}

export interface IngestRelationshipInput {
  environmentId: string;
  skillName?: string;
  sessionId?: string;
  edges: RelationshipProposal["edges"];
  rejectedEdges?: RelationshipProposal["rejectedEdges"];
  patchToken?: string;
}

export interface IngestTriggerConflictInput {
  environmentId?: string;
  sessionId?: string;
  conflicts: TriggerConflictReport["conflicts"];
  scannedSkillCount: number;
  patchToken?: string;
}

export const DEFAULT_PROPOSAL_LIST_LIMIT = 50;
export const MAX_PROPOSAL_LIST_LIMIT = 200;

export interface ListProposalTokensOptions {
  /** Max tokens returned; omit for no cap (internal session lookups). */
  limit?: number;
  sessionId?: string;
}

export class ChangeProposalService {
  private readonly byToken = new Map<string, StoredProposal>();

  constructor(private readonly config: SkillLabConfig) {}

  ingestPatch(input: IngestPatchInput): PatchProposal {
    assertPatchFileChanges(input.kind, input.fileChanges);
    const proposal = PatchProposalSchema.parse({
      patchToken: input.patchToken ?? randomUUID(),
      kind: input.kind,
      sessionId: input.sessionId,
      environmentId: input.environmentId,
      skillName: input.skillName,
      rationale: input.rationale,
      fileChanges: input.fileChanges,
      citations: input.citations,
      createdAt: new Date().toISOString(),
    });
    this.store({ proposalKind: "patch", proposal });
    return proposal;
  }

  ingestRelationship(input: IngestRelationshipInput): RelationshipProposal {
    if (input.edges.length === 0) {
      throw new Error(
        "Relationship proposals require at least one accepted edge with evidence",
      );
    }
    const proposal = RelationshipProposalSchema.parse({
      patchToken: input.patchToken ?? randomUUID(),
      kind: "relationship-suggestion",
      sessionId: input.sessionId,
      environmentId: input.environmentId,
      skillName: input.skillName,
      edges: input.edges,
      rejectedEdges:
        input.rejectedEdges && input.rejectedEdges.length > 0
          ? input.rejectedEdges
          : undefined,
      createdAt: new Date().toISOString(),
    });
    this.store({ proposalKind: "relationship", proposal });
    return proposal;
  }

  ingestTriggerConflicts(
    input: IngestTriggerConflictInput,
  ): TriggerConflictReport {
    const proposal = TriggerConflictReportSchema.parse({
      patchToken: input.patchToken ?? randomUUID(),
      kind: "trigger-conflict-report",
      sessionId: input.sessionId,
      environmentId: input.environmentId,
      conflicts: input.conflicts,
      scannedSkillCount: input.scannedSkillCount,
      createdAt: new Date().toISOString(),
    });
    this.store({ proposalKind: "trigger-conflicts", proposal });
    return proposal;
  }

  get(patchToken: string): PatchProposal | undefined {
    const stored = this.getStored(patchToken);
    return stored?.proposalKind === "patch" ? stored.proposal : undefined;
  }

  getStored(patchToken: string): StoredProposal | undefined {
    const cached = this.byToken.get(patchToken);
    if (cached) return cached;
    const loaded = this.loadPersisted(patchToken);
    if (loaded) {
      this.byToken.set(patchToken, loaded);
    }
    return loaded;
  }

  private loadPersisted(patchToken: string): StoredProposal | undefined {
    const filePath = proposalFilePath(this.config.skillsRoot, patchToken);
    if (!fs.existsSync(filePath)) {
      return undefined;
    }
    try {
      assertPathUnderRoots(filePath, this.config.allowedRoots);
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
        string,
        unknown
      >;
      if (raw.kind === "relationship-suggestion") {
        return {
          proposalKind: "relationship",
          proposal: RelationshipProposalSchema.parse(raw),
        };
      }
      if (raw.kind === "trigger-conflict-report") {
        return {
          proposalKind: "trigger-conflicts",
          proposal: TriggerConflictReportSchema.parse(raw),
        };
      }
      return {
        proposalKind: "patch",
        proposal: PatchProposalSchema.parse(raw),
      };
    } catch {
      return undefined;
    }
  }

  listTokensForSession(sessionId: string): string[] {
    return this.listProposalTokens({ sessionId });
  }

  /** In-memory tokens plus persisted `.generated/proposals/*.json` (newest first). */
  listProposalTokens(options?: ListProposalTokensOptions): string[] {
    const sessionId = options?.sessionId;
    const limit = options?.limit;

    const entries: { patchToken: string; sortKey: string }[] = [];

    for (const [patchToken, stored] of this.byToken) {
      const proposal = stored.proposal;
      const proposalSessionId =
        "sessionId" in proposal ? proposal.sessionId : undefined;
      if (sessionId && proposalSessionId !== sessionId) continue;
      entries.push({ patchToken, sortKey: proposal.createdAt });
    }

    const dir = path.join(generatedRoot(this.config.skillsRoot), "proposals");
    if (fs.existsSync(dir)) {
      for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith(".json")) continue;
        const patchToken = file.slice(0, -".json".length);
        if (this.byToken.has(patchToken)) continue;

        if (sessionId) {
          const stored = this.loadPersisted(patchToken);
          const proposal = stored?.proposal;
          const proposalSessionId =
            proposal && "sessionId" in proposal
              ? proposal.sessionId
              : undefined;
          if (proposalSessionId !== sessionId) continue;
          entries.push({
            patchToken,
            sortKey: proposal?.createdAt ?? "",
          });
          continue;
        }

        const filePath = path.join(dir, file);
        entries.push({
          patchToken,
          sortKey: fs.statSync(filePath).mtime.toISOString(),
        });
      }
    }

    entries.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
    const ordered = entries.map((e) => e.patchToken);
    if (limit === undefined) return ordered;
    return ordered.slice(0, limit);
  }

  private store(stored: StoredProposal): void {
    this.byToken.set(stored.proposal.patchToken, stored);
    // Review artifacts under .generated/proposals — not gated by writesEnabled (skill apply is).
    this.persist(stored.proposal);
  }

  private persist(proposal: StoredProposal["proposal"]): void {
    const filePath = proposalFilePath(
      this.config.skillsRoot,
      proposal.patchToken,
    );
    const dir = path.dirname(filePath);
    assertPathUnderRoots(dir, this.config.allowedRoots);
    fs.mkdirSync(dir, { recursive: true });
    assertPathUnderRoots(filePath, this.config.allowedRoots);
    fs.writeFileSync(filePath, JSON.stringify(proposal, null, 2), "utf8");
  }
}
