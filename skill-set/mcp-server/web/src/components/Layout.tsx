import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { EnvironmentSwitcher } from "./EnvironmentSwitcher";
import "./Layout.css";

const navItems = [
  { to: "/", label: "Catalog", end: true as const },
  { to: "/graph", label: "Graph" },
  { to: "/health", label: "Health" },
  { to: "/proposals", label: "Proposals", disabled: true as const },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="skill-lab-shell">
      <header className="skill-lab-header">
        <div className="skill-lab-brand">
          <span className="skill-lab-logo" aria-hidden>
            ◆
          </span>
          <h1>Skill Lab</h1>
        </div>
        <EnvironmentSwitcher />
        <nav className="skill-lab-nav" aria-label="Main">
          {navItems.map((item) =>
            item.disabled ? (
              <span
                key={item.to}
                className="skill-lab-nav-link is-disabled"
                aria-disabled="true"
                title="Planned for R0.4"
              >
                {item.label}
              </span>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : false}
                className={({ isActive }) =>
                  `skill-lab-nav-link${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
      </header>
      <main className="skill-lab-main">{children}</main>
    </div>
  );
}