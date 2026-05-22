import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const webLib = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../web/src/lib/agentSessionLabels.ts",
);

const { ADVISOR_SKILL_ACTIONS, agentSessionKindLabel, isClaudeRuntime } =
  await import(webLib);

describe("agentSessionLabels", () => {
  it("exposes advisor action labels aligned with Health CTAs", () => {
    expect(ADVISOR_SKILL_ACTIONS).toEqual([
      { kind: "improve-skill", label: "Improve description" },
      { kind: "create-escalation", label: "Draft escalation" },
    ]);
  });

  it("maps session kinds to human labels", () => {
    expect(agentSessionKindLabel("improve-skill")).toBe("Improve description");
    expect(agentSessionKindLabel("suggest-relationships")).toBe(
      "Suggest relationships",
    );
    expect(agentSessionKindLabel(undefined)).toBe("Advisor session");
  });

  it("detects Claude runtimes for auth preflight", () => {
    expect(isClaudeRuntime("claude-headless")).toBe(true);
    expect(isClaudeRuntime("claude-background")).toBe(true);
    expect(isClaudeRuntime("stub")).toBe(false);
  });
});
