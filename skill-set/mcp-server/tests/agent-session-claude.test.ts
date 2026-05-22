import { describe, expect, it } from "vitest";
import {
  buildClaudeSpawnArgs,
  buildResumeShellCommand,
  buildShortClaudePrompt,
} from "../src/ai/agentSessionClaude.js";
import type { SessionManifest } from "../src/ai/agentSessionArtifacts.js";
import type { SkillDetail } from "../src/domain/types.js";

const manifest: SessionManifest = {
  id: "00000000-0000-4000-8000-000000000001",
  status: "running",
  runtime: "claude-headless",
  kind: "improve-skill",
  environmentId: "user",
  skillName: "demo-skill",
  promptTemplateId: "improve-skill-description",
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const detail: SkillDetail = {
  environmentId: "user",
  scope: "user",
  name: "demo-skill",
  path: "demo-skill/SKILL.md",
  description: "Demo",
  triggers: [],
  workflows: [],
  tier: "deferred",
  health: "ok",
  descriptionLength: 4,
  references: [],
  scripts: [],
  assets: [],
  hasSkillEscalation: false,
  missingReferences: [],
  sourcePath: "demo-skill/SKILL.md",
};

describe("agent session Claude launch", () => {
  it("buildShortClaudePrompt names the fixed target skill", () => {
    const prompt = buildShortClaudePrompt(manifest, detail);
    expect(prompt.length).toBeLessThan(4000);
    expect(prompt).toContain('"demo-skill"');
    expect(prompt).toContain("do not ask which skill");
    expect(prompt).toContain("task.md");
    expect(prompt).toContain("propose_skill_patch");
    expect(prompt).toContain(manifest.id);
    expect(prompt.startsWith("Improve the agent skill")).toBe(true);
  });

  it("buildResumeShellCommand resumes by session id with task prompt", () => {
    const cmd = buildResumeShellCommand(
      "C:\\skills",
      "00000000-0000-4000-8000-000000000001",
      "claude-headless",
    );
    expect(cmd).toContain("claude --resume 00000000-0000-4000-8000-000000000001");
    expect(cmd).toContain("task.md");
    expect(cmd).not.toContain("--continue");
    expect(cmd).toContain("agent-sessions");
    expect(buildResumeShellCommand("C:\\skills", manifest.id, "stub")).toBeUndefined();
  });

  it("buildClaudeSpawnArgs omits prompt text (stdin only)", () => {
    const args = buildClaudeSpawnArgs("claude-headless", {
      mcpConfigPath: "C:\\tmp\\skill-lab.mcp.json",
      skillsRoot: "C:\\skills",
      sessionId: manifest.id,
    });
    expect(args).toEqual([
      "-p",
      "--session-id",
      manifest.id,
      "--add-dir",
      "C:\\skills",
      "--mcp-config",
      "C:\\tmp\\skill-lab.mcp.json",
      "--strict-mcp-config",
      "--permission-mode",
      "bypassPermissions",
    ]);
  });
});
