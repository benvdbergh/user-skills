import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { PathAccessError } from "../src/config/pathGuard.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";
import { SkillReferenceSource, extractSection } from "../src/prompts/SkillReferenceSource.js";
import { PROMPT_TEMPLATE_IDS } from "../src/prompts/templateSources.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");
const tempDirs: string[] = [];

afterEach(() => {
  for (const d of tempDirs.splice(0)) {
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
  }
});

function loadFixturePromptService(): PromptSourceService {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-prompt-"));
  tempDirs.push(pkg);
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot: FIXTURE_ROOT,
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
    }),
  );
  return new PromptSourceService(loadConfig(pkg));
}

describe("extractSection", () => {
  it("returns a named section when present", () => {
    const md = "# Title\n\n## When to Use\n\nBody line.\n\n## Other\n\nX";
    const { content, heading } = extractSection(md, "When to Use");
    expect(heading).toBe("When to Use");
    expect(content).toContain("Body line.");
    expect(content).not.toContain("## Other");
  });
});

describe("SkillReferenceSource", () => {
  it("lists skill-set reference and asset markdown paths", () => {
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "sl-ref-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({ skillsRoot: FIXTURE_ROOT }),
    );
    const refs = new SkillReferenceSource(loadConfig(pkg));
    expect(refs.listSkillSetMarkdown("references")).toContain(
      "skill-set/references/optimize.md",
    );
    expect(refs.listSkillSetMarkdown("assets")).toContain(
      "skill-set/assets/note.md",
    );
  });

  it("rejects paths outside allowedRoots (NFR-009)", () => {
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-guard-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({ skillsRoot: FIXTURE_ROOT }),
    );
    const config = loadConfig(pkg);
    const refs = new SkillReferenceSource(config);
    expect(() =>
      refs.readMarkdownFile("C:\\Windows\\System32\\drivers\\etc\\hosts"),
    ).toThrow(PathAccessError);
  });
});

describe("PromptSourceService", () => {
  it("loads skill-set and target skill sources", () => {
    const prompts = loadFixturePromptService();
    const skillSet = prompts.loadPromptSource({
      relativePath: "skill-set/SKILL.md",
    });
    expect(skillSet.content).toContain("skill-set (fixture)");

    const target = prompts.loadPromptSource(
      { relativePath: "demo-skill/SKILL.md" },
      { skillMdRelativePath: "demo-skill/SKILL.md" },
    );
    expect(target.content).toContain("Demo");
  });

  it("builds improve-skill-description bundle from references", () => {
    const prompts = loadFixturePromptService();
    const bundle = prompts.buildPromptBundle("improve-skill-description");
    expect(bundle.templateId).toBe("improve-skill-description");
    expect(bundle.sections.length).toBe(2);
    expect(bundle.assembledPrompt).toContain("Optimize (fixture)");
    expect(bundle.assembledPrompt).toContain("Authoring guide");
    expect(bundle.sourceRefs.map((r) => r.relativePath)).toEqual([
      "skill-set/references/optimize.md",
      "skill-set/references/authoring-guide.md",
    ]);
  });

  it("builds create-skill-escalation with target SKILL.md", () => {
    const prompts = loadFixturePromptService();
    const bundle = prompts.buildPromptBundle("create-skill-escalation", {
      skillMdRelativePath: "demo-skill/SKILL.md",
    });
    expect(bundle.sections.some((s) => s.content.includes("Demo"))).toBe(true);
    expect(bundle.sections.some((s) => s.content.includes("Draft skill-escalation"))).toBe(
      true,
    );
    expect(bundle.sourceRefs.map((r) => r.relativePath)).toContain(
      "skill-set/references/create-escalation.md",
    );
  });

  it("prepends health finding for create-skill-escalation", () => {
    const prompts = loadFixturePromptService();
    const bundle = prompts.buildPromptBundle("create-skill-escalation", {
      skillMdRelativePath: "demo-skill/SKILL.md",
      healthFindingText:
        "Category: escalation\nMessage: missing references/skill-escalation.md",
    });
    expect(bundle.sections[0]?.heading).toBe("Health scan finding");
    expect(bundle.assembledPrompt).toContain("Category: escalation");
  });

  it("supports all lifecycle template IDs", () => {
    const prompts = loadFixturePromptService();
    for (const id of PROMPT_TEMPLATE_IDS) {
      const ctx =
        id === "create-skill-escalation"
          ? { skillMdRelativePath: "demo-skill/SKILL.md" }
          : id === "analyze-trigger-conflicts"
            ? { triggerCatalogText: "demo-skill: testing catalog ingestion" }
            : {};
      const bundle = prompts.buildPromptBundle(id, ctx);
      expect(bundle.templateId).toBe(id);
      expect(bundle.assembledPrompt.length).toBeGreaterThan(0);
    }
  });

  it("resolveCitations returns posix paths and quotes", () => {
    const prompts = loadFixturePromptService();
    const citations = prompts.resolveCitations([
      { relativePath: "skill-set/references/lint.md" },
    ]);
    expect(citations[0].sourcePath).toBe("skill-set/references/lint.md");
    expect(citations[0].quote).toContain("Structural lint");
  });

  it("does not embed lifecycle rubric bodies in src (NFR-012)", () => {
    const srcDir = path.resolve("src");
    const forbidden = [
      "Improve skill descriptions and triggers from feedback.",
      "Structural lint rules for SKILL.md and references.",
    ];
    for (const snippet of forbidden) {
      const hits: string[] = [];
      const walk = (dir: string) => {
        for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
          const p = path.join(dir, ent.name);
          if (ent.isDirectory()) walk(p);
          else if (ent.name.endsWith(".ts") && fs.readFileSync(p, "utf8").includes(snippet)) {
            hits.push(p);
          }
        }
      };
      walk(srcDir);
      expect(hits).toEqual([]);
    }
  });
});
