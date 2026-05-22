import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { proposalFilePath } from "../src/ai/generatedPaths.js";
import { SkillImprovementAdvisor } from "../src/ai/SkillImprovementAdvisor.js";
import { createProposalServices } from "../src/http/createProposalServices.js";
import { loadConfig } from "../src/config/loadConfig.js";
import { ChangeProposalService } from "../src/domain/ChangeProposalService.js";
import { ProposalValidationError } from "../src/domain/proposalValidation.js";
import {
  ProposeSkillPatchInputSchema,
  ProposeSkillPatchMcpInputSchema,
} from "../src/domain/types.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { createApi } from "../src/http/api.js";
import { executeProposeSkillPatch } from "../src/mcp/proposalTools.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

function loadFixtureProposalsApi(writesEnabled = true) {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-proposals-"));
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot: FIXTURE_ROOT,
      writesEnabled,
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
      relationshipMapRelativePath: "skill-set/maps/skill-relationships.json",
    }),
  );
  const config = loadConfig(pkg);
  const catalog = new SkillCatalogService(config);
  const graph = new SkillGraphService(config, catalog);
  const health = new SkillHealthService(config, catalog);
  const proposals = new ChangeProposalService(config);
  const proposalRoutes = createProposalServices(config, catalog, proposals);
  return {
    pkg,
    config,
    catalog,
    proposals,
    skillAdvisor: proposalRoutes.skillAdvisor,
    gitDiff: proposalRoutes.gitDiff,
    app: createApi({
      config,
      catalog,
      graph,
      health,
      proposals: proposalRoutes,
    }),
  };
}

const samplePatchBody = {
  environmentId: "user",
  skillName: "demo-skill",
  kind: "improve-skill",
  rationale: "Tighten description and workflow routing for fixture coverage.",
  fileChanges: [
    {
      relativePath: "demo-skill/SKILL.md",
      suggestedContent:
        "---\nname: demo-skill\ndescription: Improved demo skill for tests.\n---\n\n# Demo\n",
    },
  ],
  citations: [
    {
      sourcePath: "demo-skill/SKILL.md",
      quote: "Demo skill for fixture tests",
    },
  ],
};

