import { useCallback, useState } from "react";
import type { AgentRuntime } from "../api/agent";
import { useAgentSession } from "../context/AgentSessionContext";
import {
  getPreferredRuntime,
  RUNTIME_OPTIONS,
  setPreferredRuntime,
} from "../lib/agentSettings";
import { StatusDot } from "./ShellIcon";

export function SettingsAiStrip() {
  const { auth, authLoading, authError, refreshAuth } = useAgentSession();
  const [runtime, setRuntime] = useState<AgentRuntime>(getPreferredRuntime);

  const onRuntimeChange = useCallback(
    (value: AgentRuntime) => {
      setPreferredRuntime(value);
      setRuntime(value);
      refreshAuth();
    },
    [refreshAuth],
  );

  return (
    <div className="sl-ai-strip">
      <div className="sl-ai-strip-row">
        <span className="sl-ai-strip-label">Agent</span>
        {authLoading && !auth ? (
          <span className="sl-muted" aria-busy="true">
            Checking auth…
          </span>
        ) : auth ? (
          <span
            className={`sl-ai-auth ${auth.authenticated ? "is-ok" : "is-warn"}`}
            title={auth.message}
          >
            <StatusDot status={auth.authenticated ? "ok" : "warning"} />
            {auth.provider === "none" ? "stub" : auth.provider}
            {auth.authenticated ? " · ready" : " · check CLI"}
          </span>
        ) : (
          <span className="sl-muted">Unavailable</span>
        )}
      </div>
      <label className="sl-ai-strip-row">
        <span className="sl-ai-strip-label">Runtime</span>
        <select
          className="sl-ai-runtime-select"
          value={runtime}
          onChange={(e) => onRuntimeChange(e.target.value as AgentRuntime)}
          aria-label="Agent runtime preference"
        >
          {RUNTIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      {authError && (
        <p className="sl-ai-strip-error" role="alert">
          {authError}{" "}
          <button
            type="button"
            className="sl-btn sl-btn-ghost sl-btn-sm"
            onClick={refreshAuth}
          >
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
