import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillDetailSchema, SkillSummarySchema } from "../src/domain/types.js";
import fs from "node:fs";
import path from "node:path";

/**
 * R0.1 milestone E2E — validates EPIC-1 exit criteria against the live skills repo.
 */
describe("R0.1 milestone E2E", () => {
  const packageRoot = path.resolve(".");
  const requiredDirs = [
    "src/domain",
    "src/repositories",
    "src/mcp",
    "src/http",
    "src/git",
    "src/ai",
    "src/prompts",
    "tests",
    "schemas",
    "docs",
  ];

  it("AC-001: package layout and start artifacts exist", () => {
    for (const dir of requiredDirs) {
      expect(fs.existsSync(path.join(packageRoot, dir))).toBe(true);
    }
    expect(fs.existsSync(path.join(packageRoot, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(packageRoot, "src/cli.ts"))).toBe(true);
    expect(fs.existsSync(path.join(packageRoot, "dist/cli.js"))).toBe(true);
  });

  it("AC-002: lists skills from skill-index.json with stable DTOs", () => {
    const config = loadConfig(packageRoot);
    const catalog = new SkillCatalogService(config);
    const skills = catalog.listSkills({ environmentId: "user" });
    expect(skills.length).toBeGreaterThan(0);
    for (const s of skills.slice(0, 5)) {
      expect(() => SkillSummarySchema.parse(s)).not.toThrow();
    }
  });

  it("US-020/021: get_skill_detail for skill-set", () => {
    const catalog = new SkillCatalogService(loadConfig(packageRoot));
    const detail = catalog.getSkillDetail("user", "skill-set");
    expect(detail).not.toBeNull();
    expect(() => SkillDetailSchema.parse(detail)).not.toThrow();
    expect(detail!.name).toBeTruthy();
    expect(detail!.sourcePath).toContain("SKILL.md");
  });

  it("Gate 2: architecture doc and JSON schemas present", () => {
    expect(fs.existsSync(path.join(packageRoot, "docs/architecture.md"))).toBe(
      true,
    );
    expect(
      fs.existsSync(path.join(packageRoot, "schemas/skill-summary.schema.json")),
    ).toBe(true);
  });

  it("NFR-001: catalog load under 3 seconds for user environment", () => {
    const start = performance.now();
    const catalog = new SkillCatalogService(loadConfig(packageRoot));
    catalog.listSkills({ environmentId: "user" });
    expect(performance.now() - start).toBeLessThan(3000);
  });
});
