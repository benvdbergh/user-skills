import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

describe("catalog ingestion smoke (STORY-1-7, NFR-001)", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("loads index and environment map under 3s", () => {
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-smoke-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({
        skillsRoot: FIXTURE_ROOT,
        environmentMapRelativePath:
          "skill-set/catalog/environment-skill-index-map.json",
      }),
    );

    const start = performance.now();
    const config = loadConfig(pkg);
    const catalog = new SkillCatalogService(config);
    const envs = catalog.listEnvironments();
    const skills = catalog.listSkills();
    const elapsed = performance.now() - start;

    expect(envs.length).toBeGreaterThan(0);
    expect(skills.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(3000);
  });

  it("loads live skills repo when SKILL_LAB_SKILLS_ROOT is set", () => {
    const liveRoot = process.env.SKILL_LAB_SKILLS_ROOT;
    if (!liveRoot) return;

    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-live-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({ skillsRoot: liveRoot }),
    );

    const start = performance.now();
    const catalog = new SkillCatalogService(loadConfig(pkg));
    const skills = catalog.listSkills({ environmentId: "user" });
    const elapsed = performance.now() - start;

    expect(skills.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(3000);
  });
});
