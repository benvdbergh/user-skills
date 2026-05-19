import { getSourceLinkPresentation } from "../lib/sourceLink";

export interface SourceLinkProps {
  sourcePath: string;
  className?: string;
  /** Show full path in a secondary line (e.g. health table). */
  showFullPath?: boolean;
}

export function SourceLink({
  sourcePath,
  className,
  showFullPath = false,
}: SourceLinkProps) {
  const { href, label, fullPath, isLinkable } =
    getSourceLinkPresentation(sourcePath);

  return (
    <span className={["sl-source-link", className].filter(Boolean).join(" ")}>
      {isLinkable ? (
        <a href={href} title={fullPath} className="sl-source-link-anchor">
          {label}
        </a>
      ) : (
        <span title={fullPath} className="sl-source-link-relative">
          {label}
        </span>
      )}
      {showFullPath && (
        <code className="sl-source-link-path" title={fullPath}>
          {fullPath}
        </code>
      )}
    </span>
  );
}
