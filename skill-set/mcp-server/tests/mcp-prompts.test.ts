import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import {
  buildPromptBundle,
  promptBundleToGetPromptResult,
  SKILL_LAB_MCP_PROMPT_NAMES,
} from "../src/mcp/prompts.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";
import { RelationshipMapRepository } from "../src/repositories/RelationshipMapRepository.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");
const tempDirs: string[] = [];

afterEach(() => {
  for (const d of tempDirs.splice(0)) {
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
  }
});

function loadFixturePromptDeps() {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-mcp-prompt-"));
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
  const prompts = new PromptSourceService(config);
  const relationshipMap = new RelationshipMapRepository(config);
  return { config, catalog, prompts, relationshipMap };
}

describe("MCP prompts (BEN-33)", () => {
  it("exposes six skill-lab prompt names (FR-037)", () => {
    expect(SKILL_LAB_MCP_PROMPT_NAMES).toEqual([
      "skill-lab/improve-skill-description",
      "skill-lab/create-skill-escalation",
      "skill-lab/validate-skill-effectiveness",
      "skill-lab/suggest-relationships",
      "skill-lab/analyze-trigger-conflicts",
      "skill-lab/synthesize-new-skill",
    ]);
  });

  it("builds improve-skill-description from PromptSourceService without hardcoded rubric", () => {
    const deps = loadFixturePromptDeps();
    const bundle = buildPromptBundle(deps, "improve-skill-description", {
      environmentId: "user",
      skillName: "demo-skill",
    });
    expect(bundle.assembledPrompt).toContain("Optimize (fixture)");
    expect(bundle.assembledPrompt).toContain("Authoring guide");
    expect(bundle.sourceRefs.every((r) => r.relativePath.includes("skill-set/"))).toBe(
      true,
    );
  });

  it("normalizes sourceRefs under skillSetRoot in GetPromptResult _meta", () => {
    const deps = loadFixturePromptDeps();
    const bundle = buildPromptBundle(deps, "validate-skill-effectiveness", {});
    expect(bundle.sourceRefs.map((r) => r.relativePath)).toEqual([
      "skill-set/references/validate.md",
      "skill-set/references/effectiveness-assessment.md",
    ]);

    const result = promptBundleToGetPromptResult(
      bundle,
      deps.config.skillSetRoot.replace(/\\/g, "/"),
    );
    expect(result.messages[0].content.type).toBe("text");
    if (result.messages[0].content.type === "text") {
      expect(result.messages[0].content.text).toBe(bundle.assembledPrompt);
    }
    const meta = result._meta as {
      skillSetRoot: string;
      sourceRefs: { relativePath: string }[];
    };
    expect(meta.skillSetRoot).toContain("skill-set");
    expect(meta.sourceRefs.every((r) => r.relativePath.startsWith("skill-set/"))).toBe(
      true,
    );
  });

  it("injects trigger catalog for analyze-trigger-conflicts", () => {
    const deps = loadFixturePromptDeps();
    const bundle = buildPromptBundle(deps, "analyze-trigger-conflicts", {});
    expect(
      bundle.sourceRefs.some((r) => r.relativePath === "skill-lab://catalog-triggers"),
    ).toBe(true);
    expect(bundle.assembledPrompt).toContain("demo-skill:");
  });

  it("requires skill target for create-skill-escalation", () => {
    const deps = loadFixturePromptDeps();
    expect(() =>
      buildPromptBundle(deps, "create-skill-escalation", {}),
    ).toThrow(/requires environmentId and skillName/);
  });
});
