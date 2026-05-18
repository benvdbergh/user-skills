import { getSourceLinkPresentation } from "../lib/sourceLink";
import "./SourceLink.css";

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
    <span className={["source-link", className].filter(Boolean).join(" ")}>
      {isLinkable ? (
        <a href={href} title={fullPath} className="source-link-anchor">
          {label}
        </a>
      ) : (
        <span title={fullPath} className="source-link-relative">
          {label}
        </span>
      )}
      {showFullPath && (
        <code className="source-link-path" title={fullPath}>
          {fullPath}
        </code>
      )}
    </span>
  );
}
