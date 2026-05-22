import type { AgentAuthStatus, AgentRuntime } from "../api/agent";
import { isClaudeRuntime } from "./agentSessionLabels";

/** Recovery-oriented message when Claude runtime is selected but CLI auth is missing (AC-017). */
export function claudeAuthBlockedMessage(auth?: AgentAuthStatus): string {
  const detail = auth?.message?.trim();
  const base =
    "Claude CLI is not signed in. Run `claude auth login` in a terminal, or set Agent → Runtime to Stub (fixture) in the sidebar.";
  return detail ? `${base} (${detail})` : base;
}

export function shouldBlockAdvisorStart(
  runtime: AgentRuntime,
  auth: AgentAuthStatus | null | undefined,
): boolean {
  return isClaudeRuntime(runtime) && !auth?.authenticated;
}
