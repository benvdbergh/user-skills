import { describe, expect, it } from "vitest";

/** Mirrors web/src/lib/skillFromPath.ts */
function skillNameFromSourcePath(sourcePath: string): string | null {
  const normalized = sourcePath.replace(/\\/g, "/");
  const match = normalized.match(/(?:^|\/)([^/]+)\/SKILL\.md$/i);
  return match?.[1] ?? null;
}

describe("skillNameFromSourcePath", () => {
  it("parses repo-relative SKILL.md paths", () => {
    expect(skillNameFromSourcePath("demo-skill/SKILL.md")).toBe("demo-skill");
    expect(skillNameFromSourcePath("skill-set/foo/SKILL.md")).toBe("foo");
  });

  it("parses absolute paths", () => {
    expect(
      skillNameFromSourcePath("C:/Users/me/skills/design/SKILL.md"),
    ).toBe("design");
  });

  it("returns null for non-skill paths", () => {
    expect(skillNameFromSourcePath("skill-index.json")).toBeNull();
    expect(
      skillNameFromSourcePath("skill-set/maps/skill-relationships.json"),
    ).toBeNull();
  });
});
