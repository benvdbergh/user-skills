import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import {
  buildGraphNodeId,
  SkillGraphService,
} from "../src/domain/SkillGraphService.js";
import { RelationshipMapRepository } from "../src/repositories/RelationshipMapRepository.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

function loadFixtureGraph(): SkillGraphService {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-graph-"));
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
  return new SkillGraphService(config, catalog);
}

describe("RelationshipMapRepository", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("loads fixture relationship map (FR-011)", () => {
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-map-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({
        skillsRoot: FIXTURE_ROOT,
        relationshipMapRelativePath:
          "skill-set/maps/skill-relationships.json",
      }),
    );
    const config = loadConfig(pkg);
    const repo = new RelationshipMapRepository(config);
    const map = repo.read();
    expect(map.relationships).toHaveLength(2);
    expect(map.high_risk_refactor_sequences).toHaveLength(1);
  });
});

describe("SkillGraphService", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("builds typed skill and mcp_tool nodes (FR-012)", () => {
    const graph = loadFixtureGraph();
    const result = graph.getGraph();
    const skillNode = result.nodes.find(
      (n) => n.id === buildGraphNodeId("skill", "user", "demo-skill"),
    );
    const toolNode = result.nodes.find(
      (n) => n.id === buildGraphNodeId("mcp_tool", "external", "fixture-mcp-server"),
    );
    expect(skillNode?.type).toBe("skill");
    expect(toolNode?.type).toBe("mcp_tool");
    expect(result.edges.some((e) => e.id === "rel-fixture-001")).toBe(true);
  });

  it("maps edges with evidence, confidence, and approximate flag (FR-013)", () => {
    const graph = loadFixtureGraph();
    const edge = graph.getGraph().edges.find((e) => e.id === "rel-fixture-001");
    expect(edge).toMatchObject({
      type: "may_call_or_wrap",
      confidence: 0.9,
      mappingIsApproximate: true,
      evidence: {
        sourceFile: "demo-skill/SKILL.md",
        quote: "Delegates to helper-skill for shared utilities.",
      },
    });
    expect(edge?.notes).toContain("Fixture");
  });

  it("filters by relationship type and confidence (FR-014)", () => {
    const graph = loadFixtureGraph();
    const filtered = graph.getGraph({
      relationshipTypes: ["shares_mcp_tool_script"],
      confidenceMin: 0.75,
    });
    expect(filtered.edges).toHaveLength(1);
    expect(filtered.edges[0].id).toBe("rel-fixture-002");
  });

  it("filters skill nodes by health status from catalog (FR-014)", () => {
    const graph = loadFixtureGraph();
    const filtered = graph.getGraph({ healthStatus: "warning" });
    expect(
      filtered.nodes.some(
        (n) => n.id === buildGraphNodeId("skill", "user", "demo-skill"),
      ),
    ).toBe(true);
    expect(filtered.edges.length).toBeGreaterThan(0);
  });

  it("returns high-risk refactor sequences as overlay data (FR-015)", () => {
    const graph = loadFixtureGraph();
    const result = graph.getGraph();
    expect(result.highRiskRefactorSequences).toHaveLength(1);
    expect(result.highRiskRefactorSequences[0].id).toBe("risk-fixture-001");
    expect(result.highRiskRefactorSequences[0].downstreamSkills).toContain(
      "demo-skill",
    );
  });

  it("paginates edges with cursor", () => {
    const graph = loadFixtureGraph();
    const page1 = graph.getGraph({ limit: 1 });
    expect(page1.edges).toHaveLength(1);
    expect(page1.nextCursor).toBe("1");
    const page2 = graph.getGraph({ limit: 1, cursor: page1.nextCursor });
    expect(page2.edges).toHaveLength(1);
    expect(page2.nextCursor).toBeUndefined();
  });

  it("returns local neighborhood by depth", () => {
    const graph = loadFixtureGraph();
    const center = buildGraphNodeId("skill", "user", "demo-skill");
    const local = graph.neighbors({ nodeId: center, depth: 1 });
    expect(local.edges.some((e) => e.id === "rel-fixture-001")).toBe(true);
    expect(
      local.nodes.some(
        (n) => n.id === buildGraphNodeId("skill", "user", "helper-skill"),
      ),
    ).toBe(true);
  });
});

describe("loadConfig relationshipMapRelativePath", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("defaults relationship map path under skills root", () => {
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-rel-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({ skillsRoot: FIXTURE_ROOT }),
    );
    const config = loadConfig(pkg);
    expect(config.relationshipMapRelativePath).toBe(
      "skill-set/maps/skill-relationships.json",
    );
    expect(config.relationshipMapPath).toContain("skill-relationships.json");
  });
});
