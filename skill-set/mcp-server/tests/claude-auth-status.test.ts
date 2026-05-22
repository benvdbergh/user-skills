import { describe, expect, it } from "vitest";
import { parseClaudeAuthStatus } from "../src/ai/claudeCli.js";

describe("parseClaudeAuthStatus", () => {
  it("accepts JSON loggedIn true (current Claude CLI)", () => {
    const stdout = `{
  "loggedIn": true,
  "authMethod": "claude.ai",
  "email": "user@example.com"
}`;
    expect(parseClaudeAuthStatus(stdout, "", 0)).toBe(true);
  });

  it("rejects JSON loggedIn false", () => {
    expect(
      parseClaudeAuthStatus('{"loggedIn":false}', "", 0),
    ).toBe(false);
  });

  it("accepts legacy prose output", () => {
    expect(
      parseClaudeAuthStatus("You are logged in to Claude Code\n", "", 0),
    ).toBe(true);
  });

  it("rejects non-zero exit", () => {
    expect(
      parseClaudeAuthStatus('{"loggedIn":true}', "", 1),
    ).toBe(false);
  });
});
