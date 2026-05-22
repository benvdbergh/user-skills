import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const webLib = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../web/src/lib/healthRemediation.ts",
);

const { resolveHealthRemediation, agentDisabledReason } = await import(
  webLib
);

describe("resolveHealthRemediation", () => {
  it("maps catalog categories to manual copy only", () => {
    for (const category of ["environment", "index", "staleness"] as const) {
      const r = resolveHealthRemediation(
        { category, skillName: undefined, environmentId: undefined },
        "user",
      );
      expect(r.primary).toEqual({ mode: "manual", label: "Copy fix steps" });
      expect(r.agentDisabledReason).toBeNull();
    }
  });

  it("maps relationships without skill to manual only", () => {
    const r = resolveHealthRemediation(
      {
        category: "relationships",
        skillName: undefined,
        environmentId: "user",
      },
      "user",
    );
    expect(r.primary.mode).toBe("manual");
    expect(r.agentDisabledReason).toBeNull();
  });

  it("maps relationships with skill to suggest-relationships", () => {
    const r = resolveHealthRemediation(
      {
        category: "relationships",
        skillName: "demo-skill",
        environmentId: "user",
      },
      "user",
    );
    expect(r.primary).toEqual({
      mode: "agent",
      kind: "suggest-relationships",
      label: "Suggest relationships",
    });
    expect(r.agentDisabledReason).toBeNull();
  });

  it("maps escalation to create-escalation when skill-scoped (AC-012)", () => {
    const r = resolveHealthRemediation(
      {
        category: "escalation",
        skillName: "demo-skill",
        environmentId: "user",
      },
      "user",
    );
    expect(r.primary).toEqual({
      mode: "agent",
      kind: "create-escalation",
      label: "Draft escalation",
    });
    expect(r.agentDisabledReason).toBeNull();
  });

  it("maps references to improve-skill when skill-scoped", () => {
    const r = resolveHealthRemediation(
      {
        category: "references",
        skillName: "demo-skill",
        environmentId: "user",
      },
      "user",
    );
    expect(r.primary).toEqual({
      mode: "agent",
      kind: "improve-skill",
      label: "Improve description",
    });
    expect(r.agentDisabledReason).toBeNull();
  });

  it("disables escalation agent with inline reason when skill missing (FR-048)", () => {
    const r = resolveHealthRemediation(
      {
        category: "escalation",
        skillName: undefined,
        environmentId: "user",
      },
      "user",
    );
    expect(r.primary.mode).toBe("agent");
    expect(r.agentDisabledReason).toBe(
      agentDisabledReason("create-escalation", undefined, "user"),
    );
  });
});
