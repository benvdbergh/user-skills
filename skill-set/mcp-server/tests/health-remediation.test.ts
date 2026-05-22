import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  resolveHealthRemediationPolicy,
  SKILL_DETAIL_ADVISOR_AGENT_KINDS,
} from "../src/domain/healthRemediationPolicy.js";

const webLib = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../web/src/lib/healthRemediation.ts",
);

const { viewRemediationFromFinding, agentDisabledReason } = await import(
  webLib
);

describe("resolveHealthRemediationPolicy", () => {
  it("maps catalog categories to manual copy only", () => {
    for (const category of ["environment", "index", "staleness"] as const) {
      expect(
        resolveHealthRemediationPolicy({
          category,
          skillName: undefined,
        }),
      ).toEqual({ primaryAction: "manual" });
    }
  });

  it("maps relationships without skill to manual only", () => {
    expect(
      resolveHealthRemediationPolicy({
        category: "relationships",
        skillName: undefined,
      }),
    ).toEqual({ primaryAction: "manual" });
  });

  it("maps relationships with skill to suggest-relationships", () => {
    expect(
      resolveHealthRemediationPolicy({
        category: "relationships",
        skillName: "demo-skill",
      }),
    ).toEqual({
      primaryAction: "agent",
      agentKind: "suggest-relationships",
    });
  });

  it("maps escalation to create-escalation when skill-scoped (AC-012)", () => {
    expect(
      resolveHealthRemediationPolicy({
        category: "escalation",
        skillName: "demo-skill",
      }),
    ).toEqual({
      primaryAction: "agent",
      agentKind: "create-escalation",
    });
  });

  it("maps references to improve-skill when skill-scoped", () => {
    expect(
      resolveHealthRemediationPolicy({
        category: "references",
        skillName: "demo-skill",
      }),
    ).toEqual({
      primaryAction: "agent",
      agentKind: "improve-skill",
    });
  });

  it("exposes skill-detail advisor kinds aligned with escalation and references", () => {
    expect(SKILL_DETAIL_ADVISOR_AGENT_KINDS).toEqual([
      "improve-skill",
      "create-escalation",
    ]);
  });
});

describe("viewRemediationFromFinding", () => {
  it("disables escalation agent with inline reason when skill missing (FR-048)", () => {
    const r = viewRemediationFromFinding(
      {
        primaryAction: "agent",
        agentKind: "create-escalation",
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
