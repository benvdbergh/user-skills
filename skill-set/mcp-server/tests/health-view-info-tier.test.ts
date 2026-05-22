import { describe, expect, it } from "vitest";
import {
  INFO_TIER_EMPTY_HINT,
  shouldShowInfoSummaryCard,
} from "../web/src/lib/healthView";

describe("healthView info tier (BEN-58)", () => {
  it("hides Info summary card when count is zero", () => {
    expect(shouldShowInfoSummaryCard(0)).toBe(false);
    expect(shouldShowInfoSummaryCard(1)).toBe(true);
  });

  it("uses spec-aligned empty hint copy", () => {
    expect(INFO_TIER_EMPTY_HINT).toMatch(/info-tier findings/i);
    expect(INFO_TIER_EMPTY_HINT).not.toMatch(/suggestion/i);
  });
});
