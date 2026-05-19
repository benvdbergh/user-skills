import { useEffect, useState } from "react";
import { useEnvironment } from "../context/EnvironmentContext";
import type { Environment } from "../api/catalog";
import { ShellIcon } from "./ShellIcon";

function envIcon(scope: string) {
  return scope === "user" ? "user" : "folder";
}

function envDisplayName(env: Environment | undefined, environmentId: string) {
  if (!environmentId) return "All environments";
  return env?.displayName ?? environmentId;
}

export function EnvironmentSwitcher() {
  const { environments, environmentId, setEnvironmentId, loading, error } =
    useEnvironment();
  const [open, setOpen] = useState(false);
  const current = environments.find((e) => e.id === environmentId);
  const disabled = loading || Boolean(error);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={`sl-env${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="sl-env-btn"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className="sl-env-icon">
          <ShellIcon
            name={
              environmentId
                ? envIcon(current?.scope ?? "project")
                : "catalog"
            }
            size={14}
          />
        </span>
        <span className="sl-env-meta">
          <span className="sl-env-eyebrow">Environment</span>
          <span className="sl-env-name">
            {loading
              ? "Loading…"
              : error
                ? "Unavailable"
                : envDisplayName(current, environmentId)}
          </span>
        </span>
        <ShellIcon name="chevronDown" size={12} />
      </button>
      {open && !disabled && (
        <>
          <button
            type="button"
            className="sl-env-scrim"
            aria-label="Close environment menu"
            onClick={() => setOpen(false)}
          />
          <div className="sl-env-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              className={`sl-env-opt${!environmentId ? " is-active" : ""}`}
              onClick={() => {
                setEnvironmentId("");
                setOpen(false);
              }}
            >
              <div className="sl-env-opt-main">
                <span className="sl-env-icon">
                  <ShellIcon name="catalog" size={12} />
                </span>
                <span>
                  <span className="sl-env-name">All environments</span>
                  <span className="sl-env-path">Aggregated view</span>
                </span>
              </div>
            </button>
            <div className="sl-env-divider" />
            {environments.map((env) => (
              <button
                key={env.id}
                type="button"
                role="menuitem"
                className={`sl-env-opt${environmentId === env.id ? " is-active" : ""}${!env.pathResolvable ? " is-warn" : ""}`}
                onClick={() => {
                  setEnvironmentId(env.id);
                  setOpen(false);
                }}
              >
                <div className="sl-env-opt-main">
                  <span className="sl-env-icon">
                    <ShellIcon name={envIcon(env.scope)} size={12} />
                  </span>
                  <span>
                    <span className="sl-env-name">
                      {env.displayName ?? env.id}
                      {!env.pathResolvable && (
                        <span className="sl-env-warn">unresolved</span>
                      )}
                    </span>
                    <span className="sl-env-path">{env.path}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
