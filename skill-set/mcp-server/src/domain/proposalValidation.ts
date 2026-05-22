import type { ProposedFileChange } from "./types.js";

export class ProposalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProposalValidationError";
  }
}

export function assertPatchFileChanges(
  kind: string,
  fileChanges: ProposedFileChange[],
): void {
  if (kind === "prompt-export") {
    return;
  }
  if (fileChanges.length === 0) {
    throw new ProposalValidationError(
      "Patch proposals require non-empty fileChanges (prompt-only completions are rejected)",
    );
  }
  const actionable = fileChanges.some(
    (c) =>
      (c.suggestedContent?.trim().length ?? 0) > 0 ||
      (c.unifiedDiff?.trim().length ?? 0) > 0,
  );
  if (!actionable) {
    throw new ProposalValidationError(
      "Each file change must include suggestedContent or unifiedDiff",
    );
  }
}
