import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { ValidationReportSchema } from "../src/domain/types.js";
import { createAgentServices } from "../src/http/createAgentServices.js";
import { createValidationServices } from "../src/http/createValidationServices.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");
const tempDirs: string[] = [];

afterEach(() => {
  for (const d of tempDirs.splice(0)) {
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
  }
});

function loadFixtureComposition() {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-mcp-val-"));
  tempDirs.push(pkg);
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
  const { agent } = createAgentServices(config, catalog, {
    useStubRunner: true,
  });
  const { validation } = createValidationServices(config, catalog, agent);
  return { validation };
}

describe("MCP validation composition (FR-038, BEN-67)", () => {
  it("deep validate with stub agent sets deepValidateSessionId", async () => {
    const { validation } = loadFixtureComposition();
    const report = await validation.validate("user", "demo-skill", {
      deep: true,
    });
    const parsed = ValidationReportSchema.parse(report);
    expect(parsed.deepValidateSessionId).toBeDefined();
    expect(typeof parsed.deepValidateSessionId).toBe("string");
  });

  it("deep validate without agent omits deepValidateSessionId", async () => {
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-mcp-val-"));
    tempDirs.push(pkg);
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
    const { validation } = createValidationServices(config, catalog);
    const report = await validation.validate("user", "demo-skill", {
      deep: true,
    });
    expect(report.deepValidateSessionId).toBeUndefined();
  });
});
