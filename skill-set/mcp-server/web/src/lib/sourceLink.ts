const DEFAULT_IDE_SCHEME = "vscode";

export function getIdeLinkScheme(): string {
  const raw = import.meta.env.VITE_IDE_LINK_SCHEME;
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim();
  }
  return DEFAULT_IDE_SCHEME;
}

export function normalizePosixPath(sourcePath: string): string {
  return sourcePath.replace(/\\/g, "/");
}

export function isAbsoluteSourcePath(sourcePath: string): boolean {
  return /^(?:[A-Za-z]:[\\/]|\\\\|\/)/.test(sourcePath);
}

export function sourcePathBasename(sourcePath: string): string {
  const parts = normalizePosixPath(sourcePath).split("/");
  return parts[parts.length - 1] || sourcePath;
}

function encodePathForFileUrl(filePath: string): string {
  const normalized = normalizePosixPath(filePath);
  return normalized
    .split("/")
    .map((segment, index) => {
      if (index === 0 && /^[A-Za-z]:$/.test(segment)) {
        return segment;
      }
      return encodeURIComponent(segment);
    })
    .join("/");
}

/** IDE deep link when path is absolute; see docs/ui-api-compatibility.md */
export function buildIdeFileHref(sourcePath: string): string | undefined {
  if (!isAbsoluteSourcePath(sourcePath)) {
    return undefined;
  }
  const scheme = getIdeLinkScheme();
  const encoded = encodePathForFileUrl(sourcePath);
  return `${scheme}://file/${encoded}`;
}

export interface SourceLinkPresentation {
  href: string | undefined;
  label: string;
  fullPath: string;
  isLinkable: boolean;
}

export function getSourceLinkPresentation(
  sourcePath: string,
): SourceLinkPresentation {
  const href = buildIdeFileHref(sourcePath);
  return {
    href,
    label: sourcePathBasename(sourcePath),
    fullPath: sourcePath,
    isLinkable: Boolean(href),
  };
}
