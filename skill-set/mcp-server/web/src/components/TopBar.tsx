import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useEnvironment } from "../context/EnvironmentContext";
import { ShellIcon } from "./ShellIcon";

const sectionLabels: Record<string, string> = {
  "/": "Catalog",
  "/graph": "Graph",
  "/health": "Health",
  "/proposals": "Proposals",
};

function sectionLabel(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/skills/")) {
    return sectionLabels["/"];
  }
  for (const [prefix, label] of Object.entries(sectionLabels)) {
    if (prefix !== "/" && pathname.startsWith(prefix)) {
      return label;
    }
  }
  return "Catalog";
}

export function TopBar() {
  const { pathname } = useLocation();
  const { skillName } = useParams<{ skillName?: string }>();
  const { environments, environmentId } = useEnvironment();

  const env = useMemo(
    () => environments.find((e) => e.id === environmentId),
    [environments, environmentId],
  );

  const section = sectionLabel(pathname);
  const showSkillCrumb =
    Boolean(skillName) && pathname.startsWith("/skills/");

  return (
    <header className="sl-topbar">
      <nav className="sl-crumbs" aria-label="Breadcrumb">
        <span className="sl-crumb">
          {env ? (env.displayName ?? env.id) : "All environments"}
        </span>
        <ShellIcon name="chevron" size={11} />
        <span className="sl-crumb is-current">{section}</span>
        {showSkillCrumb && skillName && (
          <>
            <ShellIcon name="chevron" size={11} />
            <span className="sl-crumb is-current">
              <code>{skillName}</code>
            </span>
          </>
        )}
      </nav>
      <div className="sl-topbar-spacer" />
      <button
        type="button"
        className="sl-topbar-cmd"
        title="Command palette (⌘K) — coming soon"
        aria-disabled="true"
      >
        <ShellIcon name="command" size={12} />
        <span>Go to…</span>
        <kbd>⌘K</kbd>
      </button>
    </header>
  );
}
