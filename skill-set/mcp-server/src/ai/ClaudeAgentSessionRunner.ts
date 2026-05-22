import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { SkillLabConfig } from "../config/loadConfig.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import type { ChangeProposalService } from "../domain/ChangeProposalService.js";
import type {
  AgentAuthStatus,
  AgentRuntime,
  AgentSession,
  AgentSessionStatus,
  AgentTaskRequest,
  SkillDetail,
} from "../domain/types.js";
import type { PromptSourceService } from "../prompts/PromptSourceService.js";
import type { AgentSessionRunner } from "./AgentSessionRunner.js";
import {
  appendSessionLog,
  ensureAgentSessionDir,
  type SessionManifest,
} from "./agentSessionArtifacts.js";
import {
  assertSkillTarget,
  buildTaskPrompt,
  createPendingManifest,
  loadManifestOrThrow,
  manifestToSession,
  manifestToStatus,
  persistManifest,
  resolveRuntime,
} from "./agentSessionCore.js";
import {
  applyProcessExitStatus,
  markSessionCancelled,
} from "./agentSessionLifecycle.js";
import {
  buildClaudeSpawnArgs,
  buildShortClaudePrompt,
  prependAgentTaskHeader,
  writeSessionMcpConfig,
} from "./agentSessionClaude.js";
import { redactSecrets } from "./logRedaction.js";
import {
  claudeAvailable,
  parseClaudeAuthStatus,
  runCommand,
} from "./claudeCli.js";

const activeChildren = new Map<string, ReturnType<typeof spawn>>();

function killProcessByPid(pid: number): void {
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/PID", String(pid), "/F", "/T"], { shell: true });
    } else {
      process.kill(pid, "SIGTERM");
    }
  } catch {
    /* process may already have exited */
  }
}

/** Spawns `claude` when available; does not require ANTHROPIC_API_KEY. */
export class ClaudeAgentSessionRunner implements AgentSessionRunner {
  constructor(
    private readonly config: SkillLabConfig,
    private readonly catalog: SkillCatalogService,
    private readonly prompts: PromptSourceService,
    private readonly _proposals: ChangeProposalService,
  ) {}

  async checkAuth(): Promise<AgentAuthStatus> {
    if (!(await claudeAvailable())) {
      return {
        authenticated: false,
        provider: "claude",
        message: "Claude CLI not found on PATH",
      };
    }
    try {
      const result = await runCommand("claude", ["auth", "status"], {
        timeoutMs: 15_000,
      });
      const combined = redactSecrets(
        `${result.stdout}\n${result.stderr}`.trim(),
      );
      const authenticated = parseClaudeAuthStatus(
        result.stdout,
        result.stderr,
        result.code,
      );
      return {
        authenticated,
        provider: "claude",
        message: combined.slice(0, 500) || undefined,
      };
    } catch (err) {
      return {
        authenticated: false,
        provider: "claude",
        message:
          err instanceof Error ? err.message : "Failed to check Claude auth",
      };
    }
  }

  async start(request: AgentTaskRequest): Promise<AgentSession> {
    assertSkillTarget(
      this.catalog,
      request.environmentId,
      request.skillName,
    );
    const runtime = resolveRuntime(request);
    const manifest = createPendingManifest(request, runtime);
    const dir = ensureAgentSessionDir(this.config, manifest.id);
    persistManifest(this.config, manifest);
    appendSessionLog(this.config, manifest.id, `Session started (${runtime})`);

    if (!(await claudeAvailable())) {
      manifest.status = "failed";
      manifest.error = "Claude CLI not found on PATH";
      manifest.completedAt = new Date().toISOString();
      persistManifest(this.config, manifest);
      appendSessionLog(this.config, manifest.id, manifest.error);
      return manifestToSession(manifest);
    }

    let taskPrompt: string;
    try {
      taskPrompt = buildTaskPrompt(this.prompts, this.catalog, request);
    } catch (err) {
      manifest.status = "failed";
      manifest.error =
        err instanceof Error ? err.message : "Failed to build task prompt";
      manifest.completedAt = new Date().toISOString();
      persistManifest(this.config, manifest);
      appendSessionLog(this.config, manifest.id, manifest.error);
      return manifestToSession(manifest);
    }

    const detail = this.catalog.getSkillDetail(
      manifest.environmentId,
      manifest.skillName,
    );
    if (!detail) {
      manifest.status = "failed";
      manifest.error = `Skill not found: ${manifest.environmentId}/${manifest.skillName}`;
      manifest.completedAt = new Date().toISOString();
      persistManifest(this.config, manifest);
      return manifestToSession(manifest);
    }

    const taskBody = prependAgentTaskHeader(manifest, detail, taskPrompt);
    const taskPath = path.join(dir, "task.md");
    fs.writeFileSync(taskPath, taskBody, "utf8");
    appendSessionLog(
      this.config,
      manifest.id,
      `Wrote task.md (${taskBody.length} chars; target ${manifest.skillName})`,
    );

    manifest.status = "running";
    persistManifest(this.config, manifest);
    void this.spawnClaude(manifest, runtime, dir, detail);
    return manifestToSession(manifest);
  }

