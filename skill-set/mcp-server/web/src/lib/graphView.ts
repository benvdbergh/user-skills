import type { Edge, Node } from "@xyflow/react";
import type {
  SkillGraphEdge,
  SkillGraphNode,
  SkillGraphResult,
} from "../api/graph";

export function mergeGraphResults(
  previous: SkillGraphResult,
  next: SkillGraphResult,
): SkillGraphResult {
  const nodeById = new Map(previous.nodes.map((n) => [n.id, n]));
  for (const node of next.nodes) {
    nodeById.set(node.id, node);
  }
  const edgeById = new Map(previous.edges.map((e) => [e.id, e]));
  for (const edge of next.edges) {
    edgeById.set(edge.id, edge);
  }
  return {
    nodes: [...nodeById.values()],
    edges: [...edgeById.values()],
    highRiskRefactorSequences:
      next.highRiskRefactorSequences.length > 0
        ? next.highRiskRefactorSequences
        : previous.highRiskRefactorSequences,
    nextCursor: next.nextCursor,
    mapVersion: next.mapVersion ?? previous.mapVersion,
    mapUpdated: next.mapUpdated ?? previous.mapUpdated,
  };
}

export function buildAdjacency(
  edges: SkillGraphEdge[],
): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  const touch = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  for (const e of edges) {
    touch(e.from, e.to);
    touch(e.to, e.from);
  }
  return adj;
}

export function layoutGraphNodes(
  nodes: SkillGraphNode[],
  edges: SkillGraphEdge[],
  centerId?: string,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (nodes.length === 0) return positions;

  const adj = buildAdjacency(edges);
  const start =
    centerId && nodes.some((n) => n.id === centerId)
      ? centerId
      : nodes.find((n) => n.type === "skill")?.id ?? nodes[0].id;

  positions.set(start, { x: 0, y: 0 });
  const visited = new Set([start]);
  const queue: { id: string; depth: number }[] = [{ id: start, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const neighbors = [...(adj.get(id) ?? [])].filter((n) => !visited.has(n));
    neighbors.forEach((nId, i) => {
      visited.add(nId);
      const angle =
        (2 * Math.PI * i) / Math.max(neighbors.length, 1) +
        depth * 0.35;
      const radius = 160 * (depth + 1);
      positions.set(nId, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
      queue.push({ id: nId, depth: depth + 1 });
    });
  }

  let orphanCol = 0;
  for (const node of nodes) {
    if (!positions.has(node.id)) {
      positions.set(node.id, {
        x: -400 + (orphanCol % 5) * 100,
        y: 300 + Math.floor(orphanCol / 5) * 80,
      });
      orphanCol += 1;
    }
  }

  return positions;
}

export function toFlowGraph(
  nodes: SkillGraphNode[],
  edges: SkillGraphEdge[],
  centerId?: string,
): { nodes: Node[]; edges: Edge[] } {
  const positions = layoutGraphNodes(nodes, edges, centerId);

  const flowNodes: Node[] = nodes.map((node) => ({
    id: node.id,
    type: "skillGraph",
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    // Explicit size so React Flow can compute edge anchor points for custom nodes.
    width: 96,
    height: 56,
    data: {
      label: node.label,
      nodeType: node.type,
      health: node.health?.status,
    },
  }));

  const flowEdges: Edge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    data: {
      confidence: edge.confidence,
      approximate: edge.mappingIsApproximate,
    },
  }));

  return { nodes: flowNodes, edges: flowEdges };
}

export function collectRelationshipTypes(edges: SkillGraphEdge[]): string[] {
  return [...new Set(edges.map((e) => e.type))].sort();
}
