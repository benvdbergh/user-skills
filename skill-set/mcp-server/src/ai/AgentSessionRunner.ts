import type {
  AgentAuthStatus,
  AgentSession,
  AgentSessionStatus,
  AgentTaskRequest,
} from "../domain/types.js";

/** Port for Claude Code agent sessions (BEN-36). */
export interface AgentSessionRunner {
  checkAuth(): Promise<AgentAuthStatus>;
  start(request: AgentTaskRequest): Promise<AgentSession>;
  getStatus(sessionId: string): Promise<AgentSessionStatus>;
  cancel(sessionId: string): Promise<void>;
}
