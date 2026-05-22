import path from "node:path";
import type { ProposedFileChange } from "./types.js";

export class ProposalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProposalValidationError";
  }
}

/** Reject traversal and absolute paths before ingest (NFR-009). */
export function assertSafeProposalRelativePath(relativePath: string): void {
  const trimmed = relativePath.trim();
  if (!trimmed) {
    throw new ProposalValidationError("relativePath must be non-empty");
  }
  if (path.isAbsolute(trimmed) || /^[a-zA-Z]:[/\\]/.test(trimmed)) {
    throw new ProposalValidationError(
      "relativePath must be relative (no absolute paths)",
    );
  }
  const posix = trimmed.replace(/\\/g, "/");
  if (posix.startsWith("/")) {
    throw new ProposalValidationError(
      "relativePath must be relative (no absolute paths)",
    );
  }
  const segments = posix.split("/").filter((s) => s.length > 0);
  if (segments.some((s) => s === "..")) {
    throw new ProposalValidationError(
      "relativePath must not contain parent traversal (..)",
    );
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
  for (const change of fileChanges) {
    assertSafeProposalRelativePath(change.relativePath);
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
