import type { RelationshipProposal } from "../api/proposals";
import { CitationChip } from "./CitationChip";

export function RelationshipProposalCard({
  proposal,
}: {
  proposal: RelationshipProposal;
}) {
  return (
    <div className="sl-rel-proposal">
      <p className="sl-muted">
        {proposal.edges.length} suggested edge
        {proposal.edges.length === 1 ? "" : "s"}
        {proposal.skillName ? ` for ${proposal.skillName}` : ""}
      </p>
      <ul className="sl-rel-edge-list">
        {proposal.edges.map((edge) => (
          <li key={`${edge.fromSkill}-${edge.toSkill}-${edge.relationshipType}`}>
            <div className="sl-rel-edge-head">
              <code>{edge.fromSkill}</code>
              <span aria-hidden>→</span>
              <code>{edge.toSkill}</code>
              <span className="sl-rel-type">{edge.relationshipType}</span>
              <span className="sl-rel-conf-pct">
                {(edge.confidence * 100).toFixed(0)}%
              </span>
            </div>
            {edge.rationale && <p>{edge.rationale}</p>}
            <CitationChip
              citation={{
                sourcePath: edge.evidence.sourceFile,
                quote: edge.evidence.quote,
              }}
            />
          </li>
        ))}
      </ul>
      {proposal.rejectedEdges && proposal.rejectedEdges.length > 0 && (
        <p className="sl-muted">
          {proposal.rejectedEdges.length} edge(s) rejected during validation
        </p>
      )}
    </div>
  );
}
