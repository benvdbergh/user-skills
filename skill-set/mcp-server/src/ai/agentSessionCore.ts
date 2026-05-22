import { randomUUID } from "node:crypto";
import type { SkillLabConfig } from "../config/loadConfig.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import type { RelationshipSuggestionAdvisor } from "./RelationshipSuggestionAdvisor.js";
import type { ChangeProposalService } from "../domain/ChangeProposalService.js";
import {
  AgentSessionSchema,
  AgentSessionStatusSchema,
  type AgentRuntime,
  type AgentSession,
  type AgentSessionStatus,
  type AgentTaskRequest,
} from "../domain/types.js";
import type { PromptSourceService } from "../prompts/PromptSourceService.js";
import {
  appendSessionLog,
  readSessionLogTail,
  readSessionManifest,
  writeSessionManifest,
  type SessionManifest,
} from "./agentSessionArtifacts.js";
import { buildResumeShellCommand } from "./agentSessionClaude.js";
import { resolvePromptTemplateId } from "./sessionKind.js";

export function resolveRuntime(request: AgentTaskRequest): AgentRuntime {
  return request.runtime ?? "claude-headless";
}

export function manifestToSession(m: SessionManifest): AgentSession {
  return AgentSessionSchema.parse({
    id: m.id,
    status: m.status,
    runtime: m.runtime,
    kind: m.kind,
    environmentId: m.environmentId,
    skillName: m.skillName,
    promptTemplateId: m.promptTemplateId,
    startedAt: m.startedAt,
    completedAt: m.completedAt,
    proposalIds: m.proposalIds,
    error: m.error,
  });
}

export function manifestToStatus(
  config: SkillLabConfig,
  m: SessionManifest,
): AgentSessionStatus {
  return AgentSessionStatusSchema.parse({
    ...manifestToSession(m),
    logTail: readSessionLogTail(config, m.id),
    artifactDir: `.generated/agent-sessions/${m.id}`,
    resumeShellCommand: buildResumeShellCommand(
      config.skillsRoot,
      m.id,
      m.runtime,
    ),
  });
}

export function assertSkillTarget(
  catalog: SkillCatalogService,
  environmentId: string,
  skillName: string,
): void {
  const detail = catalog.getSkillDetail(environmentId, skillName);
  if (!detail) {
    throw new Error(`Skill not found: ${environmentId}/${skillName}`);
  }
}

export function createPendingManifest(
  request: AgentTaskRequest,
  runtime: AgentRuntime,
): SessionManifest {
  const now = new Date().toISOString();
  const promptTemplateId = resolvePromptTemplateId(
    request.kind,
    request.promptTemplateId,
  );
  return {
    id: randomUUID(),
    status: "pending",
    runtime,
    kind: request.kind,
    environmentId: request.environmentId,
    skillName: request.skillName,
    promptTemplateId,
    startedAt: now,
    updatedAt: now,
    proposalIds: [],
  };
}

export function persistManifest(
  config: SkillLabConfig,
  manifest: SessionManifest,
): void {
  manifest.updatedAt = new Date().toISOString();
  writeSessionManifest(config, manifest);
}

export function loadManifestOrThrow(
  config: SkillLabConfig,
  sessionId: string,
): SessionManifest {
  const manifest = readSessionManifest(config, sessionId);
  if (!manifest) {
    throw new Error(`Agent session not found: ${sessionId}`);
  }
  return manifest;
}

export function buildPromptContext(
  catalog: SkillCatalogService,
  request: AgentTaskRequest,
): {
  environmentId: string;
  skillName: string;
  skillMdRelativePath: string;
} {
  const detail = catalog.getSkillDetail(
    request.environmentId,
    request.skillName,
  );
  if (!detail) {
    throw new Error(`Skill not found: ${request.environmentId}/${request.skillName}`);
  }
  return {
    environmentId: request.environmentId,
    skillName: request.skillName,
    skillMdRelativePath: detail.path,
  };
}

export function buildTaskPrompt(
  prompts: PromptSourceService,
  catalog: SkillCatalogService,
  request: AgentTaskRequest,
): string {
  const templateId = resolvePromptTemplateId(
    request.kind,
    request.promptTemplateId,
  );
  const context = buildPromptContext(catalog, request);
  return prompts.buildPromptBundle(templateId, context).assembledPrompt;
}

export function finishWithProposal(
  config: SkillLabConfig,
  proposals: ChangeProposalService,
  manifest: SessionManifest,
  skillSourcePath: string,
): SessionManifest {
  const proposal = proposals.ingestPatch({
    kind: manifest.kind,
    sessionId: manifest.id,
    environmentId: manifest.environmentId,
    skillName: manifest.skillName,
    rationale: `Stub agent session (${manifest.kind}) for ${manifest.skillName}`,
    fileChanges: [
      {
        relativePath: `${manifest.skillName}/SKILL.md`,
        suggestedContent: `# ${manifest.skillName}\n\n<!-- stub proposal for ${manifest.kind} -->\n`,
      },
    ],
    citations: [{ sourcePath: skillSourcePath }],
  });
  manifest.proposalIds = [proposal.patchToken];
  manifest.status = "completed";
  manifest.completedAt = new Date().toISOString();
  persistManifest(config, manifest);
  appendSessionLog(
    config,
    manifest.id,
    `Session completed; proposal ${proposal.patchToken}`,
  );
  return manifest;
}

export function finishWithRelationship(
  config: SkillLabConfig,
  proposals: ChangeProposalService,
  manifest: SessionManifest,
  relationshipAdvisor: RelationshipSuggestionAdvisor,
): SessionManifest {
  const edgeInputs = relationshipAdvisor.draftEdgesForSkill(manifest.skillName);
  const { accepted } = relationshipAdvisor.validateEdges(edgeInputs);
  if (accepted.length === 0) {
    throw new Error(
      `No relationship edges with evidence for skill "${manifest.skillName}"`,
    );
  }
  const proposal = proposals.ingestRelationship({
    sessionId: manifest.id,
    environmentId: manifest.environmentId,
    skillName: manifest.skillName,
    edges: accepted,
  });
  manifest.proposalIds = [proposal.patchToken];
  manifest.status = "completed";
  manifest.completedAt = new Date().toISOString();
  persistManifest(config, manifest);
  appendSessionLog(
    config,
    manifest.id,
    `Session completed; relationship proposal ${proposal.patchToken}`,
  );
  return manifest;
}

export function finishWithTriggerConflicts(
  config: SkillLabConfig,
  proposals: ChangeProposalService,
  manifest: SessionManifest,
  relationshipAdvisor: RelationshipSuggestionAdvisor,
  catalog: SkillCatalogService,
): SessionManifest {
  const skills = catalog.listSkills({ environmentId: manifest.environmentId });
  const conflicts = relationshipAdvisor.detectTriggerConflicts({
    environmentId: manifest.environmentId,
  });
  const report = proposals.ingestTriggerConflicts({
    sessionId: manifest.id,
    environmentId: manifest.environmentId,
    conflicts,
    scannedSkillCount: skills.length,
  });
  manifest.proposalIds = [report.patchToken];
  manifest.status = "completed";
  manifest.completedAt = new Date().toISOString();
  persistManifest(config, manifest);
  appendSessionLog(
    config,
    manifest.id,
    `Session completed; conflict report ${report.patchToken}`,
  );
  return manifest;
}