  private async spawnClaude(
    manifest: SessionManifest,
    runtime: AgentRuntime,
    dir: string,
    detail: SkillDetail,
  ): Promise<void> {
    const sessionId = manifest.id;
    const mcpConfigPath = writeSessionMcpConfig(this.config, sessionId);
    const shortPrompt = buildShortClaudePrompt(manifest, detail);
    const args = buildClaudeSpawnArgs(runtime, {
      mcpConfigPath,
      skillsRoot: this.config.skillsRoot,
      sessionId,
    });
    appendSessionLog(
      this.config,
      sessionId,
      `Launching claude for ${manifest.environmentId}/${manifest.skillName} (prompt on stdin)`,
    );

    try {
      const child = spawn("claude", args, {
        cwd: dir,
        shell: process.platform === "win32",
        detached: runtime === "claude-background",
        stdio: ["pipe", "pipe", "pipe"],
      });
      if (child.pid) manifest.pid = child.pid;
      persistManifest(this.config, manifest);
      activeChildren.set(sessionId, child);

      if (child.stdin) {
        child.stdin.write(shortPrompt);
        child.stdin.end();
      }

      const onData = (chunk: Buffer) =>
        appendSessionLog(this.config, sessionId, chunk.toString("utf8"));

      child.stdout?.on("data", onData);
      child.stderr?.on("data", onData);

      child.on("close", (code) => {
        activeChildren.delete(sessionId);
        const m = loadManifestOrThrow(this.config, sessionId);
        if (m.status === "cancelled") return;
        m.status = code === 0 ? "completed" : "failed";
        if (code !== 0) m.error = `claude exited with code ${code ?? "unknown"}`;
        m.completedAt = new Date().toISOString();
        persistManifest(this.config, m);
        appendSessionLog(
          this.config,
          sessionId,
          `Process exited (${code ?? "signal"})`,
        );
      });
    } catch (err) {
      manifest.status = "failed";
      manifest.error =
        err instanceof Error ? err.message : "Failed to spawn claude";
      manifest.completedAt = new Date().toISOString();
      persistManifest(this.config, manifest);
      appendSessionLog(this.config, sessionId, manifest.error);
    }
  }

  async getStatus(sessionId: string): Promise<AgentSessionStatus> {
    const manifest = loadManifestOrThrow(this.config, sessionId);
    const tokens = this._proposals.listTokensForSession(sessionId);
    if (tokens.length) manifest.proposalIds = tokens;
    return manifestToStatus(this.config, manifest);
  }

  async cancel(sessionId: string): Promise<void> {
    if (markSessionCancelled(this.config, sessionId) === "already_terminal") {
      return;
    }

    const manifest = loadManifestOrThrow(this.config, sessionId);
    const child = activeChildren.get(sessionId);
    const pid = child?.pid ?? manifest.pid;
    if (child) activeChildren.delete(sessionId);
    if (pid) killProcessByPid(pid);

    appendSessionLog(this.config, sessionId, "Session cancelled");
  }
}
