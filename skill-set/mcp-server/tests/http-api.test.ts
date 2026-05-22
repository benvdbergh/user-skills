import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { createApi } from "../src/http/api.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";
import { RelationshipMapRepository } from "../src/repositories/RelationshipMapRepository.js";
import {
  buildCatalogHealthPayload,
  buildGraphNeighborsPayload,
  buildSkillGraphPayload,
} from "../src/mcp/tools.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

function loadFixtureApi(options?: { skillsRoot?: string }) {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-http-"));
  const skillsRoot = options?.skillsRoot ?? FIXTURE_ROOT;
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot,
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
      relationshipMapRelativePath:
        "skill-set/maps/skill-relationships.json",
    }),
  );
  const config = loadConfig(pkg);
  const catalog = new SkillCatalogService(config);
  const graph = new SkillGraphService(config, catalog);
  const health = new SkillHealthService(config, catalog);
  const prompts = new PromptSourceService(config);
  const relationshipMap = new RelationshipMapRepository(config);
  return {
    pkg,
    config,
    app: createApi({
      config,
      catalog,
      graph,
      health,
      prompts,
      relationshipMap,
    }),
    graph,
    health,
  };
}

function fixtureSkillsRootWithoutHealthCache(): string {
  const skillsRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "skill-lab-http-skills-"),
  );
  fs.cpSync(FIXTURE_ROOT, skillsRoot, { recursive: true });
  fs.rmSync(path.join(skillsRoot, ".generated", "health"), {
    recursive: true,
    force: true,
  });
  return skillsRoot;
}

