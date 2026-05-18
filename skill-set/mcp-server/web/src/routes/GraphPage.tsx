import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_GRAPH_LIMIT,
  fetchGraph,
  fetchGraphNeighbors,
  GRAPH_NODE_TYPES,
  HIGH_EDGE_WARNING_THRESHOLD,
  type GraphNodeType,
  type GraphQueryParams,
  type HighRiskRefactorSequence,
  type SkillGraphResult,
} from "../api/graph";
import { ApiError } from "../api/client";
import { SkillGraphCanvas } from "../components/SkillGraphCanvas";
import { SourceLink } from "../components/SourceLink";
import {
  collectRelationshipTypes,
  mergeGraphResults,
  toFlowGraph,
} from "../lib/graphView";
import type { HealthStatus } from "../api/catalog";
import "./GraphPage.css";

const EMPTY_RESULT: SkillGraphResult = {
  nodes: [],
  edges: [],
  highRiskRefactorSequences: [],
};

export function GraphPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const nodeId = searchParams.get("nodeId") ?? "";
  const depth = Math.min(
    3,
    Math.max(1, Number(searchParams.get("depth") ?? "1") || 1),
  );
  const isLocal = Boolean(nodeId);

  const [graph, setGraph] = useState<SkillGraphResult>(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [knownRelTypes, setKnownRelTypes] = useState<string[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const selectedNodeTypes = parseListParam(
    searchParams.get("nodeTypes"),
  ) as GraphNodeType[];
  const selectedRelTypes = parseListParam(
    searchParams.get("relationshipTypes"),
  );
  const confidenceMin = searchParams.get("confidenceMin") ?? "";
  const confidenceMax = searchParams.get("confidenceMax") ?? "";
  const scope = searchParams.get("scope") ?? "";
  const project = searchParams.get("project") ?? "";
  const healthStatus = (searchParams.get("healthStatus") ?? "") as
    | HealthStatus
    | "";
  const limit = Number(searchParams.get("limit") ?? DEFAULT_GRAPH_LIMIT);
  const cursor = searchParams.get("cursor") ?? "";

  const baseQuery = useMemo((): GraphQueryParams => {
    const q: GraphQueryParams = { limit, cursor: cursor || undefined };
    if (selectedNodeTypes.length) q.nodeTypes = selectedNodeTypes;
    if (selectedRelTypes.length) q.relationshipTypes = selectedRelTypes;
    if (confidenceMin) q.confidenceMin = Number(confidenceMin);
    if (confidenceMax) q.confidenceMax = Number(confidenceMax);
    if (scope) q.scope = scope;
    if (project) q.project = project;
    if (healthStatus) q.healthStatus = healthStatus;
    return q;
  }, [
    selectedNodeTypes,
    selectedRelTypes,
    confidenceMin,
    confidenceMax,
    scope,
    project,
    healthStatus,
    limit,
    cursor,
  ]);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    const appendPage = Boolean(cursor) && !isLocal;
    try {
      const result = isLocal
        ? await fetchGraphNeighbors({ ...baseQuery, nodeId, depth })
        : await fetchGraph(baseQuery);
      setGraph((prev) =>
        appendPage ? mergeGraphResults(prev, result) : result,
      );
      setKnownRelTypes((prev) => {
        const merged = new Set([
          ...prev,
          ...collectRelationshipTypes(result.edges),
        ]);
        return [...merged].sort();
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.problem.detail ?? err.problem.title)
          : err instanceof Error
            ? err.message
            : "Failed to load graph";
      setError(message);
      setGraph(EMPTY_RESULT);
    } finally {
      setLoading(false);
    }
  }, [baseQuery, isLocal, nodeId, depth, cursor]);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  const flow = useMemo(
    () => toFlowGraph(graph.nodes, graph.edges, nodeId || undefined),
    [graph, nodeId],
  );

  const focusedNode = useMemo(
    () => graph.nodes.find((n) => n.id === focusedNodeId),
    [graph.nodes, focusedNodeId],
  );

  const focusedEdges = useMemo(() => {
    if (!focusedNodeId) return [];
    return graph.edges.filter(
      (e) => e.from === focusedNodeId || e.to === focusedNodeId,
    );
  }, [graph.edges, focusedNodeId]);

  const showEdgeWarning =
    graph.edges.length >= HIGH_EDGE_WARNING_THRESHOLD ||
    (graph.nextCursor && graph.edges.length > 0);

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === "") next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );
  };

  const toggleNodeType = (type: GraphNodeType) => {
    const next = selectedNodeTypes.includes(type)
      ? selectedNodeTypes.filter((t) => t !== type)
      : [...selectedNodeTypes, type];
    updateParams({
      nodeTypes: next.length ? next.join(",") : null,
      cursor: null,
    });
  };

  const toggleRelType = (type: string) => {
    const next = selectedRelTypes.includes(type)
      ? selectedRelTypes.filter((t) => t !== type)
      : [...selectedRelTypes, type];
    updateParams({
      relationshipTypes: next.length ? next.join(",") : null,
      cursor: null,
    });
  };

  const enterLocalMode = (id: string) => {
    updateParams({ nodeId: id, depth: String(depth), cursor: null });
  };

  const exitLocalMode = () => {
    updateParams({ nodeId: null, depth: null, cursor: null });
  };

  return (
    <section className="graph-page" aria-labelledby="graph-heading">
      <header className="graph-header">
        <div>
          <h2 id="graph-heading">Graph explorer</h2>
          <p className="graph-subtitle">
            {isLocal
              ? `Local neighborhood · depth ${depth}`
              : "Global graph (filtered)"}
          </p>
        </div>
        <p className="graph-stats" aria-live="polite">
          {loading
            ? "Loading…"
            : `${graph.nodes.length} nodes · ${graph.edges.length} edges`}
        </p>
      </header>

      {error && (
        <div className="graph-error" role="alert">
          {error}
        </div>
      )}

      {showEdgeWarning && !loading && (
        <div className="graph-warning" role="status">
          Large result set ({graph.edges.length} edges
          {graph.nextCursor ? ", more available" : ""}). Narrow filters or use
          local mode (depth 1–3) for better performance (NFR-004).
        </div>
      )}

      <aside className="graph-toolbar" aria-label="Graph filters">
        <div className="graph-mode">
          <span className="graph-mode-label">Mode</span>
          {isLocal ? (
            <>
              <code className="graph-center-id">{nodeId}</code>
              <label className="graph-depth">
                Depth
                <select
                  value={depth}
                  onChange={(e) =>
                    updateParams({ depth: e.target.value, cursor: null })
                  }
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </label>
              <button type="button" onClick={exitLocalMode}>
                Global graph
              </button>
            </>
          ) : (
            <label className="graph-local-input">
              Center nodeId
              <input
                type="text"
                placeholder="skill:user:demo-skill"
                defaultValue={nodeId}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = (e.target as HTMLInputElement).value.trim();
                    if (v) enterLocalMode(v);
                  }
                }}
              />
            </label>
          )}
        </div>

        <fieldset className="graph-filter-group">
          <legend>Node types</legend>
          <div className="graph-chips">
            {GRAPH_NODE_TYPES.map((type) => (
              <label key={type} className="graph-chip">
                <input
                  type="checkbox"
                  checked={selectedNodeTypes.includes(type)}
                  onChange={() => toggleNodeType(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="graph-filter-group">
          <legend>Relationship types</legend>
          <div className="graph-chips">
            {knownRelTypes.length === 0 && (
              <span className="graph-muted">Load graph to discover types</span>
            )}
            {knownRelTypes.map((type) => (
              <label key={type} className="graph-chip">
                <input
                  type="checkbox"
                  checked={selectedRelTypes.includes(type)}
                  onChange={() => toggleRelType(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="graph-scope">
          Scope
          <input
            type="text"
            value={scope}
            placeholder="user, project…"
            onChange={(e) =>
              updateParams({ scope: e.target.value || null, cursor: null })
            }
          />
        </label>

        <label className="graph-project">
          Project
          <input
            type="text"
            value={project}
            placeholder="environment / project id"
            onChange={(e) =>
              updateParams({ project: e.target.value || null, cursor: null })
            }
          />
        </label>

        <label className="graph-health">
          Health
          <select
            value={healthStatus}
            onChange={(e) =>
              updateParams({
                healthStatus: e.target.value || null,
                cursor: null,
              })
            }
          >
            <option value="">All</option>
            <option value="ok">OK</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </label>

        <label className="graph-confidence">
          Min confidence
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={confidenceMin}
            onChange={(e) =>
              updateParams({
                confidenceMin: e.target.value || null,
                cursor: null,
              })
            }
          />
        </label>

        <label className="graph-confidence">
          Max confidence
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={confidenceMax}
            onChange={(e) =>
              updateParams({
                confidenceMax: e.target.value || null,
                cursor: null,
              })
            }
          />
        </label>

        {!isLocal && (
          <label className="graph-limit">
            Edge limit
            <input
              type="number"
              min={50}
              max={2000}
              step={50}
              value={limit}
              onChange={(e) =>
                updateParams({ limit: e.target.value, cursor: null })
              }
            />
          </label>
        )}

        {graph.nextCursor && (
          <button
            type="button"
            className="graph-load-more"
            disabled={loading}
            onClick={() => updateParams({ cursor: graph.nextCursor ?? null })}
          >
            Load more edges
          </button>
        )}
      </aside>

      <div className="graph-main">
        <div className="graph-canvas-panel">
          {focusedNode && (
            <div className="graph-focus-panel">
              {focusedNode.sourcePath && (
                <p className="graph-node-source">
                  <SourceLink
                    sourcePath={focusedNode.sourcePath}
                    showFullPath
                  />
                </p>
              )}
              {focusedEdges.length > 0 && (
                <ul className="graph-edge-evidence">
                  {focusedEdges.map((edge) => (
                    <li key={edge.id}>
                      <span className="graph-edge-label">
                        {edge.type} · {(edge.confidence * 100).toFixed(0)}%
                        {edge.mappingIsApproximate ? " ~" : ""}
                      </span>
                      {edge.evidence?.sourceFile && (
                        <SourceLink
                          sourcePath={edge.evidence.sourceFile}
                          showFullPath
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {loading && !flow.nodes.length ? (
            <p className="graph-muted graph-canvas-empty">Loading graph…</p>
          ) : flow.nodes.length === 0 ? (
            <p className="graph-muted graph-canvas-empty">No nodes to display.</p>
          ) : (
            <SkillGraphCanvas
              nodes={flow.nodes}
              edges={flow.edges}
              onNodeClick={(id) => setFocusedNodeId(id)}
              onNodeDoubleClick={(id) => {
                setFocusedNodeId(id);
                enterLocalMode(id);
              }}
            />
          )}
        </div>

        <HighRiskPanel sequences={graph.highRiskRefactorSequences} />
      </div>
    </section>
  );
}

function HighRiskPanel({
  sequences,
}: {
  sequences: HighRiskRefactorSequence[];
}) {
  return (
    <aside className="graph-risk-panel" aria-labelledby="risk-panel-heading">
      <h3 id="risk-panel-heading">High-risk refactor sequences</h3>
      {sequences.length === 0 ? (
        <p className="graph-muted">None in current map.</p>
      ) : (
        <ul className="graph-risk-list">
          {sequences.map((seq) => (
            <li key={seq.id}>
              <strong>{seq.sharedCapability}</strong>
              <p>{seq.whyHighRisk}</p>
              {seq.downstreamSkills.length > 0 && (
                <p className="graph-risk-meta">
                  Downstream: {seq.downstreamSkills.join(", ")}
                </p>
              )}
              {seq.suggestedSafeSequence.length > 0 && (
                <ol>
                  {seq.suggestedSafeSequence.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
