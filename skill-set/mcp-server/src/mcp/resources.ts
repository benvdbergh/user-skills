import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { resolvePathInfo } from "../config/pathModel.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import type { SkillGraphService } from "../domain/SkillGraphService.js";
import type { SkillHealthService } from "../domain/SkillHealthService.js";
import {
  CatalogHealthReportSchema,
  EnvironmentSchema,
  RelationshipMapFileSchema,
  SkillGraphResultSchema,
} from "../domain/types.js";
import type { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";
import type { SkillIndexRepository } from "../repositories/SkillIndexRepository.js";

export const SKILL_LAB_RESOURCE_URIS = [
  "skill-lab://environments",
  "skill-lab://skill-index/{environmentId}",
  "skill-lab://relationships",
  "skill-lab://graph",
  "skill-lab://health/latest",
] as const;

export interface CatalogResourcesDeps {
  catalog: SkillCatalogService;
  graph: SkillGraphService;
  health: SkillHealthService;
  relationshipMap: RelationshipMapRepository;
  indexRepo: SkillIndexRepository;
}

function jsonResource(uri: string, body: unknown): ReadResourceResult {
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(body, null, 2),
      },
    ],
  };
}

export function registerCatalogResources(
  server: McpServer,
  deps: CatalogResourcesDeps,
): void {
  const { catalog, graph, health, relationshipMap, indexRepo } = deps;

  server.registerResource(
    "environments",
    "skill-lab://environments",
    {
      description: "Configured skill environments from the environment map.",
      mimeType: "application/json",
    },
    async (uri) => {
      const environments = z
        .array(EnvironmentSchema)
        .parse(catalog.listEnvironments());
      return jsonResource(uri.href, { environments });
    },
  );

  const skillIndexTemplate = new ResourceTemplate(
    "skill-lab://skill-index/{environmentId}",
    {
      list: async () => ({
        resources: catalog.listEnvironments().map((env) => ({
          uri: `skill-lab://skill-index/${env.id}`,
          name: `skill-index-${env.id}`,
          mimeType: "application/json",
        })),
      }),
      complete: {
        environmentId: async () =>
          catalog.listEnvironments().map((env) => env.id),
      },
    },
  );

  server.registerResource(
    "skill-index",
    skillIndexTemplate,
    {
      description: "Raw skill-index.json for one environment.",
      mimeType: "application/json",
    },
    async (uri, { environmentId }) => {
      const env = catalog
        .listEnvironments()
        .find((e) => e.id === environmentId);
      if (!env) {
        return jsonResource(uri.href, {
          error: "not_found",
          message: `Environment not found: ${environmentId}`,
        });
      }
      const indexInfo = resolvePathInfo(env.skillIndexPath);
      if (!indexInfo.resolved || !indexInfo.resolvable) {
        return jsonResource(uri.href, {
          error: "not_resolvable",
          message: `Skill index path not resolvable for environment: ${environmentId}`,
        });
      }
      const index = indexRepo.read(indexInfo.resolved);
      return jsonResource(uri.href, { environmentId, index });
    },
  );

  server.registerResource(
    "relationships",
    "skill-lab://relationships",
    {
      description: "Raw skill-relationships.json relationship map.",
      mimeType: "application/json",
    },
    async (uri) => {
      const map = RelationshipMapFileSchema.parse(relationshipMap.read());
      return jsonResource(uri.href, { map });
    },
  );

  server.registerResource(
    "graph",
    "skill-lab://graph",
    {
      description: "Full skill graph (default filters, first page).",
      mimeType: "application/json",
    },
    async (uri) => {
      const graphResult = SkillGraphResultSchema.parse(graph.getGraph());
      return jsonResource(uri.href, { graph: graphResult });
    },
  );

  server.registerResource(
    "health-latest",
    "skill-lab://health/latest",
    {
      description: "Latest catalog health scan report.",
      mimeType: "application/json",
    },
    async (uri) => {
      const report = CatalogHealthReportSchema.parse(health.scan());
      return jsonResource(uri.href, { report });
    },
  );
}
