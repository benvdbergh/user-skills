import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractTriggers,
  guessWorkflows,
  parseSkillMd,
} from "../src/domain/SkillMdParser.js";

const SKILL_MD = path.resolve(
  "tests/fixtures/minimal-skill/demo-skill/SKILL.md",
);

describe("SkillMdParser", () => {
  it("extracts triggers from Use when clause", () => {
    const triggers = extractTriggers(
      "Demo. Use when testing catalog ingestion, parsing workflows, or trigger extraction.",
    );
    expect(triggers).toContain("testing catalog ingestion");
    expect(triggers.length).toBeGreaterThan(0);
  });

  it("extracts workflows from routing table", () => {
    const body = `
## Workflow Routing
| Workflow | File |
| Validate | \`references/validate.md\` |
`;
    expect(guessWorkflows(body)).toContain("validate");
  });

  it("parses SKILL.md and detects missing refs", () => {
    const parsed = parseSkillMd(SKILL_MD);
    expect(parsed.name).toBe("demo-skill");
    expect(parsed.workflows).toContain("validate");
    expect(parsed.references.some((r) => r.relativePath.includes("guide.md"))).toBe(
      true,
    );
    expect(parsed.missingReferences).toContain("references/validate.md");
    expect(parsed.hasSkillEscalation).toBe(false);
  });
});
