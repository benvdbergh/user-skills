import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { proposalFilePath } from "../src/ai/generatedPaths.js";
import { SkillImprovementAdvisor } from "../src/ai/SkillImprovementAdvisor.js";
import { createProposalServices } from "../src/http/createProposalServices.js";
import { loadConfig } from "../src/config/loadConfig.js";
import { ChangeProposalService } from "../src/domain/ChangeProposalService.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { createApi } from "../src/http/api.js";

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
});
