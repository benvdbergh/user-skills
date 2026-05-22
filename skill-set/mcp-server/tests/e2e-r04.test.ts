import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import {
  PatchProposalSchema,
  RelationshipProposalSchema,
} from "../src/domain/types.js";
import { createApi } from "../src/http/api.js";
import { createAgentServices } from "../src/http/createAgentServices.js";
import { createProposalServices } from "../src/http/createProposalServices.js";
import { createValidationService } from "../src/http/createValidationServices.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";
import { PROMPT_TEMPLATE_IDS } from "../src/prompts/templateSources.js";
import { RelationshipMapRepository } from "../src/repositories/RelationshipMapRepository.js";
import { registerMcpPrompts } from "../src/mcp/prompts.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

/**
 * R0.4 milestone E2E — Validation, Source Prompts & AI Proposals (EPIC-4).
 * Layout manifest: `e2e-r04-layout.test.ts`. CI runway: `e2e-r04-gates.md`.
 */
describe("R0.4 milestone E2E", () => {
  const packageRoot = path.resolve(".");
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs.splice(0)) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  function fixtureConfig() {
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-e2e-r04-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({
        skillsRoot: FIXTURE_ROOT,
        writesEnabled: false,
        environmentMapRelativePath:
          "skill-set/catalog/environment-skill-index-map.json",
        relationshipMapRelativePath:
          "skill-set/maps/skill-relationships.json",
      }),
    );
    return loadConfig(pkg);
  }

  function fullApi() {
    const config = fixtureConfig();
    const catalog = new SkillCatalogService(config);
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    const { agent, proposals, prompts } = createAgentServices(config, catalog, {
      useStubRunner: true,
    });
    const proposalRoutes = createProposalServices(config, catalog, proposals);
    const validation = createValidationService(config, catalog, agent);
    const relationshipMap = new RelationshipMapRepository(config);
    const app = createApi({
      config,
      catalog,
      graph,
      health,
      validation,
      agent,
      prompts,
      relationshipMap,
      proposals: proposalRoutes,
    });
    return { config, catalog, app, prompts, proposals };
  }

  it("AC-003: lifecycle prompts load from skill-set files (NFR-012)", () => {
    const prompts = new PromptSourceService(fixtureConfig());
    for (const templateId of PROMPT_TEMPLATE_IDS) {
      const bundle = prompts.buildPromptBundle(templateId, {
        environmentId: "user",
        skillName: "demo-skill",
        skillMdRelativePath: "demo-skill/SKILL.md",
      });
      expect(bundle.templateId).toBe(templateId);
      expect(bundle.sourceRefs.length).toBeGreaterThan(0);
      expect(bundle.assembledPrompt.length).toBeGreaterThan(50);
      expect(
        bundle.sourceRefs.some((r) => r.relativePath.includes("skill-set")),
      ).toBe(true);
    }

    const srcDir = path.join(packageRoot, "src");
    const skip = new Set([
      path.join(srcDir, "prompts", "templateSources.ts"),
      path.join(srcDir, "prompts", "PromptSourceService.ts"),
    ]);
    const forbidden = [
      "When to use this skill",
      "Run structural lint",
      "Token economics rubric",
    ];
    function walk(dir: string): void {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        if (fs.statSync(p).isDirectory()) {
          walk(p);
          continue;
        }
        if (!p.endsWith(".ts")) continue;
        if (skip.has(p)) continue;
        const text = fs.readFileSync(p, "utf8");
        for (const phrase of forbidden) {
          expect(text).not.toContain(phrase);
        }
      }
    }
    walk(srcDir);
  });

  it("HTTP: validation, agent sessions, proposals, prompts (FR-038)", async () => {
    const { app } = fullApi();

    const authRes = await app.request("/api/agent/auth");
    expect(authRes.status).toBe(200);

    const sessionRes = await app.request("/api/agent-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runtime: "stub",
        kind: "improve-skill",
        environmentId: "user",
        skillName: "demo-skill",
      }),
    });
    expect(sessionRes.status).toBe(201);
    const sessionBody = (await sessionRes.json()) as {
      session: { id: string; status: string };
    };
    expect(sessionBody.session.id).toBeTruthy();

    const statusRes = await app.request(
      `/api/agent-sessions/${sessionBody.session.id}`,
    );
    expect(statusRes.status).toBe(200);
    const status = (await statusRes.json()) as {
      status: { status: string; proposalIds?: string[] };
    };
    expect(["completed", "running", "failed"]).toContain(
      status.status.status,
    );

    const promptRes = await app.request(
      "/api/prompts/improve-skill-description?environmentId=user&skillName=demo-skill",
    );
    expect(promptRes.status).toBe(200);

    const lintRes = await app.request(
      "/api/validation/user/demo-skill",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "lint" }),
      },
    );
    expect(lintRes.status).toBe(200);
    const lintBody = (await lintRes.json()) as { lint?: { score: number } };
    expect(typeof lintBody.lint?.score).toBe("number");

    const patchRes = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        environmentId: "user",
        skillName: "demo-skill",
        kind: "improve-skill",
        rationale: "E2E patch proposal.",
        fileChanges: [
          {
            relativePath: "demo-skill/SKILL.md",
            suggestedContent:
              "---\nname: demo-skill\ndescription: E2E.\n---\n\n# Demo\n",
          },
        ],
        citations: [{ sourcePath: "demo-skill/SKILL.md" }],
      }),
    });
    expect(patchRes.status).toBe(201);
    const patchJson = (await patchRes.json()) as { proposal: unknown };
    const patch = PatchProposalSchema.parse(patchJson.proposal);
    expect(patch.patchToken).toBeTruthy();
    expect(patch.fileChanges.length).toBeGreaterThan(0);

    const diffRes = await app.request(
      `/api/git/diff?patchToken=${encodeURIComponent(patch.patchToken)}`,
    );
    expect(diffRes.status).toBe(200);
    const diffBody = (await diffRes.json()) as {
      diff?: { unifiedDiff: string; patchToken: string };
    };
    expect(diffBody.diff?.unifiedDiff.length).toBeGreaterThan(0);
    expect(diffBody.diff?.patchToken).toBe(patch.patchToken);

    const relRes = await app.request("/api/proposals/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "suggest-edges",
        environmentId: "user",
        skillName: "demo-skill",
      }),
    });
    expect(relRes.status).toBe(200);
    const relBody = (await relRes.json()) as { proposal: unknown };
    const rel = RelationshipProposalSchema.parse(relBody.proposal);
    expect(rel.edges[0].evidence?.quote).toBeTruthy();
    expect(rel.edges[0].evidence?.sourceFile).toBeTruthy();
  });

  it("AC-006: relationship proposal includes type, endpoints, evidence, confidence, rationale", async () => {
    const { app } = fullApi();
    const res = await app.request("/api/proposals/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "suggest-edges",
        environmentId: "user",
        skillName: "demo-skill",
        edges: [
          {
            fromSkill: "demo-skill",
            toSkill: "overlap-skill",
            relationshipType: "specializes",
            confidence: 0.85,
            evidence: {
              quote: "Shared demo domain.",
              sourceFile: "skill-set/references/lint.md",
            },
            rationale: "E2E AC-006 coverage.",
          },
        ],
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { proposal: unknown };
    const p = RelationshipProposalSchema.parse(body.proposal);
    const edge = p.edges[0];
    expect(edge.relationshipType).toBe("specializes");
    expect(edge.fromSkill).toBe("demo-skill");
    expect(edge.toSkill).toBe("overlap-skill");
    expect(edge.confidence).toBeGreaterThan(0);
    expect(edge.evidence?.quote).toBeTruthy();
    expect(edge.evidence?.sourceFile).toBeTruthy();
    expect(edge.rationale ?? p.edges[0].rationale).toBeTruthy();
  });

  it("AC-007: patch proposal previewable as diff (apply deferred)", async () => {
    const { app } = fullApi();
    const post = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        environmentId: "user",
        skillName: "demo-skill",
        kind: "improve-skill",
        rationale: "AC-007",
        fileChanges: [
          {
            relativePath: "demo-skill/SKILL.md",
            suggestedContent:
              "---\nname: demo-skill\ndescription: E2E improved.\n---\n\n# Demo\n",
          },
        ],
        citations: [{ sourcePath: "demo-skill/SKILL.md" }],
      }),
    });
    expect(post.status).toBe(201);
    const { proposal } = (await post.json()) as { proposal: unknown };
    const patch = PatchProposalSchema.parse(proposal);
    const diff = await app.request(
      `/api/git/diff?patchToken=${encodeURIComponent(patch.patchToken)}`,
    );
    expect(diff.status).toBe(200);
    const body = (await diff.json()) as {
      diff: { unifiedDiff: string; skillName: string };
    };
    expect(body.diff.unifiedDiff).toMatch(/^--- a\//m);
    expect(body.diff.skillName).toBe("demo-skill");
  });

  it("AC-008: writesEnabled false by default; skill files unchanged after proposals", async () => {
    const config = fixtureConfig();
    expect(config.writesEnabled).toBe(false);

    const skillPath = path.join(FIXTURE_ROOT, "demo-skill", "SKILL.md");
    const before = fs.readFileSync(skillPath, "utf8");
    const { app } = fullApi();
    await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        environmentId: "user",
        skillName: "demo-skill",
        kind: "improve-skill",
        rationale: "No write",
        fileChanges: [
          {
            relativePath: "demo-skill/SKILL.md",
            suggestedContent: "---\nname: hacked\n---\n",
          },
        ],
        citations: [{ sourcePath: "demo-skill/SKILL.md" }],
      }),
    });
    expect(fs.readFileSync(skillPath, "utf8")).toBe(before);
  });

  it("MCP prompts register without hardcoded bodies in prompts.ts", () => {
    const src = fs.readFileSync(
      path.join(packageRoot, "src/mcp/prompts.ts"),
      "utf8",
    );
    expect(src).toContain("PromptSourceService");
    expect(src).toContain("buildPromptBundle");
    expect(src).not.toMatch(/assembledPrompt:\s*["'`]/);
    expect(typeof registerMcpPrompts).toBe("function");
  });

  it("Proposals nav enabled in Sidebar (R0.4 workbench)", () => {
    const sidebar = fs.readFileSync(
      path.join(packageRoot, "web/src/components/Sidebar.tsx"),
      "utf8",
    );
    expect(sidebar).not.toContain("pointer-events: none");
    expect(sidebar).toMatch(/to:\s*["']\/proposals["']/);
  });

});
