import type { SkillLabConfig } from "../config/loadConfig.js";
import { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";
import { SkillCatalogService } from "./SkillCatalogService.js";
import type {
  GraphFilter,
  GraphNeighborsQuery,
  GraphNodeType,
  HighRiskRefactorSequence,
  RelationshipMapEntry,
  RelationshipMapFile,
  SkillGraphEdge,
  SkillGraphNode,
  SkillGraphResult,
  SkillSummary,
} from "./types.js";

const DEFAULT_EDGE_LIMIT = 500;
const DEFAULT_PROJECT_ENV = "ai-vault";
const EXTERNAL_SCOPE = "external";

export function buildGraphNodeId(
  type: GraphNodeType,
  scope: string,
  name: string,
): string {
  return `${type}:${scope}:${name}`;
}

interface SkillScopeIndex {
  userLevel: Set<string>;
  projectLevel: Set<string>;
  externalEndpoints: Set<string>;
  catalogByName: Map<string, SkillSummary>;
}

export class SkillGraphService {
  private readonly mapRepo: RelationshipMapRepository;

  constructor(
    config: SkillLabConfig,
    private readonly catalog: SkillCatalogService,
    mapRepo?: RelationshipMapRepository,
  ) {
    this.mapRepo = mapRepo ?? new RelationshipMapRepository(config);
  }

  getGraph(filters: GraphFilter = {}): SkillGraphResult {
    return this.buildGraph(filters);
  }

  /** Incident edge counts per skill node id (`skill:{scope}:{name}`), unpaginated. */
  getSkillRelationshipCounts(): Record<string, number> {
    const map = this.mapRepo.read();
    const index = this.buildScopeIndex(map);
    const nodes = this.buildAllNodes(map, index);
    const edges = map.relationships.map((rel) => this.mapEdge(rel, index));
    const skillIds = new Set(
      nodes.filter((n) => n.type === "skill").map((n) => n.id),
    );
    const counts: Record<string, number> = {};
    for (const edge of edges) {
      if (skillIds.has(edge.from)) {
        counts[edge.from] = (counts[edge.from] ?? 0) + 1;
      }
      if (skillIds.has(edge.to)) {
        counts[edge.to] = (counts[edge.to] ?? 0) + 1;
      }
    }
    return counts;
  }

  neighbors(query: GraphNeighborsQuery): SkillGraphResult {
    const { nodeId, depth = 1, ...filters } = query;
    const cappedDepth = Math.min(Math.max(depth, 1), 3);
    const full = this.buildGraph({
      ...filters,
      limit: undefined,
      cursor: undefined,
    });

    const visited = new Set<string>([nodeId]);
    const edgeIds = new Set<string>();
    let frontier = new Set<string>([nodeId]);

    for (let hop = 0; hop < cappedDepth; hop++) {
      const nextFrontier = new Set<string>();
      for (const edge of full.edges) {
        if (!frontier.has(edge.from) && !frontier.has(edge.to)) continue;
        edgeIds.add(edge.id);
        const neighbor = frontier.has(edge.from) ? edge.to : edge.from;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          nextFrontier.add(neighbor);
        }
      }
      frontier = nextFrontier;
      if (frontier.size === 0) break;
    }

    const nodes = full.nodes.filter((n) => visited.has(n.id));
    const edges = full.edges.filter((e) => edgeIds.has(e.id));
    return {
      nodes,
      edges,
      highRiskRefactorSequences: full.highRiskRefactorSequences,
      mapVersion: full.mapVersion,
      mapUpdated: full.mapUpdated,
    };
  }

  private buildGraph(filters: GraphFilter): SkillGraphResult {
    const map = this.mapRepo.read();
    const index = this.buildScopeIndex(map);
    const nodes = this.buildAllNodes(map, index);
    const edges = map.relationships.map((rel) => this.mapEdge(rel, index));

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    let filteredEdges = edges.filter((e) => this.edgeMatchesFilters(e, nodeById, filters));
    let filteredNodes = this.nodesForEdges(nodes, filteredEdges, filters, nodeById);

    const limit = filters.limit ?? DEFAULT_EDGE_LIMIT;
    const start = filters.cursor ? Number.parseInt(filters.cursor, 10) : 0;
    const sliceStart = Number.isFinite(start) && start >= 0 ? start : 0;
    const page = filteredEdges.slice(sliceStart, sliceStart + limit);
    const nextCursor =
      sliceStart + limit < filteredEdges.length
        ? String(sliceStart + limit)
        : undefined;

    filteredNodes = this.nodesForEdges(filteredNodes, page, filters, nodeById);

    return {
      nodes: filteredNodes,
      edges: page,
      highRiskRefactorSequences: this.mapHighRiskSequences(map),
      nextCursor,
      mapVersion: map.version,
      mapUpdated: map.updated,
    };
  }

  private buildScopeIndex(map: RelationshipMapFile): SkillScopeIndex {
    const userLevel = new Set(map.skills.user_level);
    const projectLevel = new Set(map.skills.project_level_ai_vault ?? []);
    const externalEndpoints = new Set<string>();
    const catalogByName = new Map<string, SkillSummary>();

    for (const rel of map.relationships) {
      for (const name of [rel.from_skill, rel.to_skill]) {
        if (!userLevel.has(name) && !projectLevel.has(name)) {
          externalEndpoints.add(name);
        }
      }
    }

    for (const skill of this.catalog.listSkills()) {
      catalogByName.set(skill.name, skill);
    }

    return { userLevel, projectLevel, externalEndpoints, catalogByName };
  }

  private skillScope(name: string, index: SkillScopeIndex): string {
    if (index.userLevel.has(name)) return "user";
    if (index.projectLevel.has(name)) return "project";
    const catalog = index.catalogByName.get(name);
    if (catalog) return catalog.scope;
    return "unknown";
  }

  private resolveEndpointId(name: string, index: SkillScopeIndex): string {
    if (index.externalEndpoints.has(name)) {
      return buildGraphNodeId("mcp_tool", EXTERNAL_SCOPE, name);
    }
    const scope = this.skillScope(name, index);
    return buildGraphNodeId("skill", scope, name);
  }

  private mapEdge(
    rel: RelationshipMapEntry,
    index: SkillScopeIndex,
  ): SkillGraphEdge {
    return {
      id: rel.id,
      from: this.resolveEndpointId(rel.from_skill, index),
      to: this.resolveEndpointId(rel.to_skill, index),
      type: rel.relationship_type,
      confidence: rel.confidence_score,
      mappingIsApproximate: rel.mapping_is_approximate,
      evidence: rel.evidence
        ? {
            sourceFile: rel.evidence.source_file,
            quote: rel.evidence.quote,
          }
        : undefined,
      notes: rel.notes,
      candidateAgentGraphEdgeType: rel.candidate_agent_graph_edge_type,
    };
  }

  private buildSkillNode(
    name: string,
    scope: string,
    index: SkillScopeIndex,
  ): SkillGraphNode {
    const catalog = index.catalogByName.get(name);
    const environmentId =
      catalog?.environmentId ??
      (scope === "project" ? DEFAULT_PROJECT_ENV : "user");
    return {
      id: buildGraphNodeId("skill", scope, name),
      type: "skill",
      label: name,
      scope,
      environmentId,
      project: scope === "project" ? environmentId : undefined,
      sourcePath: catalog?.path,
      health: catalog?.health,
    };
  }

  private buildAllNodes(
    map: RelationshipMapFile,
    index: SkillScopeIndex,
  ): SkillGraphNode[] {
    const nodes = new Map<string, SkillGraphNode>();

    for (const name of index.userLevel) {
      nodes.set(
        buildGraphNodeId("skill", "user", name),
        this.buildSkillNode(name, "user", index),
      );
    }
    for (const name of index.projectLevel) {
      nodes.set(
        buildGraphNodeId("skill", "project", name),
        this.buildSkillNode(name, "project", index),
      );
    }
    for (const name of index.externalEndpoints) {
      nodes.set(buildGraphNodeId("mcp_tool", EXTERNAL_SCOPE, name), {
        id: buildGraphNodeId("mcp_tool", EXTERNAL_SCOPE, name),
        type: "mcp_tool",
        label: name,
        scope: EXTERNAL_SCOPE,
      });
    }

    for (const env of this.catalog.listEnvironments()) {
      nodes.set(buildGraphNodeId("environment", env.scope, env.id), {
        id: buildGraphNodeId("environment", env.scope, env.id),
        type: "environment",
        label: env.displayName ?? env.id,
        scope: env.scope,
        environmentId: env.id,
        sourcePath: env.path,
      });
    }

    this.addCatalogAuxiliaryNodes(index, nodes);
    return [...nodes.values()];
  }

  private addCatalogAuxiliaryNodes(
    index: SkillScopeIndex,
    nodes: Map<string, SkillGraphNode>,
  ): void {
    for (const skill of index.catalogByName.values()) {
      for (const workflow of skill.workflows) {
        const id = buildGraphNodeId(
          "workflow",
          skill.scope,
          `${skill.name}/${workflow}`,
        );
        if (!nodes.has(id)) {
          nodes.set(id, {
            id,
            type: "workflow",
            label: workflow,
            scope: skill.scope,
            environmentId: skill.environmentId,
            project:
              skill.scope === "project" ? skill.environmentId : undefined,
          });
        }
      }
    }

    for (const skill of index.catalogByName.values()) {
      const detail = this.catalog.getSkillDetail(
        skill.environmentId,
        skill.name,
      );
      if (!detail) continue;
      for (const ref of [
        ...detail.references,
        ...detail.scripts,
        ...detail.assets,
      ]) {
        const type =
          ref.kind === "script"
            ? "script"
            : ref.kind === "reference"
              ? "reference"
              : null;
        if (!type) continue;
        const id = buildGraphNodeId(
          type,
          skill.scope,
          `${skill.name}/${ref.relativePath}`,
        );
        if (!nodes.has(id)) {
          nodes.set(id, {
            id,
            type,
            label: ref.relativePath,
            scope: skill.scope,
            environmentId: skill.environmentId,
            sourcePath: ref.relativePath,
          });
        }
      }
    }
  }

  private edgeMatchesFilters(
    edge: SkillGraphEdge,
    nodeById: Map<string, SkillGraphNode>,
    filters: GraphFilter,
  ): boolean {
    if (
      filters.relationshipTypes?.length &&
      !filters.relationshipTypes.includes(edge.type)
    ) {
      return false;
    }
    if (filters.confidenceMin != null && edge.confidence < filters.confidenceMin) {
      return false;
    }
    if (filters.confidenceMax != null && edge.confidence > filters.confidenceMax) {
      return false;
    }
    if (filters.scope) {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      const scopes = [from?.scope, to?.scope].filter(Boolean);
      if (!scopes.includes(filters.scope)) return false;
    }
    if (filters.project) {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      const matches = (n?: SkillGraphNode) =>
        n?.environmentId === filters.project || n?.project === filters.project;
      if (!matches(from) && !matches(to)) return false;
    }
    if (filters.healthStatus) {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      const matches = (n?: SkillGraphNode) =>
        n?.type === "skill" && n.health?.status === filters.healthStatus;
      if (!matches(from) && !matches(to)) return false;
    }
    return true;
  }

  private nodeMatchesFilters(
    node: SkillGraphNode,
    filters: GraphFilter,
  ): boolean {
    if (filters.nodeTypes?.length && !filters.nodeTypes.includes(node.type)) {
      return false;
    }
    if (filters.scope && node.scope !== filters.scope) return false;
    if (
      filters.project &&
      node.environmentId !== filters.project &&
      node.project !== filters.project
    ) {
      return false;
    }
    if (
      filters.healthStatus &&
      (node.type !== "skill" || node.health?.status !== filters.healthStatus)
    ) {
      return false;
    }
    return true;
  }

  private nodesForEdges(
    nodes: SkillGraphNode[],
    edges: SkillGraphEdge[],
    filters: GraphFilter,
    nodeById: Map<string, SkillGraphNode>,
  ): SkillGraphNode[] {
    const ids = new Set<string>();
    for (const edge of edges) {
      ids.add(edge.from);
      ids.add(edge.to);
    }
    return nodes
      .filter((n) => ids.has(n.id))
      .filter((n) => this.nodeMatchesFilters(n, filters));
  }

  private mapHighRiskSequences(
    map: RelationshipMapFile,
  ): HighRiskRefactorSequence[] {
    return (map.high_risk_refactor_sequences ?? []).map((seq) => ({
      id: seq.id,
      sharedCapability: seq.shared_capability,
      whyHighRisk: seq.why_high_risk,
      downstreamSkills: seq.downstream_skills,
      suggestedSafeSequence: seq.suggested_safe_sequence,
    }));
  }
}
