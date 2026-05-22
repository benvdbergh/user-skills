import { describe, expect, it } from "vitest";

/** Mirrors web/src/lib/healthView environment scoping */
function filterFindingsByEnvironment(
  findings: { environmentId?: string }[],
  environmentId: string,
) {
  if (!environmentId) return findings;
  return findings.filter(
    (f) => !f.environmentId || f.environmentId === environmentId,
  );
}

describe("filterFindingsByEnvironment", () => {
  it("returns all when no environment filter", () => {
    const findings = [
      { environmentId: "a" },
      { environmentId: "b" },
      {},
    ];
    expect(filterFindingsByEnvironment(findings, "")).toHaveLength(3);
  });

  it("keeps matching and unscoped findings", () => {
    const findings = [
      { environmentId: "proj-a" },
      { environmentId: "proj-b" },
      {},
    ];
    expect(
      filterFindingsByEnvironment(findings, "proj-a"),
    ).toEqual([{ environmentId: "proj-a" }, {}]);
  });
});
