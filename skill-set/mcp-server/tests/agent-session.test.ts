import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { agentSessionDir } from "../src/ai/generatedPaths.js";
import { redactSecrets } from "../src/ai/logRedaction.js";
import { RelationshipSuggestionAdvisor } from "../src/ai/RelationshipSuggestionAdvisor.js";
import { StubAgentSessionRunner } from "../src/ai/StubAgentSessionRunner.js";
import { RelationshipMapRepository } from "../src/repositories/RelationshipMapRepository.js";
import { loadConfig } from "../src/config/loadConfig.js";
import { ChangeProposalService } from "../src/domain/ChangeProposalService.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { createApi } from "../src/http/api.js";
import { createAgentServices } from "../src/http/createAgentServices.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

function loadFixtureAgentApi() {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-agent-"));
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
  const graph = new SkillGraphService(config, catalog);
  const health = new SkillHealthService(config, catalog);
  const { agent } = createAgentServices(config, catalog, {
    useStubRunner: true,
  });
  return {
    pkg,
    config,
    app: createApi({ config, catalog, graph, health, agent }),
    agent,
    catalog,
  };
}

describe("agent session (BEN-36)", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("redacts secrets in logs (NFR-010)", () => {
    const raw =
      "ANTHROPIC_API_KEY=sk-secret-123\nBearer eyJhbG.token\n";
    const redacted = redactSecrets(raw);
    expect(redacted).not.toContain("sk-secret-123");
    expect(redacted).not.toContain("eyJhbG");
    expect(redacted).toContain("[REDACTED]");
  });

  it("GET /api/agent/auth returns stub-friendly status", async () => {
    const { pkg, app } = loadFixtureAgentApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/agent/auth");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      auth: { authenticated: boolean; provider: string };
    };
    expect(body.auth.provider).toBe("none");
    expect(body.auth.authenticated).toBe(true);
  });

  it("POST /api/agent-sessions starts stub session with artifacts and proposal", async () => {
    const { pkg, config, app } = loadFixtureAgentApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/agent-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runtime: "stub",
        kind: "improve-skill",
        environmentId: "user",
        skillName: "demo-skill",
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      session: {
        id: string;
        status: string;
        proposalIds?: string[];
        runtime: string;
      };
    };
    expect(body.session.runtime).toBe("stub");
    expect(body.session.status).toBe("completed");
    expect(body.session.proposalIds?.length).toBe(1);

    const dir = agentSessionDir(config.skillsRoot, body.session.id);
    expect(fs.existsSync(path.join(dir, "manifest.json"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "log.txt"))).toBe(true);
    const log = fs.readFileSync(path.join(dir, "log.txt"), "utf8");
    expect(log).toContain("Stub session started");

    const statusRes = await app.request(
      `/api/agent-sessions/${body.session.id}`,
    );
    expect(statusRes.status).toBe(200);
    const statusBody = (await statusRes.json()) as {
      status: { logTail?: string; proposalIds?: string[] };
    };
    expect(statusBody.status.proposalIds?.length).toBe(1);
    expect(statusBody.status.logTail).toContain("completed");
  });

  it("POST returns 404 for unknown skill", async () => {
    const { pkg, app } = loadFixtureAgentApi();
    tempDirs.push(pkg);
    const res = await app.request("/api/agent-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "improve-skill",
        environmentId: "user",
        skillName: "missing-skill",
      }),
    });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/agent-sessions/:id returns session status", async () => {
    const { pkg, app } = loadFixtureAgentApi();
    tempDirs.push(pkg);
    const start = await app.request("/api/agent-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "validate-skill",
        environmentId: "user",
        skillName: "demo-skill",
        runtime: "stub",
      }),
    });
    const { session } = (await start.json()) as { session: { id: string } };
    const del = await app.request(`/api/agent-sessions/${session.id}`, {
      method: "DELETE",
    });
    expect(del.status).toBe(200);
    const body = (await del.json()) as { status: { status: string } };
    expect(["completed", "cancelled"]).toContain(body.status.status);
  });

  it("StubAgentSessionRunner cancel marks non-terminal sessions cancelled", async () => {
    const { pkg, config, catalog } = loadFixtureAgentApi();
    tempDirs.push(pkg);
    const prompts = new PromptSourceService(config);
    const proposals = new ChangeProposalService(config);
    const relationshipAdvisor = new RelationshipSuggestionAdvisor(
      catalog,
      new RelationshipMapRepository(config),
    );
    const runner = new StubAgentSessionRunner(
      config,
      catalog,
      prompts,
      proposals,
      relationshipAdvisor,
    );
    const session = await runner.start({
      kind: "improve-skill",
      environmentId: "user",
      skillName: "demo-skill",
      runtime: "stub",
    });
    const { readSessionManifest, writeSessionManifest } = await import(
      "../src/ai/agentSessionArtifacts.js"
    );
    const manifest = readSessionManifest(config, session.id)!;
    manifest.status = "running";
    writeSessionManifest(config, manifest);
    await runner.cancel(session.id);
    const status = await runner.getStatus(session.id);
    expect(status.status).toBe("cancelled");
  });

  it("StubAgentSessionRunner ingests patch via ChangeProposalService", async () => {
    const { pkg, config, catalog } = loadFixtureAgentApi();
    tempDirs.push(pkg);
    const prompts = new PromptSourceService(config);
    const proposals = new ChangeProposalService(config);
    const relationshipAdvisor = new RelationshipSuggestionAdvisor(
      catalog,
      new RelationshipMapRepository(config),
    );
    const runner = new StubAgentSessionRunner(
      config,
      catalog,
      prompts,
      proposals,
      relationshipAdvisor,
    );
    const session = await runner.start({
      kind: "improve-skill",
      environmentId: "user",
      skillName: "demo-skill",
      runtime: "stub",
    });
    const token = session.proposalIds?.[0];
    expect(token).toBeDefined();
    const proposal = proposals.get(token!);
    expect(proposal?.environmentId).toBe("user");
    expect(proposal?.skillName).toBe("demo-skill");
    expect(proposal?.fileChanges.length).toBeGreaterThan(0);
  });
});
