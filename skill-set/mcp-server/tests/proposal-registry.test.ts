import { describe, expect, it } from "vitest";
import { mergeProposalTokenLists } from "../web/src/lib/proposalRegistry.js";

describe("mergeProposalTokenLists", () => {
  it("dedupes server and session tokens preserving server-first order", () => {
    expect(
      mergeProposalTokenLists(
        ["b", "a"],
        ["a", "c"],
      ),
    ).toEqual(["b", "a", "c"]);
  });

  it("skips empty tokens", () => {
    expect(mergeProposalTokenLists(["", "x"], ["", "y"])).toEqual(["x", "y"]);
  });
});
