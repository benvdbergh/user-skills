import { Link } from "react-router-dom";
import { parseSkillQuery } from "../lib/skillQuery";
import { ShellIcon } from "./ShellIcon";

export function ProposalWorkbenchBanner({
  skillQuery,
  onDismiss,
}: {
  skillQuery: string | null;
  onDismiss: () => void;
}) {
  const skill = skillQuery ? parseSkillQuery(skillQuery) : null;
  const returnTo = skill
    ? {
        label: `Return to ${skill.skillName}`,
        to: `/skills/${encodeURIComponent(skill.environmentId)}/${encodeURIComponent(skill.skillName)}`,
      }
    : { label: "Return to Health", to: "/health" };

  return (
    <div
      className="sl-workbench-success"
      role="status"
      aria-live="polite"
    >
      <div className="sl-workbench-success-text">
        <strong>Patch ready for review</strong>
        <p className="sl-muted">
          Review the diff below. Apply stays disabled until R1.0 gated writes.
        </p>
      </div>
      <div className="sl-workbench-success-actions">
        <Link to={returnTo.to} className="sl-btn sl-btn-ghost sl-workbench-return">
          {returnTo.label}
        </Link>
        <button
          type="button"
          className="sl-toast-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss success message"
        >
          <ShellIcon name="close" size={14} />
        </button>
      </div>
    </div>
  );
}
