import { NavLink, useLocation } from "react-router-dom";
import { EnvironmentSwitcher } from "./EnvironmentSwitcher";
import { ShellIcon, StatusDot } from "./ShellIcon";

const navItems = [
  { to: "/", label: "Catalog", icon: "catalog" as const, end: true },
  { to: "/graph", label: "Graph", icon: "graph" as const },
  { to: "/health", label: "Health", icon: "health" as const, showHealthPip: true },
  {
    to: "/proposals",
    label: "Proposals",
    icon: "proposals" as const,
    badge: "R0.4",
  },
];

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
          <div className="sl-brand-sub">Control plane · v0.3</div>
        </div>
      </div>

      <EnvironmentSwitcher />

      <nav className="sl-nav" aria-label="Main">
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <span
                key={item.to}
                className="sl-nav-item is-disabled"
                aria-disabled="true"
                title="Planned for R0.4"
              >
                <ShellIcon name={item.icon} size={15} />
                <span className="sl-nav-label">{item.label}</span>
                {item.badge && (
                  <span className="sl-nav-badge">{item.badge}</span>
                )}
              </span>
            );
          }

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
              {item.badge && (
                <span className="sl-nav-badge">{item.badge}</span>
              )}
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
