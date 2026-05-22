import type { AgentRuntime } from "../api/agent";

const RUNTIME_KEY = "skill-lab:agent-runtime";

export const RUNTIME_OPTIONS: {
  value: AgentRuntime;
  label: string;
}[] = [
  { value: "stub", label: "Stub (fixture)" },
  { value: "claude-headless", label: "Claude headless" },
  { value: "claude-background", label: "Claude background" },
];

export function getPreferredRuntime(): AgentRuntime {
  try {
    const raw = localStorage.getItem(RUNTIME_KEY);
    if (
      raw === "stub" ||
      raw === "claude-headless" ||
      raw === "claude-background"
    ) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return "stub";
}

export function setPreferredRuntime(runtime: AgentRuntime): void {
  localStorage.setItem(RUNTIME_KEY, runtime);
}
