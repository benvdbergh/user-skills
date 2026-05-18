import { apiFetch } from "./client";
import type { HealthStatus } from "./catalog";

export type GraphNodeType =
  | "skill"
  | "mcp_tool"
  | "environment"
  | "workflow"
  | "reference"
  | "script";

export interface SkillGraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  scope?: string;
  environmentId?: string;
  project?: string;
  sourcePath?: string;
  health?: {
    status: HealthStatus;
    findings: number;
  };
}

export interface SkillGraphEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  confidence: number;
  mappingIsApproximate: boolean;
  evidence?: { sourceFile?: string; quote?: string };
  notes?: string;
}

export interface HighRiskRefactorSequence {
  id: string;
  sharedCapability: string;
  whyHighRisk: string;
  downstreamSkills: string[];
  suggestedSafeSequence: string[];
}

export interface SkillGraphResult {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
  highRiskRefactorSequences: HighRiskRefactorSequence[];
  nextCursor?: string;
  mapVersion?: number;
  mapUpdated?: string;
}

export interface GraphQueryParams {
  nodeTypes?: GraphNodeType[];
  relationshipTypes?: string[];
  scope?: string;
  project?: string;
  confidenceMin?: number;
  confidenceMax?: number;
  healthStatus?: HealthStatus;
  limit?: number;
  cursor?: string;
}

export interface GraphNeighborsParams extends GraphQueryParams {
  nodeId: string;
  depth?: number;
}

export const GRAPH_NODE_TYPES: GraphNodeType[] = [
  "skill",
  "mcp_tool",
  "environment",
  "workflow",
  "reference",
  "script",
];

export const DEFAULT_GRAPH_LIMIT = 500;
export const HIGH_EDGE_WARNING_THRESHOLD = 500;

function appendGraphParams(
  params: URLSearchParams,
  query: GraphQueryParams,
): void {
  if (query.nodeTypes?.length) {
    params.set("nodeTypes", query.nodeTypes.join(","));
  }
  if (query.relationshipTypes?.length) {
    params.set("relationshipTypes", query.relationshipTypes.join(","));
  }
  if (query.scope) params.set("scope", query.scope);
  if (query.project) params.set("project", query.project);
  if (query.confidenceMin !== undefined) {
    params.set("confidenceMin", String(query.confidenceMin));
  }
  if (query.confidenceMax !== undefined) {
    params.set("confidenceMax", String(query.confidenceMax));
  }
  if (query.healthStatus) params.set("healthStatus", query.healthStatus);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.cursor) params.set("cursor", query.cursor);
}

export async function fetchGraph(
  query: GraphQueryParams = {},
): Promise<SkillGraphResult> {
  const params = new URLSearchParams();
  appendGraphParams(params, {
    limit: DEFAULT_GRAPH_LIMIT,
    ...query,
  });
  const qs = params.toString();
  const body = await apiFetch<{ graph: SkillGraphResult }>(
    `/api/graph${qs ? `?${qs}` : ""}`,
  );
  return body.graph;
}

export async function fetchGraphNeighbors(
  query: GraphNeighborsParams,
): Promise<SkillGraphResult> {
  const params = new URLSearchParams({
    nodeId: query.nodeId,
    depth: String(query.depth ?? 1),
  });
  appendGraphParams(params, query);
  const body = await apiFetch<{ graph: SkillGraphResult }>(
    `/api/graph/neighbors?${params}`,
  );
  return body.graph;
}
