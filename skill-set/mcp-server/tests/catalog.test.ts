import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

function loadFixtureCatalog(): SkillCatalogService {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-test-"));
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot: FIXTURE_ROOT,
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
    }),
  );
  const config = loadConfig(pkg);
  return new SkillCatalogService(config);
}

describe("SkillCatalogService", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("lists skills from skill-index.json (FR-001, AC-002)", () => {
    const catalog = loadFixtureCatalog();
    const skills = catalog.listSkills({ environmentId: "user" });
    expect(skills.some((s) => s.name === "demo-skill")).toBe(true);
    expect(skills[0].environmentId).toBe("user");
  });

  it("returns skill detail with file references (FR-006–010)", () => {
    const catalog = loadFixtureCatalog();
    const detail = catalog.getSkillDetail("user", "demo-skill");
    expect(detail).not.toBeNull();
    expect(detail!.name).toBe("demo-skill");
    expect(detail!.missingReferences).toContain("references/validate.md");
    expect(detail!.hasSkillEscalation).toBe(false);
  });

  it("searches skills by query", () => {
    const catalog = loadFixtureCatalog();
    const hits = catalog.searchSkills({
      query: "catalog ingestion",
      environmentId: "user",
    });
    expect(hits.length).toBeGreaterThan(0);
  });
});
