import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import {
  buildCatalogHealthPayload,
  buildGraphNeighborsPayload,
  buildSkillGraphPayload,
} from "../src/mcp/tools.js";
import { SKILL_LAB_RESOURCE_URIS } from "../src/mcp/resources.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

function loadFixtureServices() {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-mcp-"));
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot: FIXTURE_ROOT,
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
      relationshipMapRelativePath:
        "skill-set/maps/skill-relationships.json",
    }),
  );
  const config = loadConfig(pkg);
  const catalog = new SkillCatalogService(config);
  return {
    pkg,
    graph: new SkillGraphService(config, catalog),
    health: new SkillHealthService(config, catalog),
  };
}

describe("MCP graph and health adapters (STORY-2-3)", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("exposes stable skill-lab resource URI templates (FR-036)", () => {
    expect(SKILL_LAB_RESOURCE_URIS).toEqual([
      "skill-lab://environments",
      "skill-lab://skill-index/{environmentId}",
      "skill-lab://relationships",
      "skill-lab://graph",
      "skill-lab://health/latest",
      "skill-lab://validation/{environmentId}/{skillName}/latest",
    ]);
  });

  it("get_skill_graph payload matches SkillGraphResult schema (NFR-011)", () => {
    const { pkg, graph } = loadFixtureServices();
    tempDirs.push(pkg);
    const result = buildSkillGraphPayload(graph, { limit: 10 });
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBeGreaterThan(0);
    expect(result.highRiskRefactorSequences.length).toBeGreaterThan(0);
  });

  it("graph_neighbors payload returns local subgraph", () => {
    const { pkg, graph } = loadFixtureServices();
    tempDirs.push(pkg);
    const result = buildGraphNeighborsPayload(graph, {
      nodeId: "skill:user:demo-skill",
      depth: 1,
    });
    expect(result.edges.some((e) => e.id === "rel-fixture-001")).toBe(true);
  });

  it("check_catalog_health payload matches CatalogHealthReport schema", () => {
    const { pkg, health } = loadFixtureServices();
    tempDirs.push(pkg);
    const report = buildCatalogHealthPayload(health);
    expect(report.summary.total).toBe(report.findings.length);
    expect(report.scannedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
