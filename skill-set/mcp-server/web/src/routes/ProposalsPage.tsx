import { Badge, PageHeader } from "../components/ShellPrimitives";
import { ShellIcon } from "../components/ShellIcon";

const PROPOSAL_SKETCH = [
  {
    title: "Promote 'release-versioning' to always-on",
    impact: "high" as const,
    reason: "Used by 3 always-on skills with high confidence edges.",
  },
  {
    title: "Resolve cycle: software-architecture ↔ enterprise-architecture",
    impact: "medium" as const,
    reason: "Convert 1 'depends-on' edge to 'references' to break the loop.",
  },
  {
    title: "Merge 'office-docx' and 'docx-documentation'",
    impact: "medium" as const,
    reason: "Triggers overlap; descriptions span a single capability.",
  },
  {
    title: "Add escalation reference to 'documentation-governance'",
    impact: "high" as const,
    reason: "Deferred-tier authority missing required escalation.",
  },
];

export function ProposalsPage() {
  return (
    <div className="sl-proposals">
      <PageHeader
        eyebrow="R0.4 · planned"
        title="Proposals"
        subtitle="Catalog-aware refactor and authoring proposals, drafted by the advisor."
      />
      <div className="sl-proposals-grid">
        {PROPOSAL_SKETCH.map((proposal) => (
          <article key={proposal.title} className="sl-proposal">
            <div className="sl-proposal-top">
              <Badge tone={proposal.impact === "high" ? "info" : "neutral"}>
                {proposal.impact} impact
              </Badge>
              <span className="sl-muted">draft</span>
            </div>
            <h3>{proposal.title}</h3>
            <p>{proposal.reason}</p>
            <div className="sl-proposal-foot">
              <button type="button" className="sl-btn sl-btn-ghost" disabled>
                Preview diff
              </button>
              <button type="button" className="sl-btn sl-btn-ghost" disabled>
                Dismiss
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="sl-proposals-note">
        <ShellIcon name="sparkle" size={14} />
        <span>
          Proposals are a planned R0.4 capability. This screen sketches the
          intended surface — interactions are disabled.
        </span>
      </div>
    </div>
  );
}
