import type { SkillLabConfig } from "../config/loadConfig.js";
import type {
  AgentAuthStatus,
  AgentSession,
  AgentSessionStatus,
  AgentTaskRequest,
} from "../domain/types.js";
import type { AgentSessionRunner } from "./AgentSessionRunner.js";
import { loadManifestOrThrow, resolveRuntime } from "./agentSessionCore.js";

/** Delegates to stub when `runtime` is `stub`, otherwise Claude CLI. */
export class RoutingAgentSessionRunner implements AgentSessionRunner {
  constructor(
    private readonly config: SkillLabConfig,
    private readonly stub: AgentSessionRunner,
    private readonly claude: AgentSessionRunner,
  ) {}

  private pickRuntime(runtime: AgentTaskRequest["runtime"]): AgentSessionRunner {
    return runtime === "stub" ? this.stub : this.claude;
  }

  private pick(request: AgentTaskRequest): AgentSessionRunner {
    return this.pickRuntime(resolveRuntime(request));
  }

  private pickForSession(sessionId: string): AgentSessionRunner {
    const manifest = loadManifestOrThrow(this.config, sessionId);
    return this.pickRuntime(manifest.runtime);
  }

  checkAuth(): Promise<AgentAuthStatus> {
    return this.claude.checkAuth();
  }

  start(request: AgentTaskRequest): Promise<AgentSession> {
    return this.pick(request).start(request);
  }

  getStatus(sessionId: string): Promise<AgentSessionStatus> {
    return this.pickForSession(sessionId).getStatus(sessionId);
  }

  cancel(sessionId: string): Promise<void> {
    return this.pickForSession(sessionId).cancel(sessionId);
  }
}
