import type { StoredProposal } from "../api/proposals";
import {
  ignoreProposalToken,
  isProposalExported,
  markProposalExported,
} from "../lib/proposalStorage";
import { ShellIcon } from "./ShellIcon";

export function ProposalToolbar({
  stored,
  patchToken,
  onIgnored,
}: {
  stored: StoredProposal;
  patchToken: string;
  onIgnored: () => void;
}) {
  const exported = isProposalExported(patchToken);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(stored, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposal-${patchToken}.json`;
    a.click();
    URL.revokeObjectURL(url);
    markProposalExported(patchToken);
  };

  const handleIgnore = () => {
    ignoreProposalToken(patchToken);
    onIgnored();
  };

  return (
    <div className="sl-proposal-toolbar">
      <button
        type="button"
        className="sl-btn sl-btn-primary"
        disabled
        title="R1.0 — gated writes not enabled"
      >
        Apply
      </button>
      <button
        type="button"
        className="sl-btn sl-btn-ghost"
        onClick={handleExport}
      >
        <ShellIcon name="copy" size={14} />
        {exported ? "Exported" : "Export JSON"}
      </button>
      <button
        type="button"
        className="sl-btn sl-btn-ghost"
        onClick={handleIgnore}
      >
        Ignore
      </button>
    </div>
  );
}
