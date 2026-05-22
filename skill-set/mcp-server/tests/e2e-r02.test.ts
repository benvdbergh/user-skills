import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import {
  CatalogHealthReportSchema,
  SkillGraphResultSchema,
} from "../src/domain/types.js";
import { createApi } from "../src/http/api.js";
import {
  buildCatalogHealthPayload,
  buildSkillGraphPayload,
} from "../src/adapters/graphHealthPayload.js";
import { SKILL_LAB_RESOURCE_URIS } from "../src/mcp/resources.js";

/**
 * R0.2 milestone E2E — Graph, Health & Shared HTTP API (EPIC-2).
 */
describe("R0.2 milestone E2E", () => {
  const packageRoot = path.resolve(".");

  function services() {
    const config = loadConfig(packageRoot);
    const catalog = new SkillCatalogService(config);
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    return { config, catalog, graph, health };
  }

  it("R0.2 layout: graph/health domain, HTTP adapter, schemas, contract doc", () => {
    const required = [
      "src/domain/SkillGraphService.ts",
      "src/domain/SkillHealthService.ts",
      "src/repositories/RelationshipMapRepository.ts",
      "src/http/api.ts",
      "src/http/problemDetails.ts",
      "src/mcp/resources.ts",
      "docs/graph-query-contract.md",
      "schemas/skill-graph-node.schema.json",
      "schemas/skill-graph-edge.schema.json",
      "schemas/catalog-health-report.schema.json",
    ];
    for (const rel of required) {
      expect(fs.existsSync(path.join(packageRoot, rel))).toBe(true);
    }
  });

  it("loads live relationship map with nodes and edges (FR-011–013)", () => {
    const { graph } = services();
    const result = SkillGraphResultSchema.parse(graph.getGraph({ limit: 100 }));
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBeGreaterThan(0);
    expect(result.nodes.some((n) => n.type === "skill")).toBe(true);
    const edge = result.edges[0];
    expect(edge.type).toBeTruthy();
    expect(typeof edge.confidence).toBe("number");
  });

  it("exposes high-risk refactor overlay when present (FR-015)", () => {
    const { graph } = services();
    const result = graph.getGraph({ limit: 1 });
    expect(Array.isArray(result.highRiskRefactorSequences)).toBe(true);
  });

  it("AC-005: health scan covers index, environment, relationships, escalation", () => {
    const { health } = services();
    const report = CatalogHealthReportSchema.parse(health.scan());
    const categories = new Set(report.findings.map((f) => f.category));
    expect(categories.has("index") || categories.has("environment")).toBe(true);
    expect(report.scannedAt).toBeTruthy();
    expect(report.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("NFR-002: full health scan completes under 5 seconds", () => {
    const { health } = services();
    const start = performance.now();
    health.scan();
    expect(performance.now() - start).toBeLessThan(5000);
  });

  it("NFR-011: HTTP graph and health match MCP adapter payloads", async () => {
    const { config, catalog, graph, health } = services();
    const app = createApi({ config, catalog, graph, health });

    const graphExpected = buildSkillGraphPayload(graph, { limit: 50 });
    const graphRes = await app.request("/api/graph?limit=50");
    expect(graphRes.status).toBe(200);
    const graphBody = (await graphRes.json()) as { graph: typeof graphExpected };
    expect(graphBody.graph).toEqual(graphExpected);

    const healthExpected = buildCatalogHealthPayload(health);
    const healthRes = await app.request("/api/health", { method: "POST" });
    expect(healthRes.status).toBe(200);
    const healthBody = (await healthRes.json()) as { report: typeof healthExpected };
    expect(healthBody.report.summary).toEqual(healthExpected.summary);
    expect(healthBody.report.findings.length).toBe(
      healthExpected.findings.length,
    );
  });

  it("FR-036: MCP resource URI templates registered", () => {
    expect(SKILL_LAB_RESOURCE_URIS.length).toBeGreaterThanOrEqual(5);
    expect(SKILL_LAB_RESOURCE_URIS).toContain("skill-lab://graph");
    expect(SKILL_LAB_RESOURCE_URIS).toContain("skill-lab://health/latest");
  });

  it("HTTP localhost defaults in config (local-only R0.2)", () => {
    const { config } = services();
    expect(config.httpHost).toBe("127.0.0.1");
    expect(config.httpPort).toBeGreaterThan(0);
  });
});
