import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validationReportDir } from "../src/ai/generatedPaths.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillValidationService } from "../src/domain/SkillValidationService.js";
import {
  AgentSessionSchema,
  LintReportSchema,
  PatchProposalSchema,
  RelationshipProposalSchema,
  ValidationReportSchema,
} from "../src/domain/types.js";
import { createAgentServices } from "../src/http/createAgentServices.js";
import { ChangeProposalService } from "../src/domain/ChangeProposalService.js";
import { createProposalServices } from "../src/http/createProposalServices.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";
import { sampleProposeSkillPatchInput } from "../src/mcp/proposalTools.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { createApi } from "../src/http/api.js";
import { FIXTURE_ROOT, loadFixtureConfig } from "./helpers/fixtureConfig.js";
import { validateAgainstJsonSchema } from "./helpers/jsonSchema.js";

describe("Zod ↔ JSON Schema contract (BEN-75)", () => {
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

  it("lint-report.schema.json accepts LintReport from SkillValidationService", () => {
    const { config, pkg } = loadFixtureConfig();
    tempDirs.push(pkg);
    const catalog = new SkillCatalogService(config);
    const validation = new SkillValidationService(
      config,
      catalog,
      new PromptSourceService(config),
    );
    const report = validation.lint("user", "demo-skill");
    const parsed = LintReportSchema.parse(report);
    validateAgainstJsonSchema("lint-report.schema.json", parsed);
  });

  it("validation-report.schema.json accepts ValidationReport from validate()", async () => {
    const { config, pkg } = loadFixtureConfig();
    tempDirs.push(pkg);
    const catalog = new SkillCatalogService(config);
    const validation = new SkillValidationService(
      config,
      catalog,
      new PromptSourceService(config),
    );
    const report = await validation.validate("user", "demo-skill");
    const parsed = ValidationReportSchema.parse(report);
    validateAgainstJsonSchema("validation-report.schema.json", parsed);
  });

  it("patch-proposal.schema.json accepts PatchProposal from propose_skill_patch flow", async () => {
    const { config, pkg } = loadFixtureConfig();
    tempDirs.push(pkg);
    const catalog = new SkillCatalogService(config);
    const proposals = new ChangeProposalService(config);
    const { skillAdvisor } = createProposalServices(config, catalog, proposals);
    const result = skillAdvisor.proposePatch(sampleProposeSkillPatchInput());
    const parsed = PatchProposalSchema.parse(result);
    validateAgainstJsonSchema("patch-proposal.schema.json", parsed);
  });

  it("relationship-proposal.schema.json accepts RelationshipProposal from HTTP ingest", async () => {
    const { config, pkg } = loadFixtureConfig();
    tempDirs.push(pkg);
    const catalog = new SkillCatalogService(config);
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    const proposals = new ChangeProposalService(config);
    const proposalRoutes = createProposalServices(config, catalog, proposals);
    const app = createApi({
      config,
      catalog,
      graph,
      health,
      proposals: proposalRoutes,
    });
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
    const body = (await res.json()) as { proposal: unknown };
    const parsed = RelationshipProposalSchema.parse(body.proposal);
    validateAgainstJsonSchema("relationship-proposal.schema.json", parsed);
  });

  it("agent-session.schema.json accepts stub AgentSession", async () => {
    const { config, pkg } = loadFixtureConfig();
    tempDirs.push(pkg);
    const catalog = new SkillCatalogService(config);
    const { agent } = createAgentServices(config, catalog, {
      useStubRunner: true,
    });
    const session = await agent.start({
      runtime: "stub",
      kind: "improve-skill",
      environmentId: "user",
      skillName: "demo-skill",
    });
    const parsed = AgentSessionSchema.parse(session);
    validateAgainstJsonSchema("agent-session.schema.json", parsed);
  });

  it("required R0.4 schema files exist under schemas/", () => {
    const schemasDir = path.resolve("schemas");
    for (const name of [
      "lint-report.schema.json",
      "validation-report.schema.json",
      "patch-proposal.schema.json",
      "relationship-proposal.schema.json",
      "agent-session.schema.json",
    ]) {
      expect(fs.existsSync(path.join(schemasDir, name))).toBe(true);
    }
  });
});
