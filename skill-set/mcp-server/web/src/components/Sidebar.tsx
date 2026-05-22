import { NavLink, useLocation } from "react-router-dom";
import { useEnvironment } from "../context/EnvironmentContext";
import { buildHealthPath } from "../lib/healthUrlParams";
import { EnvironmentSwitcher } from "./EnvironmentSwitcher";
import { SettingsAiStrip } from "./SettingsAiStrip";
import { ShellIcon, StatusDot } from "./ShellIcon";

export interface HealthNavCounts {
  error: number;
  warning: number;
}

export function Sidebar({
  healthCounts = { error: 0, warning: 0 },
}: {
  healthCounts?: HealthNavCounts;
}) {
  const location = useLocation();
  const { environmentId } = useEnvironment();
  const healthNavTo = buildHealthPath(
    environmentId ? { environmentId } : {},
  );

  const navItems = [
    { to: "/", label: "Catalog", icon: "catalog" as const, end: true },
    { to: "/graph", label: "Graph", icon: "graph" as const },
    {
      to: healthNavTo,
      label: "Health",
      icon: "health" as const,
      showHealthPip: true,
    },
    { to: "/proposals", label: "Proposals", icon: "proposals" as const },
  ];

  const isCatalogActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/skills/");

  return (
    <aside className="sl-sidebar">
      <div className="sl-brand">
        <div className="sl-brand-mark">
          <ShellIcon name="flask" size={18} />
        </div>
        <div className="sl-brand-text">
          <div className="sl-brand-name">Skill Lab</div>
          <div className="sl-brand-sub">Control plane · v0.4</div>
        </div>
      </div>

      <EnvironmentSwitcher />

      <nav className="sl-nav" aria-label="Main">
        {navItems.map((item) => {
          const active =
            item.to === "/"
              ? isCatalogActive
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : false}
              className={`sl-nav-item${active ? " is-active" : ""}`}
            >
              <ShellIcon name={item.icon} size={15} />
              <span className="sl-nav-label">{item.label}</span>
              {item.showHealthPip && healthCounts.error > 0 && (
                <span className="sl-nav-pip">
                  <StatusDot status="error" />
                </span>
              )}
              {item.showHealthPip &&
                healthCounts.error === 0 &&
                healthCounts.warning > 0 && (
                  <span className="sl-nav-pip">
                    <StatusDot status="warning" />
                  </span>
                )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sl-sidebar-foot">
        <SettingsAiStrip />
        <div className="sl-sidebar-meta">
          <span>Indexed</span>
          <span aria-hidden>—</span>
        </div>
        <div className="sl-sidebar-meta">
          <span>Map version</span>
          <code aria-hidden>—</code>
        </div>
      </div>
    </aside>
  );
}
