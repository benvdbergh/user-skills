import type { SourceCitation } from "../api/proposals";
import { SourceLink } from "./SourceLink";

export function CitationChip({ citation }: { citation: SourceCitation }) {
  return (
    <div className="sl-citation-chip">
      <SourceLink sourcePath={citation.sourcePath} />
      {citation.heading && (
        <span className="sl-citation-heading">{citation.heading}</span>
      )}
      {citation.quote && (
        <blockquote className="sl-citation-quote">{citation.quote}</blockquote>
      )}
    </div>
  );
}