describe("HTTP read API (STORY-2-4)", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("GET /api/environments returns environment list", async () => {
    const { pkg, app } = loadFixtureApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/environments");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { environments: { id: string }[] };
    expect(body.environments.some((e) => e.id === "user")).toBe(true);
  });

  it("GET /api/skills lists skills with optional environmentId", async () => {
    const { pkg, app } = loadFixtureApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/skills?environmentId=user");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { skills: { name: string }[] };
    expect(body.skills.some((s) => s.name === "demo-skill")).toBe(true);
  });

  it("GET /api/skills/:environmentId/:skillName returns detail", async () => {
    const { pkg, app } = loadFixtureApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/skills/user/demo-skill");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { skill: { name: string } };
    expect(body.skill.name).toBe("demo-skill");
  });

  it("GET /api/prompts returns assembled prompt from PromptSourceService (BEN-33)", async () => {
    const { pkg, app } = loadFixtureApi();
    tempDirs.push(pkg);
    const res = await app.request(
      "/api/prompts/improve-skill-description?environmentId=user&skillName=demo-skill",
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      prompt: { assembledPrompt: string; sourceRefs: { relativePath: string }[] };
      skillSetRoot: string;
    };
    expect(body.prompt.assembledPrompt).toContain("Optimize (fixture)");
    expect(body.skillSetRoot).toContain("skill-set");
    expect(
      body.prompt.sourceRefs.some((r) =>
        r.relativePath.includes("skill-set/references/optimize.md"),
      ),
    ).toBe(true);
  });

  it("GET /api/skills/:environmentId/:skillName returns 404 problem+json", async () => {
    const { pkg, app } = loadFixtureApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/skills/user/missing-skill");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain(
      "application/problem+json",
    );
    const body = (await res.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toContain("not-found");
  });

  it("GET /api/graph matches MCP graph payload shape (NFR-011)", async () => {
    const { pkg, app, graph } = loadFixtureApi();
    tempDirs.push(pkg);
    const expected = buildSkillGraphPayload(graph, { limit: 10 });
    const res = await app.request("/api/graph?limit=10");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { graph: typeof expected };
    expect(body.graph).toEqual(expected);
  });

  it("GET /api/graph accepts comma-separated nodeTypes", async () => {
    const { pkg, app } = loadFixtureApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/graph?nodeTypes=skill,mcp_tool&limit=5");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { graph: { nodes: { type: string }[] } };
    expect(body.graph.nodes.length).toBeGreaterThan(0);
  });

  it("GET /api/graph returns 400 problem+json for invalid limit", async () => {
    const { pkg, app } = loadFixtureApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/graph?limit=not-a-number");
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toContain(
      "application/problem+json",
    );
  });

  it("GET /api/graph/neighbors matches MCP neighbors payload", async () => {
    const { pkg, app, graph } = loadFixtureApi();
    tempDirs.push(pkg);
    const query = { nodeId: "skill:user:demo-skill", depth: 1 };
    const expected = buildGraphNeighborsPayload(graph, query);
    const res = await app.request(
      `/api/graph/neighbors?nodeId=${encodeURIComponent(query.nodeId)}&depth=1`,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { graph: typeof expected };
    expect(body.graph).toEqual(expected);
  });

  it("GET /api/graph/neighbors requires nodeId", async () => {
    const { pkg, app } = loadFixtureApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/graph/neighbors");
    expect(res.status).toBe(400);
  });

  it("GET /api/graph/skill-relationship-counts returns skill edge counts", async () => {
    const { pkg, app, graph } = loadFixtureApi();
    tempDirs.push(pkg);
    const expected = graph.getSkillRelationshipCounts();
    const res = await app.request("/api/graph/skill-relationship-counts");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { counts: Record<string, number> };
    expect(body.counts).toEqual(expected);
    expect(body.counts["skill:user:demo-skill"]).toBeGreaterThan(0);
  });

  it("GET /* rejects path traversal when staticDir is set", async () => {
    const { pkg } = loadFixtureApi();
    tempDirs.push(pkg);
    const staticDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "skill-lab-web-dist-"),
    );
    tempDirs.push(staticDir);
    fs.writeFileSync(
      path.join(staticDir, "index.html"),
      "<!doctype html><html></html>",
    );

    const config = loadConfig(pkg);
    const catalog = new SkillCatalogService(config);
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    const app = createApi({ config, catalog, graph, health }, { staticDir });

    const res = await app.request("/../../../etc/passwd");
    expect(res.status).toBe(404);
  });

  it("GET /* serves SPA index when staticDir is set", async () => {
    const { pkg } = loadFixtureApi();
    tempDirs.push(pkg);
    const staticDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "skill-lab-web-dist-"),
    );
    tempDirs.push(staticDir);
    const indexHtml = "<!doctype html><html><body>dashboard</body></html>";
    fs.writeFileSync(path.join(staticDir, "index.html"), indexHtml);

    const config = loadConfig(pkg);
    const catalog = new SkillCatalogService(config);
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    const app = createApi({ config, catalog, graph, health }, { staticDir });

    const res = await app.request("/graph");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(await res.text()).toBe(indexHtml);
  });

  it("GET /api/health/latest returns 404 before any scan (STORY-4-12)", async () => {
    const skillsRoot = fixtureSkillsRootWithoutHealthCache();
    tempDirs.push(skillsRoot);
    const { pkg, app } = loadFixtureApi({ skillsRoot });
    tempDirs.push(pkg);
    const res = await app.request("/api/health/latest");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain(
      "application/problem+json",
    );
  });

  it("GET /api/health/latest returns cached report after POST rescan", async () => {
    const { pkg, app, health } = loadFixtureApi();
    tempDirs.push(pkg);
    const scanRes = await app.request("/api/health", { method: "POST" });
    expect(scanRes.status).toBe(200);
    const scanned = (await scanRes.json()) as {
      report: { scannedAt: string; summary: { total: number } };
    };

    const latestRes = await app.request("/api/health/latest");
    expect(latestRes.status).toBe(200);
    const latest = (await latestRes.json()) as { report: typeof scanned.report };
    expect(latest.report.scannedAt).toBe(scanned.report.scannedAt);
    expect(latest.report.summary).toEqual(scanned.report.summary);
    expect(health.getLatest()?.scannedAt).toBe(scanned.report.scannedAt);
  });

  it("POST /api/health returns catalog health report", async () => {
    const { pkg, app, health } = loadFixtureApi();
    tempDirs.push(pkg);
    const expected = buildCatalogHealthPayload(health);
    const res = await app.request("/api/health", { method: "POST" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { report: typeof expected };
    expect(body.report.findings.length).toBe(expected.findings.length);
    expect(body.report.summary).toEqual(expected.summary);
  });
});
