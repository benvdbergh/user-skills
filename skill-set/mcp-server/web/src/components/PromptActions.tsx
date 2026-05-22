import { useCallback, useState } from "react";
import {
  fetchPromptBundle,
  SKILL_DETAIL_PROMPTS,
  type LifecyclePromptId,
} from "../api/prompts";
import { ApiError } from "../api/client";
import { ShellIcon } from "./ShellIcon";

export function PromptActions({
  environmentId,
  skillName,
}: {
  environmentId: string;
  skillName: string;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<LifecyclePromptId | null>(null);

  const copyPrompt = useCallback(
    async (templateId: LifecyclePromptId) => {
      setBusyId(templateId);
      setStatus(null);
      try {
        const { prompt } = await fetchPromptBundle(templateId, {
          environmentId,
          skillName,
        });
        await navigator.clipboard.writeText(prompt.assembledPrompt);
        const label =
          SKILL_DETAIL_PROMPTS.find((p) => p.id === templateId)?.label ??
          templateId;
        setStatus(`Copied “${label}” to clipboard`);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? (err.problem.detail ?? err.problem.title)
            : err instanceof Error
              ? err.message
              : "Failed to copy prompt";
        setStatus(message);
      } finally {
        setBusyId(null);
      }
    },
    [environmentId, skillName],
  );

  return (
    <section className="sl-detail-section sl-prompt-actions">
      <h3>
        <span>Lifecycle prompts</span>
        <span className="sl-detail-section-count">
          {SKILL_DETAIL_PROMPTS.length}
        </span>
      </h3>
      <p className="sl-muted">
        Copy assembled prompts sourced from skill-set references (no in-browser
        agent run).
      </p>
      <div className="sl-prompt-action-grid">
        {SKILL_DETAIL_PROMPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="sl-btn sl-btn-ghost sl-prompt-action-btn"
            disabled={busyId !== null}
            onClick={() => void copyPrompt(item.id)}
          >
            <ShellIcon name="copy" size={14} />
            {busyId === item.id ? "Copying…" : item.label}
          </button>
        ))}
      </div>
      {status ? (
        <p
          className={
            status.startsWith("Copied")
              ? "sl-prompt-status sl-prompt-status-ok"
              : "sl-prompt-status sl-prompt-status-error"
          }
          role="status"
        >
          {status}
        </p>
      ) : null}
    </section>
  );
}
