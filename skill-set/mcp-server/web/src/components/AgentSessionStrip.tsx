import { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {

  cancelAgentSession,

  type AgentSessionStatus,

} from "../api/agent";

import { agentSessionKindLabel } from "../lib/agentSessionLabels";

import { ShellIcon, StatusDot } from "./ShellIcon";



function formatSessionStatus(status: AgentSessionStatus["status"] | undefined): string {

  if (!status) return "Loading";

  if (status === "pending") return "Pending";

  if (status === "running") return "Running";

  if (status === "completed") return "Completed";

  if (status === "failed") return "Failed";

  if (status === "cancelled") return "Cancelled";

  return status;

}



export function AgentSessionStrip({

  sessionId,

  status,

  error,

  onDismiss,

}: {

  sessionId: string;

  status: AgentSessionStatus | null;

  error: string | null;

  onDismiss: () => void;

}) {

  const running =

    status?.status === "pending" || status?.status === "running";

  const [copyHint, setCopyHint] = useState<string | null>(null);



  const skillTitle = status?.skillName ?? "Skill";

  const actionLabel = agentSessionKindLabel(status?.kind);

  const stripTitle = `${skillTitle} — ${actionLabel}`;

  const statusLabel = formatSessionStatus(status?.status);

  const proposalToken = status?.proposalIds?.[0];

  const showProposalLink =

    Boolean(proposalToken) &&

    (running || status?.status === "completed");



  const copyResumeCommand = useCallback(async () => {

    const cmd = status?.resumeShellCommand;

    if (!cmd) return;

    try {

      await navigator.clipboard.writeText(cmd);

      setCopyHint("Copied — paste in a terminal");

    } catch {

      setCopyHint("Copy failed");

    }

  }, [status?.resumeShellCommand]);



  useEffect(() => {

    if (!copyHint) return;

    const t = window.setTimeout(() => setCopyHint(null), 2500);

    return () => window.clearTimeout(t);

  }, [copyHint]);



  return (

    <div

      className="sl-agent-strip sl-agent-global-strip"

      role="status"

      aria-live="polite"

      aria-label={`Agent session: ${stripTitle}, ${statusLabel}`}

    >

      <div className="sl-agent-strip-main">

        <StatusDot

          status={

            running

              ? "warning"

              : status?.status === "completed"

                ? "ok"

                : "error"

          }

        />

        <div>

          <strong id={`agent-strip-title-${sessionId}`}>{stripTitle}</strong>

          <p className="sl-muted" aria-labelledby={`agent-strip-title-${sessionId}`}>

            {statusLabel}

            {status?.runtime ? ` · ${status.runtime}` : ""}

          </p>

        </div>

        {running && (

          <span className="sl-spinner" aria-hidden aria-busy="true" />

        )}

      </div>

      {status?.logTail && (

        <pre className="sl-agent-log">{status.logTail.slice(-400)}</pre>

      )}

      {error && <p className="sl-agent-strip-error">{error}</p>}

      <div className="sl-agent-strip-actions">

        {showProposalLink && proposalToken && (

          <Link

            className="sl-btn sl-btn-ghost"

            to={`/proposals?patch=${encodeURIComponent(proposalToken)}`}

          >

            View proposal

          </Link>

        )}

        {running && (

          <button

            type="button"

            className="sl-btn sl-btn-ghost"

            onClick={() => void cancelAgentSession(sessionId)}

            aria-label={`Cancel ${actionLabel} for ${skillTitle}`}

          >

            Cancel

          </button>

        )}

        <button

          type="button"

          className="sl-btn sl-btn-ghost"

          onClick={onDismiss}

          aria-label="Dismiss session strip"

        >

          <ShellIcon name="close" size={14} />

          Dismiss

        </button>

      </div>

      {status?.resumeShellCommand && (

        <div className="sl-agent-strip-footer">

          <button

            type="button"

            className="sl-btn sl-btn-ghost sl-agent-resume-copy"

            onClick={() => void copyResumeCommand()}

            title={`${status.resumeShellCommand ?? ""}\n\nUses this run’s session ID. Older runs may need: cd this folder, then claude -r.`}

            aria-label="Copy attach command for Claude Code terminal"

          >

            <ShellIcon name="copy" size={14} />

            Copy attach command

          </button>

          {copyHint && (

            <span className="sl-agent-copy-hint" role="status">

              {copyHint}

            </span>

          )}

        </div>

      )}

    </div>

  );

}


