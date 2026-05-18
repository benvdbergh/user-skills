import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface SkillGraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

export function SkillGraphCanvas({
  nodes,
  edges,
  onNodeClick,
  onNodeDoubleClick,
}: SkillGraphCanvasProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={2}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      onNodeClick={(_, node) => onNodeClick?.(node.id)}
      onNodeDoubleClick={(_, node) => onNodeDoubleClick?.(node.id)}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={16} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
