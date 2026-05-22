import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validationReportDir } from "../src/ai/generatedPaths.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { SkillValidationService } from "../src/domain/SkillValidationService.js";
import { createAgentServices } from "../src/http/createAgentServices.js";
import { ChangeProposalService } from "../src/domain/ChangeProposalService.js";
import { createProposalServices } from "../src/http/createProposalServices.js";
import { createApi } from "../src/http/api.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";
import {
  executeProposeSkillPatch,
  sampleProposeSkillPatchInput,
} from "../src/mcp/proposalTools.js";
import { FIXTURE_ROOT, loadFixtureConfig } from "./helpers/fixtureConfig.js";

const SECRET_PATTERNS = [
  /\bBearer\s+[A-Za-z0-9._-]{8,}\b/,
  /\bsk-[A-Za-z0-9]{16,}\b/,
  /\bapi[_-]?key["']?\s*[:=]\s*["']?[A-Za-z0-9._-]{8,}/i,
  /"accessToken"\s*:/,
  /"refreshToken"\s*:/,
  /"password"\s*:\s*"(?!redacted)/,
];

function assertNoSecretsInJson(body: unknown): void {
  const text = JSON.stringify(body);
  for (const pattern of SECRET_PATTERNS) {
    expect(text).not.toMatch(pattern);
  }
  expect(text).not.toMatch(/@example\.com/);
}

describe("Security negatives (BEN-75)", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    const reportsRoot = path.join(FIXTURE_ROOT, ".generated", "reports");
    if (fs.existsSync(reportsRoot)) {
      fs.rmSync(reportsRoot, { recursive: true, force: true });
    }
    for (const d of tempDirs.splice(0)) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  function fullApi(writesEnabled = false) {
    const { config, pkg } = loadFixtureConfig({ writesEnabled });
    tempDirs.push(pkg);
    const catalog = new SkillCatalogService(config);
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    const { agent } = createAgentServices(config, catalog, {
      useStubRunner: true,
    });
    const validation = new SkillValidationService(
      config,
      catalog,
      new PromptSourceService(config),
      agent,
    );
    const proposals = new ChangeProposalService(config);
    const proposalRoutes = createProposalServices(config, catalog, proposals);
    const app = createApi({
      config,
      catalog,
      graph,
      health,
      validation,
      agent,
      proposals: proposalRoutes,
    });
    return { config, app, skillAdvisor: proposalRoutes.skillAdvisor };
  }

  it("GET /api/agent/auth body has no email or token fields (NFR-010)", async () => {
    const { app } = fullApi();
    const res = await app.request("/api/agent/auth");
    expect(res.status).toBe(200);
    const body = await res.json();
    assertNoSecretsInJson(body);
    const auth = (body as { auth: Record<string, unknown> }).auth;
    expect(auth).not.toHaveProperty("email");
    expect(auth).not.toHaveProperty("token");
    expect(auth).not.toHaveProperty("accessToken");
  });

  it("rejects fileChanges with ../ in relativePath (HTTP)", async () => {
    const { app } = fullApi();
    const res = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        sampleProposeSkillPatchInput({
          fileChanges: [
            {
              relativePath: "../demo-skill/SKILL.md",
              suggestedContent: "---\nname: x\n---\n",
            },
          ],
        }),
      ),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it("rejects fileChanges with ../ in relativePath (MCP propose_skill_patch)", async () => {
    const { skillAdvisor } = fullApi();
    const result = await executeProposeSkillPatch(
      sampleProposeSkillPatchInput({
        fileChanges: [
          {
            relativePath: "demo-skill/../../outside/SKILL.md",
            suggestedContent: "# escape\n",
          },
        ],
      }),
      skillAdvisor,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/\.\.|traversal|not allowed|Path/i);
    }
  });

  it("writesEnabled false + persist true does not write under .generated/reports (NFR-007)", async () => {
    const { config, pkg } = loadFixtureConfig({ writesEnabled: false });
    tempDirs.push(pkg);
    const catalog = new SkillCatalogService(config);
    const validation = new SkillValidationService(
      config,
      catalog,
      new PromptSourceService(config),
    );
    const report = validation.lint("user", "demo-skill", { persist: true });
    expect(report.persisted).toBe(false);

    const dir = validationReportDir(config.skillsRoot, "user", "demo-skill");
    expect(fs.existsSync(dir)).toBe(false);

    const validateReport = await validation.validate("user", "demo-skill", {
      persist: true,
    });
    expect(validateReport.persisted).toBe(false);
    expect(fs.existsSync(dir)).toBe(false);
  });
});
