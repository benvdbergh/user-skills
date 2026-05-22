import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const webLib = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../web/src/lib/agentAuthPreflight.ts",
);

const { claudeAuthBlockedMessage, shouldBlockAdvisorStart } = await import(
  webLib
);

describe("agentAuthPreflight", () => {
  it("blocks Claude runtime when not authenticated", () => {
    expect(
      shouldBlockAdvisorStart("claude-headless", {
        authenticated: false,
        provider: "claude",
      }),
    ).toBe(true);
    expect(
      shouldBlockAdvisorStart("stub", {
        authenticated: false,
        provider: "none",
      }),
    ).toBe(false);
    expect(
      shouldBlockAdvisorStart("claude-background", {
        authenticated: true,
        provider: "claude",
      }),
    ).toBe(false);
  });

  it("returns recovery message with optional server detail", () => {
    expect(claudeAuthBlockedMessage()).toContain("claude auth login");
    expect(claudeAuthBlockedMessage()).toContain("Stub (fixture)");
    expect(
      claudeAuthBlockedMessage({
        authenticated: false,
        provider: "claude",
        message: "Not logged in",
      }),
    ).toContain("Not logged in");
  });
});
