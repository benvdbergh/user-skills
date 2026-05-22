import type { ReactNode } from "react";

export type ShellIconName =
  | "catalog"
  | "graph"
  | "health"
  | "proposals"
  | "search"
  | "chevron"
  | "chevronDown"
  | "command"
  | "plus"
  | "refresh"
  | "user"
  | "folder"
  | "flask"
  | "close"
  | "external"
  | "error"
  | "warning"
  | "info"
  | "check"
  | "sparkle"
  | "copy";

const paths: Record<ShellIconName, ReactNode> = {
  catalog: (
    <>
      <rect x="3" y="4" width="18" height="3.5" rx="0.5" />
      <rect x="3" y="10.25" width="18" height="3.5" rx="0.5" />
      <rect x="3" y="16.5" width="18" height="3.5" rx="0.5" />
    </>
  ),
  graph: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <line x1="7.5" y1="7" x2="10.5" y2="10.5" />
      <line x1="16.5" y1="7" x2="13.5" y2="10.5" />
      <line x1="7.5" y1="17" x2="10.5" y2="13.5" />
      <line x1="16.5" y1="17" x2="13.5" y2="13.5" />
    </>
  ),
  health: <path d="M3 12h4l2 -6 4 12 2 -6h6" />,
  proposals: (
    <>
      <path d="M5 4h10l4 4v12H5z" />
      <polyline points="15 4 15 8 19 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15" y1="15" x2="20" y2="20" />
    </>
  ),
  chevron: <polyline points="9 6 15 12 9 18" />,
  chevronDown: <polyline points="6 9 12 15 18 9" />,
  command: (
    <>
      <path d="M9 6h-3a3 3 0 0 0 0 6h12a3 3 0 0 1 0 6h-3" />
      <path d="M15 18h3a3 3 0 0 0 0 -6h-12a3 3 0 0 1 0 -6h3" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  refresh: (
    <>
      <path d="M4 12a8 8 0 0 1 14 -5" />
      <polyline points="18 3 18 7 14 7" />
      <path d="M20 12a8 8 0 0 1 -14 5" />
      <polyline points="6 21 6 17 10 17" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1 -4 4 -6 7 -6s6 2 7 6" />
    </>
  ),
  folder: (
    <path d="M3 6.5a1 1 0 0 1 1 -1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" />
  ),
  flask: (
    <>
      <path d="M9 3v6l-5 10a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8 -3l-5 -10v-6" />
      <line x1="8" y1="3" x2="16" y2="3" />
    </>
  ),
  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  external: (
    <>
      <path d="M11 5h-6v14h14v-6" />
      <polyline points="14 4 20 4 20 10" />
      <line x1="13" y1="11" x2="20" y2="4" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <line x1="12" y1="16" x2="12" y2="16" />
    </>
  ),
  warning: (
    <>
      <polygon points="12 3 22 20 2 20" />
      <line x1="12" y1="10" x2="12" y2="15" />
      <line x1="12" y1="17.5" x2="12" y2="17.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="12" y1="7.5" x2="12" y2="7.5" />
    </>
  ),
  check: <polyline points="5 12 10 17 19 7" />,
  sparkle: (
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8 -5.2L5 10l5.2 -1.8z" />
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M6 15H5a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1" />
    </>
  ),
};

export function ShellIcon({
  name,
  size = 16,
  className = "",
}: {
  name: ShellIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`sl-icon ${className}`.trim()}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

export function StatusDot({
  status,
  size = 8,
}: {
  status: "ok" | "warning" | "error";
  size?: number;
}) {
  return (
    <span
      className={`sl-dot sl-dot-${status}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
