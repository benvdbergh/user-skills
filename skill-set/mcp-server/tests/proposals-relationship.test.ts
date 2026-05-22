import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { RelationshipSuggestionAdvisor } from "../src/ai/RelationshipSuggestionAdvisor.js";
import { loadConfig } from "../src/config/loadConfig.js";
import { ChangeProposalService } from "../src/domain/ChangeProposalService.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { SkillImprovementAdvisor } from "../src/ai/SkillImprovementAdvisor.js";
import { GitDiffService } from "../src/git/GitDiffService.js";
import { createApi } from "../src/http/api.js";
import { RelationshipMapRepository } from "../src/repositories/RelationshipMapRepository.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");
const RELATIONSHIP_MAP_PATH = path.join(
  FIXTURE_ROOT,
  "skill-set/maps/skill-relationships.json",
);

function loadFixtureRelationshipApi() {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-rel-proposals-"));
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot: FIXTURE_ROOT,
      writesEnabled: false,
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
  const relationshipMap = new RelationshipMapRepository(config);
  const relationshipAdvisor = new RelationshipSuggestionAdvisor(
    catalog,
    relationshipMap,
  );
  const skillAdvisor = new SkillImprovementAdvisor(config, catalog, proposals);
  const gitDiff = new GitDiffService(proposals, skillAdvisor);
  return {
    pkg,
    config,
    proposals,
    relationshipAdvisor,
    app: createApi({
      config,
      catalog,
      graph,
      health,
      proposals: {
        catalog,
        proposals,
        relationshipAdvisor,
        skillAdvisor,
        gitDiff,
      },
    }),
  };
}

describe("relationship proposals (BEN-34)", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("rejects edges missing evidence.quote and evidence.sourceFile", () => {
    const { relationshipAdvisor } = loadFixtureRelationshipApi();
    const result = relationshipAdvisor.validateEdges([
      {
        fromSkill: "demo-skill",
        toSkill: "helper-skill",
        relationshipType: "may_call_or_wrap",
        confidence: 0.8,
        evidence: { sourceFile: "demo-skill/SKILL.md" },
      },
      {
        fromSkill: "demo-skill",
        toSkill: "vault-skill",
        relationshipType: "shares_mcp_tool_script",
        confidence: 0.7,
        evidence: { quote: "Uses vault tools." },
      },
    ]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(2);
    expect(result.rejected[0]?.reason).toContain("evidence.quote");
  });

  it("POST /api/proposals/relationships stores valid edges from map draft", async () => {
    const mapMtimeBefore = fs.statSync(RELATIONSHIP_MAP_PATH).mtimeMs;
    const { pkg, app } = loadFixtureRelationshipApi();
    tempDirs.push(pkg);

    const res = await app.request("/api/proposals/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "suggest-edges",
        environmentId: "user",
        skillName: "demo-skill",
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      proposal: {
        patchToken: string;
        kind: string;
        edges: Array<{
          evidence: { sourceFile: string; quote: string };
          rationale?: string;
        }>;
      };
    };
    expect(body.proposal.kind).toBe("relationship-suggestion");
    expect(body.proposal.edges.length).toBeGreaterThan(0);
    expect(body.proposal.edges[0]?.evidence.sourceFile).toBeTruthy();
    expect(body.proposal.edges[0]?.evidence.quote).toBeTruthy();

    const getRes = await app.request(
      `/api/proposals/${body.proposal.patchToken}`,
    );
    expect(getRes.status).toBe(200);
    const stored = (await getRes.json()) as { proposalKind: string };
    expect(stored.proposalKind).toBe("relationship");

    expect(fs.statSync(RELATIONSHIP_MAP_PATH).mtimeMs).toBe(mapMtimeBefore);
  });

  it("POST detect-conflicts finds overlapping triggers (AC-006 / FR-028)", async () => {
    const { pkg, app } = loadFixtureRelationshipApi();
    tempDirs.push(pkg);

    const res = await app.request("/api/proposals/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "detect-conflicts",
        environmentId: "user",
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      report: {
        kind: string;
        conflicts: Array<{
          triggerPhrase: string;
          skillNames: string[];
          rationale: string;
        }>;
        scannedSkillCount: number;
      };
    };
    expect(body.report.kind).toBe("trigger-conflict-report");
    expect(body.report.scannedSkillCount).toBeGreaterThanOrEqual(2);
    const overlap = body.report.conflicts.find((c) =>
      c.skillNames.includes("demo-skill") && c.skillNames.includes("overlap-skill"),
    );
    expect(overlap).toBeDefined();
    expect(overlap?.rationale.length).toBeGreaterThan(0);
  });
});
