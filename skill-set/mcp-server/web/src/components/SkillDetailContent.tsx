import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  fetchSkillDetail,
  skillGraphNodeId,
  type SkillDetail,
  type SkillFileRef,
} from "../api/catalog";
import { fetchGraphNeighbors, type SkillGraphResult } from "../api/graph";
import { ApiError } from "../api/client";
import { Badge } from "./ShellPrimitives";
import { StatusDot } from "./ShellIcon";
import { SourceLink } from "./SourceLink";
import {
  neighborLabel,
  splitNeighborRelations,
  type NeighborRelation,
} from "../lib/skillDetailView";

export function SkillDetailContent({
  environmentId,
  skillName,
  onSkillLoaded,
}: {
  environmentId: string;
  skillName: string;
  onSkillLoaded?: (skill: SkillDetail) => void;
}) {
  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [graph, setGraph] = useState<SkillGraphResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSkill(null);
    setGraph(null);

    fetchSkillDetail(environmentId, skillName)
      .then(async (detail) => {
        if (cancelled) return;
        setSkill(detail);
        onSkillLoaded?.(detail);
        const nodeId = skillGraphNodeId(detail);
        try {
          const neighbors = await fetchGraphNeighbors({ nodeId, depth: 1 });
          if (!cancelled) setGraph(neighbors);
        } catch {
          if (!cancelled) setGraph({ nodes: [], edges: [] });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? (err.problem.detail ?? err.problem.title)
            : err instanceof Error
              ? err.message
              : "Failed to load skill";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [environmentId, skillName, onSkillLoaded]);

  const centerNodeId = skill ? skillGraphNodeId(skill) : "";
  const relations = useMemo(
    () =>
      graph && centerNodeId
        ? splitNeighborRelations(centerNodeId, graph)
        : { incoming: [], outgoing: [] },
    [graph, centerNodeId],
  );

  if (loading) {
    return <p className="sl-detail-loading">Loading skill…</p>;
  }

  if (error) {
    return (
      <div className="sl-detail-error" role="alert">
        {error}
      </div>
    );
  }

  if (!skill) return null;

  const relCount = relations.incoming.length + relations.outgoing.length;
  const fileCount =
    skill.references.length + skill.scripts.length + skill.assets.length;

  return (
    <div className="sl-detail-body">
      <DetailKV label="Source">
        <SourceLink sourcePath={skill.sourcePath} showFullPath />
      </DetailKV>

      <div className="sl-detail-grid">
        <DetailKV label="Tier">
          <Badge tone={skill.tier === "always" ? "accent" : "neutral"}>
            {skill.tier}
          </Badge>
        </DetailKV>
        <DetailKV label="Scope">{skill.scope}</DetailKV>
        <DetailKV label="Environment">{skill.environmentId}</DetailKV>
        <DetailKV label="Description">
          {skill.descriptionLength.toLocaleString()} chars
        </DetailKV>
        {skill.license && <DetailKV label="License">{skill.license}</DetailKV>}
        {skill.compatibility && (
          <DetailKV label="Compatibility">
            <code>{skill.compatibility}</code>
          </DetailKV>
        )}
        {skill.allowedTools && (
          <DetailKV label="Tools">
            <code className="sl-mono-inline">{skill.allowedTools}</code>
          </DetailKV>
        )}
      </div>

      {skill.metadata && Object.keys(skill.metadata).length > 0 && (
        <pre className="sl-detail-metadata">
          {JSON.stringify(skill.metadata, null, 2)}
        </pre>
      )}

      <DetailSection title="Triggers" count={skill.triggers.length}>
        {skill.triggers.length === 0 ? (
          <p className="sl-muted">None.</p>
        ) : (
          <div className="sl-tag-list">
            {skill.triggers.map((t) => (
              <span key={t} className="sl-tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Workflows" count={skill.workflows.length}>
        {skill.workflows.length === 0 ? (
          <p className="sl-muted">None.</p>
        ) : (
          <ol className="sl-wf-list">
            {skill.workflows.map((w, i) => (
              <li key={w}>
                <span className="sl-wf-idx">{String(i + 1).padStart(2, "0")}</span>
                {w}
              </li>
            ))}
          </ol>
        )}
      </DetailSection>

      <DetailSection title="Escalation">
        <div
          className={`sl-escalation sl-escalation-${skill.hasSkillEscalation ? "present" : "absent"}`}
        >
          <StatusDot status={skill.hasSkillEscalation ? "ok" : "warning"} />
          <div>
            <strong>
              {skill.hasSkillEscalation
                ? "Escalation reference present"
                : "No escalation reference"}
            </strong>
            <p>
              {skill.hasSkillEscalation
                ? "An escalation playbook is wired in for cases where the skill's confidence drops."
                : "Consider adding an escalation reference, especially for deferred-tier skills."}
            </p>
          </div>
        </div>
      </DetailSection>

      {fileCount > 0 && (
        <DetailSection title="Referenced files" count={fileCount}>
          <FileGroup title="References" items={skill.references} />
          <FileGroup title="Scripts" items={skill.scripts} />
          <FileGroup title="Assets" items={skill.assets} />
        </DetailSection>
      )}

      {skill.missingReferences.length > 0 && (
        <DetailSection
          title="Missing references"
          count={skill.missingReferences.length}
        >
          <ul className="sl-file-list">
            {skill.missingReferences.map((ref) => (
              <li key={ref} className="is-missing">
                <SourceLink sourcePath={ref} showFullPath />
                <span className="sl-file-status sl-file-status-missing">
                  missing
                </span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      <DetailSection title="Relationships" count={relCount}>
        <p className="sl-muted sl-node-id">
          Graph node <code>{centerNodeId}</code>
        </p>
        <RelationshipGroup
          label="Incoming"
          items={relations.incoming}
          direction="incoming"
        />
        <RelationshipGroup
          label="Outgoing"
          items={relations.outgoing}
          direction="outgoing"
        />
        <p className="sl-detail-graph-link">
          <Link
            to={`/graph?nodeId=${encodeURIComponent(centerNodeId)}&depth=1`}
          >
            Open graph explorer
          </Link>
        </p>
      </DetailSection>
    </div>
  );
}

function DetailKV({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sl-kv">
      <div className="sl-kv-label">{label}</div>
      <div className="sl-kv-value">{children}</div>
    </div>
  );
}

function DetailSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="sl-detail-section">
      <h3>
        <span>{title}</span>
        {count !== undefined && (
          <span className="sl-detail-section-count">{count}</span>
        )}
      </h3>
      {children}
    </section>
  );
}

function FileGroup({
  title,
  items,
}: {
  title: string;
  items: SkillFileRef[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="sl-file-group">
      <div className="sl-file-group-head">
        {title} · {items.length}
      </div>
      <ul className="sl-file-list">
        {items.map((f) => (
          <li
            key={`${f.kind}-${f.relativePath}`}
            className={!f.exists ? "is-missing" : undefined}
          >
            <SourceLink sourcePath={f.relativePath} />
            <span
              className={`sl-file-status sl-file-status-${f.exists ? "exists" : "missing"}`}
            >
              {f.exists ? "exists" : "missing"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RelationshipGroup({
  label,
  items,
  direction,
}: {
  label: string;
  items: NeighborRelation[];
  direction: "incoming" | "outgoing";
}) {
  return (
    <div className="sl-rel-group">
      <div className="sl-rel-group-head">
        {label} · {items.length}
      </div>
      {items.length === 0 ? (
        <p className="sl-muted">None</p>
      ) : (
        <ul className="sl-rel-list">
          {items.map(({ edge, node }) => (
            <li key={edge.id}>
              <span className="sl-rel-arrow" aria-hidden>
                {direction === "incoming" ? "←" : "→"}
              </span>
              <span className="sl-rel-other">
                {neighborLabel({ edge, node }, direction)}
              </span>
              <span className="sl-rel-type">{edge.type}</span>
              <span
                className="sl-rel-conf"
                title={`${(edge.confidence * 100).toFixed(0)}% confidence`}
              >
                <span className="sl-rel-conf-bar">
                  <span style={{ width: `${edge.confidence * 100}%` }} />
                </span>
                {(edge.confidence * 100).toFixed(0)}%
              </span>
              {edge.mappingIsApproximate && (
                <span className="sl-rel-approx">~ approx</span>
              )}
              {node?.sourcePath && (
                <SourceLink
                  sourcePath={node.sourcePath}
                  className="sl-rel-path"
                  showFullPath
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
