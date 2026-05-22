import type { StoredProposal } from "../api/proposals";
import { Badge } from "./ShellPrimitives";
import { CitationChip } from "./CitationChip";
import { ProposalDiffViewer } from "./ProposalDiffViewer";
import { ProposalToolbar } from "./ProposalToolbar";
import { RelationshipProposalCard } from "./RelationshipProposalCard";

export function ProposalDetail({
  stored,
  patchToken,
  onIgnored,
}: {
  stored: StoredProposal;
  patchToken: string;
  onIgnored: () => void;
}) {
  if (stored.proposalKind === "patch") {
    const p = stored.proposal;
    return (
      <div className="sl-proposal-detail">
        <header className="sl-proposal-detail-head">
          <div>
            <h2>{p.skillName}</h2>
            <p className="sl-muted">{p.rationale}</p>
          </div>
          <Badge tone="info">{p.kind}</Badge>
        </header>
        <ProposalToolbar
          stored={stored}
          patchToken={patchToken}
          onIgnored={onIgnored}
        />
        <section className="sl-proposal-detail-section">
          <h3>File changes</h3>
          <ul className="sl-file-change-list">
            {p.fileChanges.map((fc) => (
              <li key={fc.relativePath}>
                <code>{fc.relativePath}</code>
              </li>
            ))}
          </ul>
        </section>
        <section className="sl-proposal-detail-section">
          <h3>Diff preview</h3>
          <ProposalDiffViewer patchToken={patchToken} />
        </section>
        {p.citations.length > 0 && (
          <section className="sl-proposal-detail-section">
            <h3>Citations</h3>
            <div className="sl-citation-list">
              {p.citations.map((c, i) => (
                <CitationChip key={`${c.sourcePath}-${i}`} citation={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  if (stored.proposalKind === "relationship") {
    return (
      <div className="sl-proposal-detail">
        <ProposalToolbar
          stored={stored}
          patchToken={patchToken}
          onIgnored={onIgnored}
        />
        <RelationshipProposalCard proposal={stored.proposal} />
      </div>
    );
  }

  const report = stored.proposal;
  return (
    <div className="sl-proposal-detail">
      <ProposalToolbar
        stored={stored}
        patchToken={patchToken}
        onIgnored={onIgnored}
      />
      <p className="sl-muted">
        Scanned {report.scannedSkillCount} skills ·{" "}
        {report.conflicts.length} conflicts
      </p>
      <ul className="sl-conflict-list">
        {report.conflicts.map((c) => (
          <li key={c.triggerPhrase}>
            <Badge tone={c.severity === "error" ? "info" : "neutral"}>
              {c.severity}
            </Badge>
            <strong>{c.triggerPhrase}</strong>
            <p>{c.rationale}</p>
            <p className="sl-muted">{c.skillNames.join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
