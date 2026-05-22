import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validationReportDir } from "../src/ai/generatedPaths.js";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { SkillValidationService } from "../src/domain/SkillValidationService.js";
import { LintReportSchema, ValidationReportSchema } from "../src/domain/types.js";
import { createApi } from "../src/http/api.js";
import { createValidationService } from "../src/http/createValidationServices.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");
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

function writeFixtureConfig(pkg: string, writesEnabled = false): void {
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot: FIXTURE_ROOT,
      writesEnabled,
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
      relationshipMapRelativePath:
        "skill-set/maps/skill-relationships.json",
    }),
  );
}

function loadFixtureValidation(writesEnabled = false): {
  pkg: string;
  validation: SkillValidationService;
  config: ReturnType<typeof loadConfig>;
  catalog: SkillCatalogService;
} {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-val-"));
  tempDirs.push(pkg);
  writeFixtureConfig(pkg, writesEnabled);
  const config = loadConfig(pkg);
  const catalog = new SkillCatalogService(config);
  const validation = new SkillValidationService(
    config,
    catalog,
    new PromptSourceService(config),
  );
  return { pkg, validation, config, catalog };
}

describe("SkillValidationService (BEN-32)", () => {
  it("lint_skill produces scored LintReport for demo-skill", () => {
    const { validation } = loadFixtureValidation();
    const report = validation.lint("user", "demo-skill");
    const parsed = LintReportSchema.parse(report);
    expect(parsed.environmentId).toBe("user");
    expect(parsed.skillName).toBe("demo-skill");
    expect(parsed.score).toBeGreaterThanOrEqual(0);
    expect(parsed.score).toBeLessThanOrEqual(100);
    expect(parsed.findings.some((f) => f.ruleId === "S6")).toBe(true);
    expect(parsed.findings.some((f) => f.ruleId === "M3")).toBe(true);
  });

  it("validate_skill loads rubric citations from PromptSourceService", async () => {
    const { validation } = loadFixtureValidation();
    const report = await validation.validate("user", "demo-skill");
    const parsed = ValidationReportSchema.parse(report);
    expect(parsed.rubricTemplateId).toBe("validate-skill-effectiveness");
    expect(parsed.rubricCitations.length).toBeGreaterThanOrEqual(2);
    expect(
      parsed.rubricCitations.some((c) =>
        c.sourcePath.includes("validate.md"),
      ),
    ).toBe(true);
    expect(parsed.dimensions).toHaveLength(5);
    expect(parsed.findings.some((f) => f.ruleId === "SA6")).toBe(true);
  });

  it("persists reports when writesEnabled and persist=true", async () => {
    const { validation, config } = loadFixtureValidation(true);
    const lint = validation.lint("user", "demo-skill", { persist: true });
    expect(lint.persisted).toBe(true);

    const dir = validationReportDir(config.skillsRoot, "user", "demo-skill");
    expect(fs.existsSync(path.join(dir, `${lint.reportId}.json`))).toBe(true);
    expect(fs.existsSync(path.join(dir, "latest.json"))).toBe(true);

    const validationReport = await validation.validate("user", "demo-skill", {
      persist: true,
    });
    expect(validationReport.persisted).toBe(true);

    const latest = validation.getLatest("user", "demo-skill");
    expect(latest.validation?.reportId).toBe(validationReport.reportId);
  });

  it("compare returns dimension deltas between validation reports", async () => {
    const { validation } = loadFixtureValidation(true);
    const first = await validation.validate("user", "demo-skill", {
      persist: true,
    });
    const second = await validation.validate("user", "demo-skill", {
      persist: true,
    });
    const compare = validation.compare(
      "user",
      "demo-skill",
      first.reportId,
      second.reportId,
    );
    expect(compare.beforeId).toBe(first.reportId);
    expect(compare.afterId).toBe(second.reportId);
    expect(compare.dimensionDeltas).toHaveLength(5);
    expect(compare.dimensionDeltas.every((d) => typeof d.delta === "number")).toBe(
      true,
    );
  });
});

describe("HTTP validation routes", () => {
  it("POST /api/validation runs lint mode", async () => {
    const { validation, catalog, config } = loadFixtureValidation();
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    const app = createApi({ config, catalog, graph, health, validation });

    const res = await app.request("/api/validation/user/demo-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "lint" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { lint: { score: number } };
    expect(body.lint.score).toBeGreaterThanOrEqual(0);
  });

  it("GET latest returns 404 when nothing persisted", async () => {
    const { validation, catalog, config } = loadFixtureValidation();
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    const app = createApi({ config, catalog, graph, health, validation });

    const res = await app.request("/api/validation/user/demo-skill/latest");
    expect(res.status).toBe(404);
  });

  it("GET compare requires validation report ids", async () => {
    const { validation, catalog, config } = loadFixtureValidation(true);
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    const app = createApi({ config, catalog, graph, health, validation });

    const first = await validation.validate("user", "demo-skill", {
      persist: true,
    });
    const second = await validation.validate("user", "demo-skill", {
      persist: true,
    });

    const res = await app.request(
      `/api/validation/user/demo-skill/compare?beforeId=${first.reportId}&afterId=${second.reportId}`,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      compare: { dimensionDeltas: unknown[] };
    };
    expect(body.compare.dimensionDeltas).toHaveLength(5);
  });
});

describe("createValidationService", () => {
  it("wires PromptSourceService and catalog", () => {
    const { catalog, config } = loadFixtureValidation();
    const svc = createValidationService(config, catalog);
    const lint = svc.lint("user", "demo-skill");
    expect(LintReportSchema.safeParse(lint).success).toBe(true);
  });
});
