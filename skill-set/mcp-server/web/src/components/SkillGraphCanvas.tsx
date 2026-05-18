import { useEffect, useMemo } from "react";
import {
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useUpdateNodeInternals,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export interface SkillGraphNodeData {
  label: string;
  nodeType: string;
  health?: string;
  dimmed?: boolean;
  focused?: boolean;
  [key: string]: unknown;
}

interface SkillGraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  /** Refit viewport when graph data or local-mode center changes — not on selection. */
  layoutKey?: string;
  selectedNodeId?: string | null;
  focusedNodeId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

function SkillGraphNode({ data, selected }: NodeProps<Node<SkillGraphNodeData>>) {
  const nodeType = data.nodeType ?? "skill";
  const health = data.health;
  const showHealthDot =
    health && health !== "ok" && (health === "warning" || health === "error");

  return (
    <div
      className={[
        "sl-graph-flow-node",
        `sl-graph-node-${nodeType}`,
        selected ? "is-selected" : "",
        data.focused ? "is-focused" : "",
        data.dimmed ? "is-dim" : "",
        health ? `health-${health}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="sl-graph-handle"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="sl-graph-handle"
        isConnectable={false}
      />
      <span className="sl-graph-node-halo" aria-hidden />
      <span className="sl-graph-node-circle" aria-hidden>
        {showHealthDot && (
          <span
            className={`sl-graph-node-dot health-${health}`}
            aria-hidden
          />
        )}
      </span>
      <span className="sl-graph-node-label">{data.label}</span>
    </div>
  );
}

interface SkillGraphEdgeData {
  confidence?: number;
  approximate?: boolean;
}

const nodeTypes = { skillGraph: SkillGraphNode };

function edgeStrokeOpacity(confidence: number, dim: boolean, active: boolean): number {
  if (dim && !active) return 0.15;
  return 0.35 + confidence * 0.5;
}

function SkillGraphCanvasInner({
  nodes,
  edges,
  layoutKey,
  selectedNodeId,
  focusedNodeId,
  onNodeClick,
  onNodeDoubleClick,
}: SkillGraphCanvasProps) {
  const { fitView } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (!nodes.length) return;
    const id = requestAnimationFrame(() => {
      void fitView({ padding: 0.2, duration: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [layoutKey, nodes.length, fitView]);

  useEffect(() => {
    for (const node of nodes) {
      updateNodeInternals(node.id);
    }
  }, [layoutKey, nodes, updateNodeInternals]);

  const neighborIds = useMemo(() => {
    if (!selectedNodeId) return null;
    const ids = new Set<string>([selectedNodeId]);
    for (const edge of edges) {
      if (edge.source === selectedNodeId) ids.add(edge.target);
      if (edge.target === selectedNodeId) ids.add(edge.source);
    }
    return ids;
  }, [selectedNodeId, edges]);

  const styledNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        type: "skillGraph",
        data: {
          ...node.data,
          dimmed: Boolean(
            selectedNodeId &&
              selectedNodeId !== node.id &&
              !neighborIds?.has(node.id),
          ),
          focused: focusedNodeId === node.id,
        },
      })),
    [nodes, selectedNodeId, neighborIds, focusedNodeId],
  );

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => {
        const active = Boolean(
          selectedNodeId &&
            (edge.source === selectedNodeId || edge.target === selectedNodeId),
        );
        const dim = Boolean(selectedNodeId && !active);
        const edgeData = edge.data as SkillGraphEdgeData | undefined;
        const confidence = edgeData?.confidence ?? 0.5;
        const approximate = Boolean(edgeData?.approximate);
        const className = [
          active ? "is-active" : "",
          dim ? "is-dim" : "",
          approximate ? "is-approx" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return {
          ...edge,
          className: className || undefined,
          style: {
            stroke: active ? "var(--accent)" : "var(--border-2)",
            strokeWidth: active ? 1.6 : 1,
            opacity: edgeStrokeOpacity(confidence, dim, active),
            strokeDasharray: approximate ? "4 4" : undefined,
          },
        };
      }),
    [edges, selectedNodeId],
  );

  return (
    <div className="sl-graph-canvas">
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        onNodeClick={(_, node) => onNodeClick?.(node.id)}
        onNodeDoubleClick={(_, node) => onNodeDoubleClick?.(node.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function SkillGraphCanvas(props: SkillGraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <SkillGraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
