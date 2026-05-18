import type {
  SkillGraphEdge,
  SkillGraphNode,
  SkillGraphResult,
} from "../api/graph";

export interface NeighborRelation {
  edge: SkillGraphEdge;
  node: SkillGraphNode | undefined;
}

export function splitNeighborRelations(
  centerNodeId: string,
  graph: SkillGraphResult,
): { incoming: NeighborRelation[]; outgoing: NeighborRelation[] } {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const incoming: NeighborRelation[] = [];
  const outgoing: NeighborRelation[] = [];

  for (const edge of graph.edges) {
    if (edge.to === centerNodeId) {
      incoming.push({ edge, node: nodeById.get(edge.from) });
    }
    if (edge.from === centerNodeId) {
      outgoing.push({ edge, node: nodeById.get(edge.to) });
    }
  }

  incoming.sort((a, b) =>
    (a.node?.label ?? a.edge.from).localeCompare(b.node?.label ?? b.edge.from),
  );
  outgoing.sort((a, b) =>
    (a.node?.label ?? a.edge.to).localeCompare(b.node?.label ?? b.edge.to),
  );

  return { incoming, outgoing };
}

export function neighborLabel(
  relation: NeighborRelation,
  direction: "incoming" | "outgoing",
): string {
  if (relation.node?.label) return relation.node.label;
  return direction === "outgoing" ? relation.edge.to : relation.edge.from;
}
