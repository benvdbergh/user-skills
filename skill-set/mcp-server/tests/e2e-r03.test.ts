import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import { SkillGraphService } from "../src/domain/SkillGraphService.js";
import { SkillHealthService } from "../src/domain/SkillHealthService.js";
import { createApi } from "../src/http/api.js";

/**
 * R0.3 milestone E2E — Read-Only Skill Lab Dashboard (EPIC-3).
 */
describe("R0.3 milestone E2E", () => {
  const packageRoot = path.resolve(".");

  function services() {
    const config = loadConfig(packageRoot);
    const catalog = new SkillCatalogService(config);
    const graph = new SkillGraphService(config, catalog);
    const health = new SkillHealthService(config, catalog);
    return { config, catalog, graph, health };
  }

  it("R0.3 layout: web package, routes, API modules, contract doc", () => {
    const required = [
      "web/package.json",
      "web/vite.config.ts",
      "web/index.html",
      "web/src/main.tsx",
      "web/src/App.tsx",
      "web/src/api/client.ts",
      "web/src/api/catalog.ts",
      "web/src/api/graph.ts",
      "web/src/api/health.ts",
      "web/src/components/SourceLink.tsx",
      "web/src/components/Layout.tsx",
      "web/src/components/EnvironmentSwitcher.tsx",
      "web/src/components/SkillGraphCanvas.tsx",
      "web/src/routes/CatalogPage.tsx",
      "web/src/routes/SkillDetailPage.tsx",
      "web/src/routes/GraphPage.tsx",
      "web/src/routes/HealthPage.tsx",
      "web/src/lib/sourceLink.ts",
      "docs/ui-api-compatibility.md",
    ];
    for (const rel of required) {
      expect(fs.existsSync(path.join(packageRoot, rel))).toBe(true);
    }
  });

  it("cli exposes serve command for combined dashboard (AC-004)", () => {
    const cliSrc = fs.readFileSync(
      path.join(packageRoot, "src/cli.ts"),
      "utf8",
    );
    expect(cliSrc).toContain('cmd === "serve"');
    expect(cliSrc).toContain("web/dist");

    const distCli = path.join(packageRoot, "dist/cli.js");
    expect(fs.existsSync(distCli)).toBe(true);
    const distSrc = fs.readFileSync(distCli, "utf8");
    expect(distSrc).toContain("serve");
  });

  it("http api supports SPA static fallback when staticDir is set", () => {
    const apiSrc = fs.readFileSync(
      path.join(packageRoot, "src/http/api.ts"),
      "utf8",
    );
    expect(apiSrc).toContain("registerDashboardStatic");
    expect(apiSrc).toContain("options?.staticDir");
  });

  it("root package.json defines web scripts", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    expect(pkg.scripts["web:install"]).toBeTruthy();
    expect(pkg.scripts["web:dev"]).toBeTruthy();
    expect(pkg.scripts["web:build"]).toBeTruthy();
  });

  it("web package depends on @xyflow/react for graph view", () => {
    const webPkg = JSON.parse(
      fs.readFileSync(path.join(packageRoot, "web/package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    expect(webPkg.dependencies["@xyflow/react"]).toBeTruthy();
  });

  it("ui-api-compatibility documents SourceLink and client rules", () => {
    const doc = fs.readFileSync(
      path.join(packageRoot, "docs/ui-api-compatibility.md"),
      "utf8",
    );
    expect(doc).toContain("Ignore unknown");
    expect(doc).toContain("SourceLink");
    expect(doc).toContain("VITE_IDE_LINK_SCHEME");
    expect(doc).toContain("skill-lab-ui");
  });

  it("HTTP API remains available for dashboard consumers (FR-040)", async () => {
    const { catalog, graph, health } = services();
    const app = createApi({ catalog, graph, health });

    const envRes = await app.request("/api/environments");
    expect(envRes.status).toBe(200);

    const skillsRes = await app.request("/api/skills");
    expect(skillsRes.status).toBe(200);

    const graphRes = await app.request("/api/graph?limit=10");
    expect(graphRes.status).toBe(200);

    const healthRes = await app.request("/api/health", { method: "POST" });
    expect(healthRes.status).toBe(200);
  });

  it(
    "web production build succeeds (smoke)",
    () => {
      execSync("npm run web:build", {
        cwd: packageRoot,
        stdio: "pipe",
        env: process.env,
      });
      expect(
        fs.existsSync(path.join(packageRoot, "web/dist/index.html")),
      ).toBe(true);
    },
    120_000,
  );
});
