import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
  type SkillGraphEdge,
  type SkillGraphNode,
  type SkillGraphResult,
} from "../api/graph";
import { ApiError } from "../api/client";
import { SkillGraphCanvas } from "../components/SkillGraphCanvas";
import { SourceLink } from "../components/SourceLink";
import {
  HealthPill,
  MonoPath,
  PageHeader,
} from "../components/ShellPrimitives";
import { ShellIcon } from "../components/ShellIcon";
import {
  collectRelationshipTypes,
  mergeGraphResults,
  toFlowGraph,
} from "../lib/graphView";

const EMPTY_RESULT: SkillGraphResult = {
  nodes: [],
  edges: [],
  highRiskRefactorSequences: [],
};

const NODE_TYPE_LABEL: Record<GraphNodeType, string> = {
  skill: "Skill",
  mcp_tool: "MCP tool",
  environment: "Environment",
  workflow: "Workflow",
  reference: "Reference",
  script: "Script",
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [centerInput, setCenterInput] = useState(nodeId);

  const nodeTypesParam = searchParams.get("nodeTypes") ?? "";
  const relationshipTypesParam = searchParams.get("relationshipTypes") ?? "";
  const selectedNodeTypes = useMemo(
    () => parseListParam(nodeTypesParam || null) as GraphNodeType[],
    [nodeTypesParam],
  );
  const selectedRelTypes = useMemo(
    () => parseListParam(relationshipTypesParam || null),
    [relationshipTypesParam],
  );
  const confidenceMin = searchParams.get("confidenceMin") ?? "";
  const confidenceMax = searchParams.get("confidenceMax") ?? "";
  const scope = searchParams.get("scope") ?? "";
  const project = searchParams.get("project") ?? "";
  const healthStatus = searchParams.get("healthStatus") ?? "";
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
    if (healthStatus === "ok" || healthStatus === "warning" || healthStatus === "error") {
      q.healthStatus = healthStatus;
    }
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
    const appendPage = Boolean(cursor) && !isLocal;
    setLoading((prev) => (appendPage ? prev : true));
    setError(null);
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

  useEffect(() => {
    setCenterInput(nodeId);
    if (nodeId) setSelectedNodeId(nodeId);
  }, [nodeId]);

  const flow = useMemo(
    () => toFlowGraph(graph.nodes, graph.edges, nodeId || undefined),
    [graph, nodeId],
  );

  const nodeById = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes],
  );

  const selectedNode = selectedNodeId
    ? nodeById.get(selectedNodeId)
    : undefined;

  const selectedEdges = useMemo(() => {
    if (!selectedNodeId) return [];
    return graph.edges.filter(
      (e) => e.from === selectedNodeId || e.to === selectedNodeId,
    );
  }, [graph.edges, selectedNodeId]);

  const showEdgeWarning =
    graph.edges.length >= HIGH_EDGE_WARNING_THRESHOLD ||
    (graph.nextCursor && graph.edges.length > 0);

  const minConfValue = confidenceMin ? Number(confidenceMin) : 0;

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
    <div className="sl-graph">
      <PageHeader
        eyebrow="Topology"
        title="Graph explorer"
        subtitle={
          isLocal
            ? `Local neighborhood · depth ${depth}`
            : loading
              ? "Loading…"
              : `${graph.nodes.length} nodes · ${graph.edges.length} edges`
        }
        right={
          isLocal ? (
            <div className="sl-page-header-actions">
              <button
                type="button"
                className="sl-btn sl-btn-ghost"
                onClick={exitLocalMode}
              >
                <ShellIcon name="close" size={14} />
                Exit local mode
              </button>
            </div>
          ) : undefined
        }
      />

      {error && (
        <div className="sl-graph-banner sl-graph-banner-error" role="alert">
          {error}
        </div>
      )}

      {showEdgeWarning && !loading && (
        <div className="sl-graph-banner" role="status">
          Large result set ({graph.edges.length} edges
          {graph.nextCursor ? ", more available" : ""}). Narrow filters or use
          local mode (depth 1–3) for better performance.
        </div>
      )}

      <div className="sl-graph-layout">
        <aside className="sl-graph-filters" aria-label="Graph filters">
          {!isLocal && (
            <FilterBlock title="Center node (local mode)">
              <input
                type="text"
                className="sl-graph-filter-input"
                placeholder="skill:user:demo-skill"
                value={centerInput}
                onChange={(e) => setCenterInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = centerInput.trim();
                    if (v) enterLocalMode(v);
                  }
                }}
              />
            </FilterBlock>
          )}

          <FilterBlock title="Node types">
            <div className="sl-filter-stack">
              {GRAPH_NODE_TYPES.map((type) => (
                <label key={type} className="sl-check">
                  <input
                    type="checkbox"
                    checked={selectedNodeTypes.includes(type)}
                    onChange={() => toggleNodeType(type)}
                  />
                  <span className={`sl-node-swatch sl-node-${type}`} />
                  <span>{NODE_TYPE_LABEL[type]}</span>
                </label>
              ))}
            </div>
          </FilterBlock>

          <FilterBlock title="Relationships">
            <div className="sl-filter-stack">
              {knownRelTypes.length === 0 && (
                <span className="sl-muted">Load graph to discover types</span>
              )}
              {knownRelTypes.map((type) => (
                <label key={type} className="sl-check">
                  <input
                    type="checkbox"
                    checked={selectedRelTypes.includes(type)}
                    onChange={() => toggleRelType(type)}
                  />
                  <code>{type}</code>
                </label>
              ))}
            </div>
          </FilterBlock>

          <FilterBlock title="Min confidence">
            <div className="sl-slider">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={minConfValue}
                onChange={(e) =>
                  updateParams({
                    confidenceMin: e.target.value === "0" ? null : e.target.value,
                    cursor: null,
                  })
                }
              />
              <output>{(minConfValue * 100).toFixed(0)}%</output>
            </div>
          </FilterBlock>

          <FilterBlock title="Max confidence">
            <input
              type="number"
              className="sl-graph-filter-input"
              min={0}
              max={1}
              step={0.1}
              value={confidenceMax}
              placeholder="1.0"
              onChange={(e) =>
                updateParams({
                  confidenceMax: e.target.value || null,
                  cursor: null,
                })
              }
            />
          </FilterBlock>

          {isLocal && (
            <FilterBlock title="Depth">
              <div className="sl-segmented" role="group" aria-label="Neighborhood depth">
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={depth === d ? "is-active" : ""}
                    onClick={() =>
                      updateParams({ depth: String(d), cursor: null })
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </FilterBlock>
          )}

          <FilterBlock title="Scope">
            <input
              type="text"
              className="sl-graph-filter-input"
              value={scope}
              placeholder="user, project…"
              onChange={(e) =>
                updateParams({ scope: e.target.value || null, cursor: null })
              }
            />
          </FilterBlock>

          <FilterBlock title="Project">
            <input
              type="text"
              className="sl-graph-filter-input"
              value={project}
              placeholder="environment / project id"
              onChange={(e) =>
                updateParams({ project: e.target.value || null, cursor: null })
              }
            />
          </FilterBlock>

          <FilterBlock title="Health">
            <select
              className="sl-graph-filter-input"
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
          </FilterBlock>

          {!isLocal && (
            <FilterBlock title="Edge limit">
              <input
                type="number"
                className="sl-graph-filter-input"
                min={50}
                max={2000}
                step={50}
                value={limit}
                onChange={(e) =>
                  updateParams({ limit: e.target.value, cursor: null })
                }
              />
            </FilterBlock>
          )}

          {graph.nextCursor && (
            <button
              type="button"
              className="sl-btn sl-btn-ghost"
              disabled={loading}
              onClick={() => updateParams({ cursor: graph.nextCursor ?? null })}
            >
              Load more edges
            </button>
          )}
        </aside>

        <div className="sl-graph-canvas-wrap">
          {loading && !flow.nodes.length ? (
            <p className="sl-graph-canvas-empty">Loading graph…</p>
          ) : flow.nodes.length === 0 ? (
            <p className="sl-graph-canvas-empty">No nodes to display.</p>
          ) : (
            <SkillGraphCanvas
              nodes={flow.nodes}
              edges={flow.edges}
              layoutKey={`${graph.nodes.length}:${graph.edges.length}:${nodeId}`}
              selectedNodeId={selectedNodeId}
              focusedNodeId={nodeId || null}
              onNodeClick={(id) => setSelectedNodeId(id)}
              onNodeDoubleClick={(id) => {
                setSelectedNodeId(id);
                enterLocalMode(id);
              }}
            />
          )}
          <div className="sl-graph-legend" aria-hidden>
            <span>
              <span className="sl-node-swatch sl-node-skill" /> Skill
            </span>
            <span>
              <span className="sl-node-swatch sl-node-mcp_tool" /> Tool
            </span>
            <span>
              <span className="sl-node-swatch sl-node-environment" /> Env
            </span>
            <span>
              <span className="sl-node-swatch sl-node-workflow" /> Workflow
            </span>
            <span className="sl-graph-legend-hint">
              Click a node to inspect · Double-click to focus
            </span>
          </div>
        </div>

        <aside className="sl-graph-side">
          {selectedNode ? (
            <NodeInspector
              node={selectedNode}
              edges={selectedEdges}
              nodeById={nodeById}
              onFocus={() => enterLocalMode(selectedNode.id)}
            />
          ) : (
            <HighRiskPanel sequences={graph.highRiskRefactorSequences} />
          )}
        </aside>
      </div>
    </div>
  );
}

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="sl-filter-block">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function NodeInspector({
  node,
  edges,
  nodeById,
  onFocus,
}: {
  node: SkillGraphNode;
  edges: SkillGraphEdge[];
  nodeById: Map<string, SkillGraphNode>;
  onFocus: () => void;
}) {
  return (
    <div className="sl-inspector">
      <header>
        <p className="sl-inspector-eyebrow">{NODE_TYPE_LABEL[node.type]}</p>
        <h3>{node.label}</h3>
        {node.health && (
          <HealthPill status={node.health.status} findings={node.health.findings} />
        )}
      </header>
      <code className="sl-inspector-id">{node.id}</code>
      {node.sourcePath && (
        <div className="sl-inspector-path">
          <MonoPath path={node.sourcePath} maxLen={48} />
          <SourceLink sourcePath={node.sourcePath} />
        </div>
      )}
      <button
        type="button"
        className="sl-btn sl-btn-primary sl-btn-block"
        onClick={onFocus}
      >
        Focus neighborhood
      </button>
      <h4>Edges ({edges.length})</h4>
      <ul className="sl-inspector-edges">
        {edges.map((edge) => {
          const isOut = edge.from === node.id;
          const other = nodeById.get(isOut ? edge.to : edge.from);
          return (
            <li key={edge.id}>
              <span className="sl-rel-arrow">{isOut ? "→" : "←"}</span>
              <span className="sl-inspector-other">
                {other?.label ?? (isOut ? edge.to : edge.from)}
              </span>
              <span className="sl-rel-type">{edge.type}</span>
              <span className="sl-rel-conf-mini">
                {(edge.confidence * 100).toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HighRiskPanel({
  sequences,
}: {
  sequences: HighRiskRefactorSequence[];
}) {
  return (
    <div className="sl-risk">
      <header>
        <p className="sl-inspector-eyebrow">Refactor risk</p>
        <h3>High-risk sequences</h3>
        <p className="sl-muted">
          Edges with broad downstream blast radius. Plan migrations carefully.
        </p>
      </header>
      {sequences.length === 0 ? (
        <p className="sl-muted">None in current map.</p>
      ) : (
        sequences.map((seq) => (
          <article key={seq.id} className="sl-risk-card">
            <h4>{seq.sharedCapability}</h4>
            <p>{seq.whyHighRisk}</p>
            {seq.downstreamSkills.length > 0 && (
              <div className="sl-risk-downstream">
                {seq.downstreamSkills.map((skill) => (
                  <code key={skill}>{skill}</code>
                ))}
              </div>
            )}
            {seq.suggestedSafeSequence.length > 0 && (
              <details>
                <summary>Suggested safe sequence</summary>
                <ol>
                  {seq.suggestedSafeSequence.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>
            )}
          </article>
        ))
      )}
    </div>
  );
}

function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
