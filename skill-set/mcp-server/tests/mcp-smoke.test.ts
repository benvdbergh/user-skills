import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { LintReportSchema, PatchProposalSchema } from "../src/domain/types.js";
import { createAgentServices } from "../src/http/createAgentServices.js";
import { createProposalServices } from "../src/http/createProposalServices.js";
import { createValidationService } from "../src/http/createValidationServices.js";
import { createApi } from "../src/http/api.js";
import { executeLintSkill } from "../src/mcp/toolExecutors.js";
import {
  executeProposeSkillPatch,
  sampleProposeSkillPatchInput,
} from "../src/mcp/proposalTools.js";
import {
  SKILL_LAB_MCP_TOOL_NAMES,
  wireSkillLabMcpServer,
} from "../src/mcp/skillLabMcpServer.js";
import { RelationshipMapRepository } from "../src/repositories/RelationshipMapRepository.js";
import { SkillIndexRepository } from "../src/repositories/SkillIndexRepository.js";
import { FIXTURE_ROOT, loadFixtureConfig } from "./helpers/fixtureConfig.js";

function wireFixtureMcp(writesEnabled = false) {
  const { config } = loadFixtureConfig({ writesEnabled });
  const catalog = new SkillCatalogService(config);
  const graph = new SkillGraphService(config, catalog);
  const health = new SkillHealthService(config, catalog);
  const { agent, proposals, prompts } = createAgentServices(config, catalog, {
    useStubRunner: true,
  });
  const validation = createValidationService(config, catalog, agent);
  const proposalRoutes = createProposalServices(config, catalog, proposals);
  const relationshipMap = new RelationshipMapRepository(config);
  return wireSkillLabMcpServer({
    config,
    catalog,
    graph,
    health,
    validation,
    agent,
    proposals,
    prompts,
    skillAdvisor: proposalRoutes.skillAdvisor,
    relationshipAdvisor: proposalRoutes.relationshipAdvisor,
    relationshipMap,
    indexRepo: new SkillIndexRepository(config),
  });
}

describe("MCP smoke (BEN-75)", () => {
  const tempDirs: string[] = [];
  const packageRoot = path.resolve(".");

  afterEach(() => {
    for (const d of tempDirs.splice(0)) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("registers R0.4 MCP tools including lint_skill and propose_skill_patch", () => {
    wireFixtureMcp();
    expect(SKILL_LAB_MCP_TOOL_NAMES).toContain("lint_skill");
    expect(SKILL_LAB_MCP_TOOL_NAMES).toContain("propose_skill_patch");
    expect(SKILL_LAB_MCP_TOOL_NAMES).toContain("validate_skill");
  });

  it("lint_skill executor returns LintReport structuredContent", () => {
    const { deps } = wireFixtureMcp();
    const result = executeLintSkill(deps.validation, {
      environmentId: "user",
      skillName: "demo-skill",
    });
    expect(result.isError).toBeFalsy();
    const lint = LintReportSchema.parse(result.structuredContent?.lint);
    expect(lint.skillName).toBe("demo-skill");
    expect(lint.score).toBeGreaterThanOrEqual(0);
  });

  it("propose_skill_patch executor returns PatchProposal (stub composition root)", async () => {
    const { deps } = wireFixtureMcp();
    const result = await executeProposeSkillPatch(
      sampleProposeSkillPatchInput(),
      deps.skillAdvisor,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const proposal = PatchProposalSchema.parse(result.proposal);
    expect(proposal.patchToken).toBeTruthy();
    expect(proposal.fileChanges.length).toBeGreaterThan(0);
  });

  it("NFR-011: lint MCP structuredContent matches HTTP POST /api/validation", async () => {
    const { deps } = wireFixtureMcp();
    const mcp = executeLintSkill(deps.validation, {
      environmentId: "user",
      skillName: "demo-skill",
    });
    const mcpLint = LintReportSchema.parse(mcp.structuredContent?.lint);

    const app = createApi({
      config: deps.config,
      catalog: deps.catalog,
      graph: deps.graph,
      health: deps.health,
      validation: deps.validation,
    });
    const res = await app.request("/api/validation/user/demo-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "lint" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { lint: unknown };
    const httpLint = LintReportSchema.parse(body.lint);
    expect(httpLint.score).toBe(mcpLint.score);
    expect(httpLint.findings).toEqual(mcpLint.findings);
    expect(httpLint.complianceLevel).toBe(mcpLint.complianceLevel);
  });

  it("NFR-011: propose_skill_patch MCP matches HTTP POST /api/proposals/skill-patch", async () => {
    const { deps } = wireFixtureMcp();
    const input = sampleProposeSkillPatchInput({ rationale: "Parity check." });
    const mcp = await executeProposeSkillPatch(input, deps.skillAdvisor);
    expect(mcp.ok).toBe(true);
    if (!mcp.ok) return;

    const proposalRoutes = createProposalServices(
      deps.config,
      deps.catalog,
      deps.proposals,
    );
    const app = createApi({
      config: deps.config,
      catalog: deps.catalog,
      graph: deps.graph,
      health: deps.health,
      proposals: proposalRoutes,
    });
    const res = await app.request("/api/proposals/skill-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { proposal: unknown };
    const httpProposal = PatchProposalSchema.parse(body.proposal);
    const mcpProposal = PatchProposalSchema.parse(mcp.proposal);
    expect(httpProposal.environmentId).toBe(mcpProposal.environmentId);
    expect(httpProposal.skillName).toBe(mcpProposal.skillName);
    expect(httpProposal.fileChanges).toEqual(mcpProposal.fileChanges);
    expect(httpProposal.rationale).toBe(mcpProposal.rationale);
  });

  it(
    "stdio MCP subprocess: lint_skill via Client (dist/cli.js mcp)",
    async () => {
      const distCli = path.join(packageRoot, "dist/cli.js");
      if (!fs.existsSync(distCli)) {
        return;
      }
      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [distCli, "mcp"],
        cwd: packageRoot,
        env: {
          ...process.env,
          SKILL_LAB_SKILLS_ROOT: FIXTURE_ROOT,
        },
        stderr: "pipe",
      });
      const client = new Client({ name: "skill-lab-test", version: "0.0.0" });
      try {
        await client.connect(transport);

        const tools = await client.listTools();
        const names = tools.tools.map((t) => t.name);
        expect(names).toContain("lint_skill");
        expect(names).toContain("propose_skill_patch");

        const lintResult = await client.callTool({
          name: "lint_skill",
          arguments: {
            environmentId: "user",
            skillName: "demo-skill",
          },
        });
        if (lintResult.isError) {
          const errText = lintResult.content
            ?.filter((c) => c.type === "text")
            .map((c) => ("text" in c ? c.text : ""))
            .join("");
          throw new Error(`lint_skill failed: ${errText}`);
        }
        const text = lintResult.content?.find((c) => c.type === "text");
        expect(text && "text" in text && text.text.includes("reportId")).toBe(
          true,
        );
      } finally {
        await client.close();
      }
    },
    30_000,
  );
});
