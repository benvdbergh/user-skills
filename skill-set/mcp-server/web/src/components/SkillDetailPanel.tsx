import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { HealthStatus, SkillDetail } from "../api/catalog";
import { skillGraphNodeId } from "../api/catalog";
import { getSourceLinkPresentation } from "../lib/sourceLink";
import { Badge, HealthPill } from "./ShellPrimitives";
import { ShellIcon } from "./ShellIcon";
import { SkillDetailContent } from "./SkillDetailContent";

export type SkillDetailPanelMode = "panel" | "fullscreen";

export interface SkillDetailPanelProps {
  mode: SkillDetailPanelMode;
  environmentId: string;
  skillName: string;
  onClose?: () => void;
  /** Catalog query string (without leading `?`) for back / full-page links. */
  catalogSearch?: string;
  scope?: string;
  health?: { status: HealthStatus; findings: number };
  description?: string;
  /** Resolved SKILL.md path for header “View source”. */
  sourcePath?: string;
}

interface HeaderState {
  scope: string;
  health: { status: HealthStatus; findings: number };
  description: string;
  sourcePath?: string;
}

export function SkillDetailPanel({
  mode,
  environmentId,
  skillName,
  onClose,
  catalogSearch = "",
  scope: scopeProp = "user",
  health: healthProp = { status: "ok", findings: 0 },
  description: descriptionProp = "",
  sourcePath: sourcePathProp,
}: SkillDetailPanelProps) {
  const navigate = useNavigate();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [header, setHeader] = useState<HeaderState>({
    scope: scopeProp,
    health: healthProp,
    description: descriptionProp,
    sourcePath: sourcePathProp,
  });

  useEffect(() => {
    setHeader({
      scope: scopeProp,
      health: healthProp,
      description: descriptionProp,
      sourcePath: sourcePathProp,
    });
  }, [
    environmentId,
    skillName,
    scopeProp,
    healthProp,
    descriptionProp,
    sourcePathProp,
  ]);

  const onSkillLoaded = useCallback((skill: SkillDetail) => {
    setHeader({
      scope: skill.scope,
      health: skill.health,
      description: skill.description,
      sourcePath: skill.sourcePath,
    });
  }, []);

  useEffect(() => {
    if (mode !== "panel") return;
    closeButtonRef.current?.focus();
  }, [mode, environmentId, skillName]);

  const nodeId = skillGraphNodeId({ scope: header.scope, name: skillName });
  const catalogTo = catalogSearch ? `/?${catalogSearch}` : "/";
  const fullPageTo = `/skills/${encodeURIComponent(environmentId)}/${encodeURIComponent(skillName)}${catalogSearch ? `?${catalogSearch}` : ""}`;
  const source = header.sourcePath
    ? getSourceLinkPresentation(header.sourcePath)
    : null;

  function openGraph() {
    navigate(`/graph?nodeId=${encodeURIComponent(nodeId)}&depth=1`);
    onClose?.();
  }

  const panel = (
    <aside
      className={`sl-detail sl-detail-${mode}`}
      aria-label={`Skill detail: ${skillName}`}
    >
      <header className="sl-detail-header">
        <div className="sl-detail-eyebrow">
          <Badge tone={header.scope === "user" ? "info" : "neutral"}>
            {header.scope}
          </Badge>
          <span className="sl-detail-env">{environmentId}</span>
          <HealthPill
            status={header.health.status}
            findings={header.health.findings}
          />
        </div>
        <h2 id="detail-heading">{skillName}</h2>
        {header.description ? (
          <p className="sl-detail-desc">{header.description}</p>
        ) : null}
        <div className="sl-detail-actions">
          <button
            type="button"
            className="sl-btn sl-btn-ghost"
            onClick={openGraph}
          >
            <ShellIcon name="graph" size={14} />
            Open in graph
          </button>
          {source?.isLinkable ? (
            <a href={source.href} className="sl-btn sl-btn-ghost">
              <ShellIcon name="external" size={14} />
              View source
            </a>
          ) : (
            <button type="button" className="sl-btn sl-btn-ghost" disabled>
              <ShellIcon name="external" size={14} />
              View source
            </button>
          )}
          {mode === "panel" && (
            <Link to={fullPageTo} className="sl-btn sl-btn-ghost">
              Full page
            </Link>
          )}
          <span className="sl-detail-spacer" />
          {mode === "panel" && onClose && (
            <button
              ref={closeButtonRef}
              type="button"
              className="sl-icon-btn"
              onClick={onClose}
              aria-label="Close skill detail"
            >
              <ShellIcon name="close" size={16} />
            </button>
          )}
        </div>
      </header>

      <SkillDetailContent
        environmentId={environmentId}
        skillName={skillName}
        onSkillLoaded={onSkillLoaded}
      />
    </aside>
  );

  if (mode === "fullscreen") {
    return (
      <div className="sl-skill-detail-route">
        <Link to={catalogTo} className="sl-detail-back">
          ← Catalog
        </Link>
        {panel}
      </div>
    );
  }

  return panel;
}
