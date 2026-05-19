import type { SkillGraphService } from "../domain/SkillGraphService.js";
import type { SkillHealthService } from "../domain/SkillHealthService.js";
import {
  CatalogHealthReportSchema,
  GraphFilterSchema,
  GraphNeighborsQuerySchema,
  SkillGraphResultSchema,
  type GraphFilter,
  type GraphNeighborsQuery,
  type SkillGraphResult,
} from "../domain/types.js";

export function buildSkillGraphPayload(
  graph: SkillGraphService,
  filters: GraphFilter = {},
): SkillGraphResult {
  return SkillGraphResultSchema.parse(graph.getGraph(GraphFilterSchema.parse(filters)));
}

export function buildGraphNeighborsPayload(
  graph: SkillGraphService,
  query: GraphNeighborsQuery,
): SkillGraphResult {
  return SkillGraphResultSchema.parse(
    graph.neighbors(GraphNeighborsQuerySchema.parse(query)),
  );
}

export function buildCatalogHealthPayload(health: SkillHealthService) {
  return CatalogHealthReportSchema.parse(health.scan());
}
