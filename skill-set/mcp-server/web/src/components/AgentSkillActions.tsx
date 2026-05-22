import { useAgentSession } from "../context/AgentSessionContext";

import { ADVISOR_SKILL_ACTIONS } from "../lib/agentSessionLabels";

import { ShellIcon } from "./ShellIcon";



export function AgentSkillActions({

  environmentId,

  skillName,

}: {

  environmentId: string;

  skillName: string;

}) {

  const { sessionId, busy, start } = useAgentSession();



  const handleStart = (kind: (typeof ADVISOR_SKILL_ACTIONS)[number]["kind"]) => {

    void start({
      kind,
      environmentId,
      skillName,
      navigateOnComplete: true,
      returnOrigin: { kind: "skill", environmentId, skillName },
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

        {ADVISOR_SKILL_ACTIONS.map((action) => (

          <button

            key={action.kind}

            type="button"

            className="sl-btn sl-btn-ghost sl-prompt-action-btn"

            disabled={busy || Boolean(sessionId)}

            aria-busy={busy}

            aria-disabled={busy || Boolean(sessionId)}

            onClick={() => handleStart(action.kind)}

          >

            <ShellIcon name="sparkle" size={14} />

            {busy ? "Starting…" : action.label}

          </button>

        ))}

      </div>

    </section>

  );

}