describe("patch proposals (BEN-35)", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("SkillImprovementAdvisor rejects prompt-only proposals without fileChanges", () => {
    const { pkg, skillAdvisor } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    expect(() =>
      skillAdvisor.proposePatch({
        ...samplePatchBody,
        fileChanges: [],
      }),
    ).toThrow(/fileChanges/);
  });

  it("SkillImprovementAdvisor rejects fileChanges without actionable content", () => {
    const { pkg, skillAdvisor } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    expect(() =>
      skillAdvisor.proposePatch({
        ...samplePatchBody,
        fileChanges: [{ relativePath: "demo-skill/SKILL.md" }],
      }),
    ).toThrow(/suggestedContent|unifiedDiff/);
  });

  it("POST /api/proposals/skill-patch returns PatchProposal with token and diff metadata", async () => {
    const { pkg, app } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(samplePatchBody),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      proposal: {
        patchToken: string;
        rationale: string;
        fileChanges: { unifiedDiff?: string }[];
        citations: unknown[];
      };
    };
    expect(body.proposal.patchToken).toBeTruthy();
    expect(body.proposal.rationale).toContain("Tighten description");
    expect(body.proposal.fileChanges.length).toBeGreaterThan(0);
    expect(body.proposal.fileChanges[0]?.unifiedDiff).toContain("+++ b/");
    expect(body.proposal.citations.length).toBeGreaterThan(0);
  });

  it("GET /api/proposals lists stored tokens", async () => {
    const { pkg, app } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    const created = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        environmentId: "user",
        skillName: "demo-skill",
        kind: "improve-skill",
        rationale: "test",
        fileChanges: [
          {
            relativePath: "demo-skill/SKILL.md",
            suggestedContent: "# demo\n",
          },
        ],
        citations: [{ sourcePath: "demo-skill/SKILL.md" }],
      }),
    });
    const { proposal } = (await created.json()) as { proposal: { patchToken: string } };
    const list = await app.request("/api/proposals");
    expect(list.status).toBe(200);
    const body = (await list.json()) as { tokens: string[] };
    expect(body.tokens).toContain(proposal.patchToken);
  });

  it("GET /api/proposals respects limit and sessionId (BEN-73)", async () => {
    const { pkg, app } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    const post = (sessionId: string | undefined, rationale: string) =>
      app.request("/api/proposals/skill-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environmentId: "user",
          skillName: "demo-skill",
          kind: "improve-skill",
          sessionId,
          rationale,
          fileChanges: [
            {
              relativePath: "demo-skill/SKILL.md",
              suggestedContent: "# demo\n",
            },
          ],
          citations: [{ sourcePath: "demo-skill/SKILL.md" }],
        }),
      });

    await post("sess-a", "older");
    await new Promise((r) => setTimeout(r, 5));
    const newer = await post("sess-a", "newer");
    const { proposal: newestInA } = (await newer.json()) as {
      proposal: { patchToken: string };
    };
    await post("sess-b", "other session");

    const limited = await app.request("/api/proposals?sessionId=sess-a&limit=1");
    expect(limited.status).toBe(200);
    const limitedBody = (await limited.json()) as { tokens: string[] };
    expect(limitedBody.tokens).toHaveLength(1);
    expect(limitedBody.tokens[0]).toBe(newestInA.patchToken);

    const filtered = await app.request("/api/proposals?sessionId=sess-a");
    expect(filtered.status).toBe(200);
    const filteredBody = (await filtered.json()) as { tokens: string[] };
    expect(filteredBody.tokens).toContain(newestInA.patchToken);
    for (const token of filteredBody.tokens) {
      const detail = await app.request(`/api/proposals/${token}`);
      const stored = (await detail.json()) as {
        proposal: { sessionId?: string };
      };
      expect(stored.proposal.sessionId).toBe("sess-a");
    }

    const badLimit = await app.request("/api/proposals?limit=0");
    expect(badLimit.status).toBe(400);
  });

  it("GET /api/proposals/:patchToken returns stored proposal", async () => {
    const { pkg, app } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    const created = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(samplePatchBody),
    });
    const { proposal } = (await created.json()) as { proposal: { patchToken: string } };
    const res = await app.request(`/api/proposals/${proposal.patchToken}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      proposalKind: string;
      proposal: { patchToken: string };
    };
    expect(body.proposalKind).toBe("patch");
    expect(body.proposal.patchToken).toBe(proposal.patchToken);
  });

  it("persists proposal JSON under .generated/proposals (independent of writesEnabled)", async () => {
    const { pkg, config, app } = loadFixtureProposalsApi(false);
    tempDirs.push(pkg);
    const created = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(samplePatchBody),
    });
    const { proposal } = (await created.json()) as { proposal: { patchToken: string } };
    const filePath = proposalFilePath(config.skillsRoot, proposal.patchToken);
    expect(fs.existsSync(filePath)).toBe(true);
    const stored = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      rationale: string;
    };
    expect(stored.rationale).toContain("Tighten description");
  });

  it("GET /api/git/diff?patchToken= previews unified diff (AC-007)", async () => {
    const { pkg, app } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    const created = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(samplePatchBody),
    });
    const { proposal } = (await created.json()) as { proposal: { patchToken: string } };
    const res = await app.request(
      `/api/git/diff?patchToken=${encodeURIComponent(proposal.patchToken)}`,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      diff: { unifiedDiff: string; patchToken: string };
    };
    expect(body.diff.patchToken).toBe(proposal.patchToken);
    expect(body.diff.unifiedDiff).toMatch(/^--- a\//m);
    expect(body.diff.unifiedDiff).toContain("+++ b/");
  });

  it("rejects relativePath with parent traversal (..) at ingest", () => {
    const { pkg, proposals } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    expect(() =>
      proposals.ingestPatch({
        ...samplePatchBody,
        fileChanges: [
          {
            relativePath: "../secret/SKILL.md",
            suggestedContent: "# evil\n",
          },
        ],
      }),
    ).toThrow(ProposalValidationError);
    expect(() =>
      proposals.ingestPatch({
        ...samplePatchBody,
        fileChanges: [
          {
            relativePath: "demo-skill/../../etc/passwd",
            suggestedContent: "# evil\n",
          },
        ],
      }),
    ).toThrow(/parent traversal/);
  });

  it("rejects absolute relativePath at ingest", () => {
    const { pkg, proposals } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    for (const relativePath of [
      "/etc/passwd",
      "C:\\Windows\\System32\\config",
    ]) {
      expect(() =>
        proposals.ingestPatch({
          ...samplePatchBody,
          fileChanges: [{ relativePath, suggestedContent: "# evil\n" }],
        }),
      ).toThrow(/absolute paths/);
    }
  });

  it("POST /api/proposals/skill-patch rejects traversal via problem response", async () => {
    const { pkg, app } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...samplePatchBody,
        fileChanges: [
          {
            relativePath: "demo-skill/../overlap-skill/SKILL.md",
            suggestedContent: "# cross-skill\n",
          },
        ],
      }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { detail?: string };
    expect(body.detail).toMatch(/traversal|\.\./i);
  });

  it("listProposalTokens orders by mtime without re-parsing every file", () => {
    const { pkg, config, proposals } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    const dir = path.join(config.skillsRoot, ".generated", "proposals");
    fs.mkdirSync(dir, { recursive: true });
    const olderToken = "00000000-0000-4000-8000-000000000001";
    const newerToken = "00000000-0000-4000-8000-000000000002";
    const writeProposal = (token: string, createdAt: string) => {
      fs.writeFileSync(
        path.join(dir, `${token}.json`),
        JSON.stringify({
          patchToken: token,
          kind: "improve-skill",
          environmentId: "user",
          skillName: "demo-skill",
          rationale: "fixture",
          fileChanges: [
            {
              relativePath: "demo-skill/SKILL.md",
              suggestedContent: "# x\n",
            },
          ],
          citations: [],
          createdAt,
        }),
      );
    };
    writeProposal(olderToken, "2020-01-01T00:00:00.000Z");
    writeProposal(newerToken, "2024-06-01T00:00:00.000Z");
    const olderPath = path.join(dir, `${olderToken}.json`);
    const newerPath = path.join(dir, `${newerToken}.json`);
    const oldTime = new Date("2020-01-01T00:00:00.000Z");
    const newTime = new Date("2024-06-01T00:00:00.000Z");
    fs.utimesSync(olderPath, oldTime, oldTime);
    fs.utimesSync(newerPath, newTime, newTime);

    const parseSpy = vi.spyOn(JSON, "parse");
    parseSpy.mockClear();
    const tokens = proposals.listProposalTokens();
    const parseCallsForList = parseSpy.mock.calls.length;
    parseSpy.mockRestore();

    expect(tokens.indexOf(newerToken)).toBeLessThan(tokens.indexOf(olderToken));
    expect(parseCallsForList).toBe(0);
  });

  it("POST /api/proposals/skill-patch rejects empty fileChanges via problem response", async () => {
    const { pkg, app } = loadFixtureProposalsApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...samplePatchBody, fileChanges: [] }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { detail?: string };
    expect(body.detail).toMatch(/fileChanges/);
  });

  it("MCP inputSchema matches ProposeSkillPatchInputSchema validation", () => {
    const mcpGate = z.object(ProposeSkillPatchMcpInputSchema);
    const cases: unknown[] = [
      samplePatchBody,
      { ...samplePatchBody, rationale: "" },
      { ...samplePatchBody, citations: [] },
      { ...samplePatchBody, fileChanges: [] },
      { environmentId: "user" },
    ];
    for (const payload of cases) {
      const domain = ProposeSkillPatchInputSchema.safeParse(payload);
      const mcp = mcpGate.safeParse(payload);
      expect(mcp.success).toBe(domain.success);
    }
  });

  it.each([
    {
      name: "empty rationale",
      payload: { ...samplePatchBody, rationale: "" },
      pattern: /rationale/i,
    },
    {
      name: "empty citations",
      payload: { ...samplePatchBody, citations: [] },
      pattern: /citations/i,
    },
    {
      name: "empty fileChanges",
      payload: { ...samplePatchBody, fileChanges: [] },
      pattern: /fileChanges/i,
    },
    {
      name: "missing skillName",
      payload: { ...samplePatchBody, skillName: undefined },
      pattern: /skillName|required/i,
    },
  ])(
    "HTTP and MCP reject invalid propose_skill_patch payload: $name",
    async ({ payload, pattern }) => {
      const { pkg, app, skillAdvisor } = loadFixtureProposalsApi();
      tempDirs.push(pkg);

      const httpRes = await app.request("/api/proposals/skill-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      expect(httpRes.status).toBe(400);
      const httpBody = (await httpRes.json()) as { detail?: string };
      expect(httpBody.detail).toMatch(pattern);

      const mcp = await executeProposeSkillPatch(payload, skillAdvisor);
      expect(mcp.ok).toBe(false);
      if (!mcp.ok) {
        expect(mcp.error).toMatch(pattern);
      }
    },
  );
});
