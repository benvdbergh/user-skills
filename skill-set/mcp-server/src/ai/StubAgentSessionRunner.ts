import type { SkillLabConfig } from "../config/loadConfig.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import type { ChangeProposalService } from "../domain/ChangeProposalService.js";
import type {
  AgentAuthStatus,
  AgentSession,
  AgentSessionStatus,
  AgentTaskRequest,
} from "../domain/types.js";
import type { RelationshipSuggestionAdvisor } from "./RelationshipSuggestionAdvisor.js";
import type { PromptSourceService } from "../prompts/PromptSourceService.js";
import type { AgentSessionRunner } from "./AgentSessionRunner.js";
import {
  appendSessionLog,
  ensureAgentSessionDir,
} from "./agentSessionArtifacts.js";
import {
  assertSkillTarget,
  buildTaskPrompt,
  createPendingManifest,
  finishWithProposal,
  finishWithRelationship,
  finishWithTriggerConflicts,
  loadManifestOrThrow,
  manifestToSession,
  manifestToStatus,
  persistManifest,
} from "./agentSessionCore.js";

/** Test/CI runner — no `claude` CLI; emits fixture patch proposals. */
export class StubAgentSessionRunner implements AgentSessionRunner {
  constructor(
    private readonly config: SkillLabConfig,
    private readonly catalog: SkillCatalogService,
    private readonly prompts: PromptSourceService,
    private readonly proposals: ChangeProposalService,
    private readonly relationshipAdvisor: RelationshipSuggestionAdvisor,
  ) {}

  async checkAuth(): Promise<AgentAuthStatus> {
    return {
      authenticated: true,
      provider: "none",
      message: "Stub agent runtime (no Claude CLI)",
    };
  }

  async start(request: AgentTaskRequest): Promise<AgentSession> {
    assertSkillTarget(
      this.catalog,
      request.environmentId,
      request.skillName,
    );
    const runtime = "stub";
    let manifest = createPendingManifest(
      { ...request, runtime },
      runtime,
    );
    ensureAgentSessionDir(this.config, manifest.id);
    persistManifest(this.config, manifest);
    appendSessionLog(this.config, manifest.id, "Stub session started");

    manifest.status = "running";
    persistManifest(this.config, manifest);

    try {
      const prompt = buildTaskPrompt(this.prompts, this.catalog, request);
      appendSessionLog(
        this.config,
        manifest.id,
        `Task prompt length: ${prompt.length} chars`,
      );
      const detail = this.catalog.getSkillDetail(
        request.environmentId,
        request.skillName,
      )!;
      if (request.kind === "suggest-relationships") {
        manifest = finishWithRelationship(
          this.config,
          this.proposals,
          manifest,
          this.relationshipAdvisor,
        );
      } else if (request.kind === "analyze-trigger-conflicts") {
        manifest = finishWithTriggerConflicts(
          this.config,
          this.proposals,
          manifest,
          this.relationshipAdvisor,
          this.catalog,
        );
      } else {
        manifest = finishWithProposal(
          this.config,
          this.proposals,
          manifest,
          detail.sourcePath,
        );
      }
    } catch (err) {
      manifest.status = "failed";
      manifest.error =
        err instanceof Error ? err.message : "Stub session failed";
      manifest.completedAt = new Date().toISOString();
      persistManifest(this.config, manifest);
      appendSessionLog(this.config, manifest.id, manifest.error);
    }

    return manifestToSession(manifest);
  }

  async getStatus(sessionId: string): Promise<AgentSessionStatus> {
    const manifest = loadManifestOrThrow(this.config, sessionId);
    const tokens = this.proposals.listTokensForSession(sessionId);
    if (tokens.length) manifest.proposalIds = tokens;
    return manifestToStatus(this.config, manifest);
  }

  async cancel(sessionId: string): Promise<void> {
    const manifest = loadManifestOrThrow(this.config, sessionId);
    if (manifest.status === "completed" || manifest.status === "cancelled") {
      return;
    }
    manifest.status = "cancelled";
    manifest.completedAt = new Date().toISOString();
    persistManifest(this.config, manifest);
    appendSessionLog(this.config, sessionId, "Session cancelled (stub)");
  }
}
