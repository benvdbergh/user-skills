import { describe, expect, it } from "vitest";
import {
  buildTaskPrompt,
  formatHealthFindingText,
} from "../src/ai/agentSessionCore.js";
import type { AgentTaskRequest } from "../src/domain/types.js";
import { loadConfig } from "../src/config/loadConfig.js";
import { PromptSourceService } from "../src/prompts/PromptSourceService.js";
import { SkillCatalogService } from "../src/domain/SkillCatalogService.js";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

function loadFixtureServices() {
  const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-task-"));
  fs.writeFileSync(
    path.join(pkg, "skill-lab.config.json"),
    JSON.stringify({
      skillsRoot: path.resolve("tests/fixtures/minimal-skill"),
      environmentMapRelativePath:
        "skill-set/catalog/environment-skill-index-map.json",
    }),
  );
  const config = loadConfig(pkg);
  return {
    prompts: new PromptSourceService(config),
    catalog: new SkillCatalogService(config),
  };
}

describe("agent session task prompt", () => {
  it("formatHealthFindingText formats scan outcome lines", () => {
    const text = formatHealthFindingText({
      category: "escalation",
      message: 'Skill "demo-skill" is missing references/skill-escalation.md.',
      recommendation:
        "Add references/skill-escalation.md per skill-set boundary standard.",
    });
    expect(text).toContain("Category: escalation");
    expect(text).toContain("Recommendation:");
  });

  it("buildTaskPrompt embeds health finding for create-escalation", () => {
    const { prompts, catalog } = loadFixtureServices();
    const request: AgentTaskRequest = {
      kind: "create-escalation",
      environmentId: "user",
      skillName: "demo-skill",
      healthFinding: {
        category: "escalation",
        message: "missing escalation file",
      },
    };
    const task = buildTaskPrompt(prompts, catalog, request);
    expect(task).toContain("Health scan finding");
    expect(task).toContain("missing escalation file");
    expect(task).toContain("Draft skill-escalation");
    expect(task).not.toContain("Authoring guide");
  });
});
