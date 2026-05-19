import { useState, type ReactNode } from "react";
import type { HealthStatus } from "../api/catalog";
import { healthStatusLabel } from "../lib/catalogView";
import { ShellIcon, StatusDot } from "./ShellIcon";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  right,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sl-page-header">
      <div className="sl-page-header-text">
        {eyebrow && <p className="sl-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="sl-page-subtitle">{subtitle}</p>}
      </div>
      {right && <div className="sl-page-header-right">{right}</div>}
    </header>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: "neutral" | "info" | "accent";
  children: ReactNode;
  className?: string;
}) {
  const toneClass = tone === "neutral" ? "" : ` sl-badge-${tone}`;
  return (
    <span className={`sl-badge${toneClass} ${className}`.trim()}>{children}</span>
  );
}

const HEALTH_LABELS: Record<HealthStatus, string> = {
  ok: "Healthy",
  warning: "Warn",
  error: "Error",
};

export function HealthPill({
  status,
  findings = 0,
}: {
  status: HealthStatus;
  findings?: number;
}) {
  return (
    <span className={`sl-health-pill sl-health-${status}`}>
      <StatusDot status={status} />
      <span>{HEALTH_LABELS[status] ?? healthStatusLabel(status)}</span>
      {findings > 0 && (
        <span className="sl-health-pill-count">{findings}</span>
      )}
    </span>
  );
}

export function MonoPath({
  path,
  maxLen = 48,
  className = "",
}: {
  path: string;
  maxLen?: number;
  className?: string;
}) {
  const trunc =
    path.length > maxLen
      ? `${path.slice(0, maxLen / 2 - 1)}…${path.slice(-(maxLen / 2 - 1))}`
      : path;
  return (
    <code className={`sl-mono-path ${className}`.trim()} title={path}>
      {trunc}
    </code>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="sl-empty">
      <div className="sl-empty-mark" aria-hidden>
        ◇
      </div>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

export function FilterChipDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`sl-filter-drop ${open ? "is-open" : ""} ${value ? "has-value" : ""}`}
    >
      <button
        type="button"
        className="sl-filter-drop-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="sl-filter-drop-label">{label}</span>
        {value && <span className="sl-filter-drop-value">{value}</span>}
        <ShellIcon name="chevronDown" size={12} />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="sl-filter-drop-scrim"
            aria-label="Close filter menu"
            onClick={() => setOpen(false)}
          />
          <div className="sl-filter-drop-menu" role="listbox" aria-label={label}>
            <button
              type="button"
              className={`sl-filter-opt ${!value ? "is-active" : ""}`}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              All
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`sl-filter-opt ${value === opt ? "is-active" : ""}`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
