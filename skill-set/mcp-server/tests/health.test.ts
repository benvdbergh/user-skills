import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { CatalogHealthReportSchema } from "../src/domain/types.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

function copyFixtureTree(targetRoot: string): void {
  fs.cpSync(FIXTURE_ROOT, targetRoot, { recursive: true });
}

function loadHealthFromRoot(skillsRoot: string): SkillHealthService {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-health-"));
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot,
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
      relationshipMapRelativePath:
        "skill-set/maps/skill-relationships.json",
    }),
  );
  const config = loadConfig(pkg);
  const catalog = new SkillCatalogService(config);
  return new SkillHealthService(config, catalog);
}

describe("SkillHealthService", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("getLatest returns null before scan and cached report after (NFR-002)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-health-cache-"));
    tempDirs.push(root);
    copyFixtureTree(root);
    fs.rmSync(path.join(root, ".generated", "health"), {
      recursive: true,
      force: true,
    });
    const health = loadHealthFromRoot(root);
    expect(health.getLatest()).toBeNull();

    const report = health.scan();
    const latest = health.getLatest();
    expect(latest).not.toBeNull();
    expect(latest?.scannedAt).toBe(report.scannedAt);
    expect(latest?.summary).toEqual(report.summary);
    expect(health.getLatest()).toBe(latest);
  });

  it("returns CatalogHealthReport with findings and summary (FR-016–020)", () => {
    const health = loadHealthFromRoot(FIXTURE_ROOT);
    const report = health.scan();
    expect(CatalogHealthReportSchema.safeParse(report).success).toBe(true);
    expect(report.scannedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(report.durationMs).toBeGreaterThanOrEqual(0);
    expect(report.summary.total).toBe(report.findings.length);

    const categories = new Set(report.findings.map((f) => f.category));
    expect(categories.has("escalation")).toBe(true);
    expect(categories.has("references")).toBe(true);
    expect(
      report.findings.some((f) => f.id.includes("demo-skill") && f.category === "escalation"),
    ).toBe(true);
    expect(
      report.findings.some(
        (f) => f.category === "references" && f.message.includes("validate.md"),
      ),
    ).toBe(true);
  });

  it("detects index count mismatches (FR-016)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-health-index-"));
    tempDirs.push(root);
    copyFixtureTree(root);
    const indexPath = path.join(root, "skill-index.json");
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8")) as Record<string, unknown>;
    index.totalSkills = 99;
    fs.writeFileSync(indexPath, JSON.stringify(index));

    const report = loadHealthFromRoot(root).scan();
    expect(
      report.findings.some(
        (f) => f.category === "index" && f.message.includes("totalSkills"),
      ),
    ).toBe(true);
  });

  it("detects unknown relationship endpoints (FR-017)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-health-rel-"));
    tempDirs.push(root);
    copyFixtureTree(root);
    const mapPath = path.join(
      root,
      "skill-set/maps/skill-relationships.json",
    );
    const map = JSON.parse(fs.readFileSync(mapPath, "utf8")) as {
      relationships: Array<Record<string, unknown>>;
    };
    map.relationships.push({
      id: "rel-unknown-endpoint",
      from_skill: "demo-skill",
      to_skill: "totally-unknown-partner",
      relationship_type: "may_call_or_wrap",
      mapping_is_approximate: true,
      confidence_score: 0.5,
    });
    fs.writeFileSync(mapPath, JSON.stringify(map));

    const report = loadHealthFromRoot(root).scan();
    expect(
      report.findings.some(
        (f) =>
          f.category === "relationships" &&
          f.message.includes("totally-unknown-partner"),
      ),
    ).toBe(true);
  });

  it("allows external endpoints matching map patterns (FR-017)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-health-ext-"));
    tempDirs.push(root);
    copyFixtureTree(root);
    const mapPath = path.join(
      root,
      "skill-set/maps/skill-relationships.json",
    );
    const map = JSON.parse(fs.readFileSync(mapPath, "utf8")) as Record<
      string,
      unknown
    >;
    map.external_endpoint_patterns = ["^custom-external-\\d+$"];
    (map as { relationships: Array<Record<string, unknown>> }).relationships.push({
      id: "rel-custom-external",
      from_skill: "demo-skill",
      to_skill: "custom-external-42",
      relationship_type: "shares_mcp_tool_script",
      mapping_is_approximate: false,
      confidence_score: 0.7,
    });
    fs.writeFileSync(mapPath, JSON.stringify(map));

    const report = loadHealthFromRoot(root).scan();
    expect(
      report.findings.some((f) => f.message.includes("custom-external-42")),
    ).toBe(false);
  });

  it("detects stale generated timestamps (FR-018)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-health-stale-"));
    tempDirs.push(root);
    copyFixtureTree(root);
    const indexPath = path.join(root, "skill-index.json");
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8")) as Record<
      string,
      unknown
    >;
    index.generated = "2020-01-01T00:00:00Z";
    fs.writeFileSync(indexPath, JSON.stringify(index));
    const future = new Date(Date.now() + 60_000);
    fs.utimesSync(indexPath, future, future);

    const report = loadHealthFromRoot(root).scan();
    expect(report.findings.some((f) => f.category === "staleness")).toBe(true);
  });

  it("detects non-resolvable environment paths (FR-019)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-health-env-"));
    tempDirs.push(root);
    copyFixtureTree(root);
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-health-pkg-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({
        skillsRoot: root,
        environmentMapRelativePath:
          "skill-set/catalog/environment-skill-index-map.json",
        relationshipMapRelativePath:
          "skill-set/maps/skill-relationships.json",
        environmentOverrides: {
          user: {
            path: "Z:/nonexistent-skill-lab-path",
            skillIndexPath: "Z:/nonexistent-skill-index.json",
          },
        },
      }),
    );
    const config = loadConfig(pkg);
    const health = new SkillHealthService(
      config,
      new SkillCatalogService(config),
    );
    const report = health.scan();
    expect(
      report.findings.some(
        (f) => f.category === "environment" && f.severity === "error",
      ),
    ).toBe(true);
  });

  it("completes scan within NFR-002 budget on fixture tree", () => {
    const health = loadHealthFromRoot(FIXTURE_ROOT);
    const report = health.scan();
    expect(report.durationMs).toBeLessThan(5_000);
  });
});
