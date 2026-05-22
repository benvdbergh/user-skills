import { useAgentSession } from "../context/AgentSessionContext";
import type { AgentSessionKind } from "../api/agent";
import { agentSessionKindLabel } from "../lib/agentSessionLabels";
import { ShellIcon } from "./ShellIcon";

export function AgentSkillActions({
  environmentId,
  skillName,
  agentKinds,
}: {
  environmentId: string;
  skillName: string;
  /** Server-owned advisor kinds from skill detail (FR-040). */
  agentKinds: readonly AgentSessionKind[];
}) {
  const { busy, sessionInProgress, start } = useAgentSession();

  const handleStart = (kind: AgentSessionKind) => {
    void start({
      kind,
      environmentId,
      skillName,
      navigateOnComplete: true,
    });
  };

  return (
    <section className="sl-detail-section sl-agent-actions">
      <h3>
        <span>Advisor</span>
      </h3>
      <p className="sl-muted">
        Start an agent session; proposals appear in the workbench when complete.
      </p>
      <div className="sl-prompt-action-grid">
        {agentKinds.map((kind) => (
          <button
            key={kind}
            type="button"
            className="sl-btn sl-btn-ghost sl-prompt-action-btn"
            disabled={busy || sessionInProgress}
            aria-busy={busy}
            aria-disabled={busy || sessionInProgress}
            onClick={() => handleStart(kind)}
          >
            <ShellIcon name="sparkle" size={14} />
            {busy ? "Starting…" : agentSessionKindLabel(kind)}
          </button>
        ))}
      </div>
    </section>
  );
}
