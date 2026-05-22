import { apiFetch } from "./client";

export type AgentRuntime = "claude-headless" | "claude-background" | "stub";

export type AgentSessionKind =
  | "improve-skill"
  | "create-escalation"
  | "validate-skill"
  | "suggest-relationships"
  | "analyze-trigger-conflicts"
  | "skill-patch";

export type AgentSessionStatusValue =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentAuthStatus {
  authenticated: boolean;
  provider: "claude" | "none";
  message?: string;
}

export interface AgentHealthFindingContext {
  id?: string;
  category: string;
  message: string;
  recommendation?: string;
  sourcePath?: string;
}

export interface AgentTaskRequest {
  runtime?: AgentRuntime;
  kind: AgentSessionKind;
  environmentId: string;
  skillName: string;
  promptTemplateId?: string;
  healthFinding?: AgentHealthFindingContext;
}

export interface AgentSession {
  id: string;
  status: AgentSessionStatusValue;
  runtime: AgentRuntime;
  kind: AgentSessionKind;
  environmentId: string;
  skillName: string;
  promptTemplateId?: string;
  startedAt: string;
  completedAt?: string;
  proposalIds?: string[];
  error?: string;
}

export interface AgentSessionStatus extends AgentSession {
  logTail?: string;
  artifactDir?: string;
  /** Ready-to-paste shell: cd to session dir + `claude --resume <sessionId>` */
  resumeShellCommand?: string;
}

export async function fetchAgentAuth(): Promise<AgentAuthStatus> {
  const body = await apiFetch<{ auth: AgentAuthStatus }>("/api/agent/auth");
  return body.auth;
}

export async function startAgentSession(
  request: AgentTaskRequest,
): Promise<AgentSession> {
  const body = await apiFetch<{ session: AgentSession }>("/api/agent-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return body.session;
}

export async function fetchAgentSessionStatus(
  sessionId: string,
): Promise<AgentSessionStatus> {
  const body = await apiFetch<{ status: AgentSessionStatus }>(
    `/api/agent-sessions/${encodeURIComponent(sessionId)}`,
  );
  return body.status;
}

export async function cancelAgentSession(
  sessionId: string,
): Promise<AgentSessionStatus> {
  const body = await apiFetch<{ status: AgentSessionStatus }>(
    `/api/agent-sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
  );
  return body.status;
}

export function isTerminalSessionStatus(
  status: AgentSessionStatusValue,
): boolean {
  return (
    status === "completed" ||
    status === "failed" ||
    status === "cancelled"
  );
}
