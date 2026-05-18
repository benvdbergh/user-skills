import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import {
  buildGraphNodeId,
  SkillGraphService,
} from "../src/domain/SkillGraphService.js";
import type {
  RelationshipMapEntry,
  RelationshipMapFile,
} from "../src/domain/types.js";
import { RelationshipMapRepository } from "../src/repositories/RelationshipMapRepository.js";

/** NFR-004 target scale (see docs/graph-query-contract.md). */
const TARGET_SKILL_COUNT = 250;
const TARGET_EDGE_COUNT = 1000;

const REL_TYPES = [
  "may_call_or_wrap",
  "shares_mcp_tool_script",
  "depends_on",
] as const;

/** Generous dev-laptop gates — regression detectors, not production SLOs. */
const THRESHOLD_MS = {
  fullGraph: 2000,
  filtered: 1000,
  neighborsDepth1: 1000,
  neighborsDepth3: 2000,
  paginated: 1000,
} as const;

function buildSyntheticMap(
  skillCount: number,
  edgeCount: number,
): RelationshipMapFile {
  const userLevel = Array.from(
    { length: skillCount - 50 },
    (_, i) => `perf-skill-${i}`,
  );
  const projectLevel = Array.from({ length: 50 }, (_, i) => `perf-proj-${i}`);
  const allSkills = [...userLevel, ...projectLevel];
  const relationships: RelationshipMapEntry[] = [];

  for (let i = 0; i < edgeCount; i++) {
    const from = allSkills[i % allSkills.length];
    const to = allSkills[(i * 7 + 13) % allSkills.length];
    relationships.push({
      id: `perf-rel-${i}`,
      from_skill: from,
      to_skill: to,
      relationship_type: REL_TYPES[i % REL_TYPES.length],
      mapping_is_approximate: i % 3 === 0,
      confidence_score: 0.5 + (i % 50) / 100,
      notes: i % 10 === 0 ? "perf fixture edge" : undefined,
    });
  }

  return {
    version: 1,
    updated: "2026-05-18T00:00:00.000Z",
    skills: { user_level: userLevel, project_level_ai_vault: projectLevel },
    relationships,
    high_risk_refactor_sequences: [],
  };
}

class InMemoryMapRepo extends RelationshipMapRepository {
  constructor(
    config: Parameters<typeof RelationshipMapRepository>[0],
    private readonly map: RelationshipMapFile,
  ) {
    super(config);
  }

  override read(): RelationshipMapFile {
    return this.map;
  }
}

function buildPerfGraph(map: RelationshipMapFile): SkillGraphService {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-perf-"));
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({ skillsRoot: pkg }),
  );
  const config = loadConfig(pkg);
  const catalog = new SkillCatalogService(config);
  const mapRepo = new InMemoryMapRepo(config, map);
  return new SkillGraphService(config, catalog, mapRepo);
}

function timed<T>(fn: () => T): { result: T; ms: number } {
  const start = performance.now();
  const result = fn();
  return { result, ms: performance.now() - start };
}

describe("graph performance baseline (NFR-004, STORY-2-6)", () => {
  const map = buildSyntheticMap(TARGET_SKILL_COUNT, TARGET_EDGE_COUNT);
  const graph = buildPerfGraph(map);

  it("synthetic fixture meets 250 skills / 1k edges", () => {
    const full = graph.getGraph({ limit: TARGET_EDGE_COUNT });
    const skillNodes = full.nodes.filter((n) => n.type === "skill");
    expect(skillNodes.length).toBe(TARGET_SKILL_COUNT);
    expect(map.relationships).toHaveLength(TARGET_EDGE_COUNT);
  });

  it("full graph build stays within threshold", () => {
    const { result, ms } = timed(() => graph.getGraph());
    expect(result.edges.length).toBe(500);
    expect(result.nextCursor).toBeDefined();
    console.info(`[graph-perf] getGraph() default page: ${ms.toFixed(1)}ms`);
    expect(ms).toBeLessThan(THRESHOLD_MS.fullGraph);
  });

  it("relationship + confidence filter stays within threshold", () => {
    const { result, ms } = timed(() =>
      graph.getGraph({
        relationshipTypes: ["may_call_or_wrap"],
        confidenceMin: 0.7,
        limit: TARGET_EDGE_COUNT,
      }),
    );
    expect(result.edges.length).toBeGreaterThan(0);
    console.info(`[graph-perf] filtered edges: ${result.edges.length}, ${ms.toFixed(1)}ms`);
    expect(ms).toBeLessThan(THRESHOLD_MS.filtered);
  });

  it("nodeTypes filter stays within threshold", () => {
    const { result, ms } = timed(() =>
      graph.getGraph({ nodeTypes: ["skill"], limit: TARGET_EDGE_COUNT }),
    );
    expect(result.nodes.every((n) => n.type === "skill")).toBe(true);
    console.info(`[graph-perf] nodeTypes=skill: ${ms.toFixed(1)}ms`);
    expect(ms).toBeLessThan(THRESHOLD_MS.filtered);
  });

  it("paginated graph stays within threshold", () => {
    const { ms } = timed(() => {
      let cursor: string | undefined;
      let pages = 0;
      do {
        const page = graph.getGraph({ limit: 100, cursor });
        pages++;
        cursor = page.nextCursor;
      } while (cursor && pages < 20);
      expect(pages).toBe(10);
    });
    console.info(`[graph-perf] paginate 10x100 edges: ${ms.toFixed(1)}ms`);
    expect(ms).toBeLessThan(THRESHOLD_MS.paginated);
  });

  it("neighbors depth=1 stays within threshold", () => {
    const center = buildGraphNodeId("skill", "user", "perf-skill-0");
    const { result, ms } = timed(() =>
      graph.neighbors({ nodeId: center, depth: 1 }),
    );
    expect(result.edges.length).toBeGreaterThan(0);
    console.info(`[graph-perf] neighbors depth=1: ${ms.toFixed(1)}ms`);
    expect(ms).toBeLessThan(THRESHOLD_MS.neighborsDepth1);
  });

  it("neighbors depth=3 stays within threshold", () => {
    const center = buildGraphNodeId("skill", "user", "perf-skill-0");
    const { result, ms } = timed(() =>
      graph.neighbors({ nodeId: center, depth: 3 }),
    );
    expect(result.nodes.length).toBeGreaterThan(1);
    console.info(
      `[graph-perf] neighbors depth=3 nodes=${result.nodes.length}: ${ms.toFixed(1)}ms`,
    );
    expect(ms).toBeLessThan(THRESHOLD_MS.neighborsDepth3);
  });
});

describe("graph performance live repo (optional)", () => {
  it("skips when SKILL_LAB_SKILLS_ROOT unset", () => {
    if (!process.env.SKILL_LAB_SKILLS_ROOT) return;
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-live-perf-"));
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({ skillsRoot: process.env.SKILL_LAB_SKILLS_ROOT }),
    );
    const config = loadConfig(pkg);
    const graph = new SkillGraphService(config, new SkillCatalogService(config));
    const { ms } = timed(() => graph.getGraph({ limit: 500 }));
    console.info(`[graph-perf] live repo getGraph: ${ms.toFixed(1)}ms`);
    expect(ms).toBeLessThan(THRESHOLD_MS.fullGraph);
    fs.rmSync(pkg, { recursive: true, force: true });
  });
});
