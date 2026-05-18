import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  fetchSkillDetail,
  skillGraphNodeId,
  type SkillDetail,
  type SkillFileRef,
} from "../api/catalog";
import {
  fetchGraphNeighbors,
  type SkillGraphResult,
} from "../api/graph";
import { ApiError } from "../api/client";
import { SourceLink } from "../components/SourceLink";
import {
  neighborLabel,
  splitNeighborRelations,
  type NeighborRelation,
} from "../lib/skillDetailView";
import "./SkillDetailPage.css";

export function SkillDetailPage() {
  const { environmentId, skillName } = useParams<{
    environmentId: string;
    skillName: string;
  }>();
  const [searchParams] = useSearchParams();
  const catalogSearch = searchParams.toString();

  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [graph, setGraph] = useState<SkillGraphResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!environmentId || !skillName) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSkill(null);
    setGraph(null);

    fetchSkillDetail(environmentId, skillName)
      .then(async (detail) => {
        if (cancelled) return;
        setSkill(detail);
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
  }, [environmentId, skillName]);

  const centerNodeId = skill ? skillGraphNodeId(skill) : "";
  const relations = useMemo(
    () =>
      graph && centerNodeId
        ? splitNeighborRelations(centerNodeId, graph)
        : { incoming: [], outgoing: [] },
    [graph, centerNodeId],
  );

  if (!environmentId || !skillName) {
    return (
      <section className="detail-page">
        <p className="detail-error" role="alert">
          Missing environment or skill name in URL.
        </p>
      </section>
    );
  }

  const catalogTo = catalogSearch ? `/?${catalogSearch}` : "/";

  return (
    <section className="detail-page" aria-labelledby="detail-heading">
      <header className="detail-header">
        <Link to={catalogTo} className="detail-back">
          ← Catalog
        </Link>
        <div>
          <h2 id="detail-heading">{skillName}</h2>
          <p className="detail-subtitle">
            {environmentId}
            {skill ? ` · ${skill.scope} scope` : ""}
          </p>
        </div>
      </header>

      {loading && <p className="detail-loading">Loading skill…</p>}

      {error && (
        <div className="detail-error" role="alert">
          {error}
        </div>
      )}

      {!loading && skill && (
        <>
          {skill.hasSkillEscalation && (
            <div className="detail-escalation detail-escalation-present" role="status">
              <strong>Skill escalation</strong> — escalation reference file is present
              for this skill.
            </div>
          )}

          <DetailSection title="Frontmatter">
            <dl className="detail-dl">
              <dt>Tier</dt>
              <dd>{skill.tier}</dd>
              <dt>Scope</dt>
              <dd>{skill.scope}</dd>
              <dt>Environment</dt>
              <dd>{skill.environmentId}</dd>
              <dt>Source path</dt>
              <dd>
                <SourceLink sourcePath={skill.sourcePath} showFullPath />
              </dd>
              {skill.license && (
                <>
                  <dt>License</dt>
                  <dd>{skill.license}</dd>
                </>
              )}
              {skill.compatibility && (
                <>
                  <dt>Compatibility</dt>
                  <dd>{skill.compatibility}</dd>
                </>
              )}
              {skill.allowedTools && (
                <>
                  <dt>Allowed tools</dt>
                  <dd>{skill.allowedTools}</dd>
                </>
              )}
            </dl>
            {skill.metadata && Object.keys(skill.metadata).length > 0 && (
              <pre className="detail-metadata">
                {JSON.stringify(skill.metadata, null, 2)}
              </pre>
            )}
          </DetailSection>

          <DetailSection title="Triggers">
            {skill.triggers.length === 0 ? (
              <p className="detail-muted">No triggers listed.</p>
            ) : (
              <ul className="detail-list">
                {skill.triggers.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </DetailSection>

          <DetailSection title="Description">
            <p className="detail-length">
              {skill.descriptionLength.toLocaleString()} characters
            </p>
            <p className="detail-description">{skill.description || "—"}</p>
          </DetailSection>

          <DetailSection title="Workflows">
            {skill.workflows.length === 0 ? (
              <p className="detail-muted">No workflows listed.</p>
            ) : (
              <ul className="detail-list">
                {skill.workflows.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </DetailSection>

          <DetailSection title="Referenced files">
            <FileRefTable title="References" items={skill.references} />
            <FileRefTable title="Scripts" items={skill.scripts} />
            <FileRefTable title="Assets" items={skill.assets} />
          </DetailSection>

          {!skill.hasSkillEscalation && (
            <p className="detail-escalation detail-escalation-absent">
              No skill-escalation file detected for this skill.
            </p>
          )}

          <DetailSection title="Missing references">
            {skill.missingReferences.length === 0 ? (
              <p className="detail-muted">All referenced paths resolve.</p>
            ) : (
              <ul className="detail-missing-list">
                {skill.missingReferences.map((ref) => (
                  <li key={ref}>
                    <SourceLink sourcePath={ref} showFullPath />
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>

          <DetailSection title="Relationships">
            <p className="detail-muted detail-node-id">
              Graph node: <code>{centerNodeId}</code>
            </p>
            <RelationshipList
              label="Incoming"
              items={relations.incoming}
              direction="incoming"
            />
            <RelationshipList
              label="Outgoing"
              items={relations.outgoing}
              direction="outgoing"
            />
            <p className="detail-graph-link">
              <Link
                to={`/graph?nodeId=${encodeURIComponent(centerNodeId)}&depth=1`}
              >
                Open graph explorer
              </Link>
            </p>
          </DetailSection>
        </>
      )}
    </section>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="detail-section"
      aria-labelledby={`section-${title.replace(/\s+/g, "-")}`}
    >
      <h3 id={`section-${title.replace(/\s+/g, "-")}`}>{title}</h3>
      {children}
    </section>
  );
}

function FileRefTable({
  title,
  items,
}: {
  title: string;
  items: SkillFileRef[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="detail-file-group">
      <h4>{title}</h4>
      <table className="detail-file-table">
        <thead>
          <tr>
            <th scope="col">Path</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={`${item.kind}-${item.relativePath}`}
              className={item.exists ? undefined : "detail-file-missing"}
            >
              <td>
                <SourceLink sourcePath={item.relativePath} />
              </td>
              <td>
                <span
                  className={`detail-file-badge ${item.exists ? "exists" : "missing"}`}
                >
                  {item.exists ? "exists" : "missing"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
            </div>
  );
}

function RelationshipList({
  label,
  items,
  direction,
}: {
  label: string;
  items: NeighborRelation[];
  direction: "incoming" | "outgoing";
}) {
  return (
    <div className="detail-rel-group">
      <h4>{label}</h4>
      {items.length === 0 ? (
        <p className="detail-muted">None</p>
      ) : (
        <ul className="detail-rel-list">
          {items.map(({ edge, node }) => (
            <li key={edge.id}>
              <span className="detail-rel-label">
                {neighborLabel({ edge, node }, direction)}
              </span>
              <span className="detail-rel-meta">
                {edge.type}
                {direction === "incoming" ? " · into this skill" : " · from this skill"}
                {edge.mappingIsApproximate ? " · approximate" : ""}
                {" · "}
                {(edge.confidence * 100).toFixed(0)}%
              </span>
              {node?.sourcePath && (
                <SourceLink
                  sourcePath={node.sourcePath}
                  className="detail-rel-path"
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
