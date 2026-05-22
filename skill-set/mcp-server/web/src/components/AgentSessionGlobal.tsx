import { useAgentSession } from "../context/AgentSessionContext";
import { AgentSessionStrip } from "./AgentSessionStrip";
import { ShellIcon } from "./ShellIcon";

export function AgentSessionGlobal() {
  const {
    sessionId,
    stripVisible,
    pollStatus,
    pollError,
    toast,
    clearToast,
    dismissStrip,
  } = useAgentSession();

  return (
    <>
      {toast && (
        <p className="sl-workbench-toast sl-agent-global-toast" role="status">
          {toast}
          <button
            type="button"
            className="sl-toast-dismiss"
            onClick={clearToast}
            aria-label="Dismiss notification"
          >
            <ShellIcon name="close" size={14} />
          </button>
        </p>
      )}
      {sessionId && stripVisible && (
        <AgentSessionStrip
          sessionId={sessionId}
          status={pollStatus}
          error={pollError}
          onDismiss={dismissStrip}
        />
      )}
    </>
  );
}
