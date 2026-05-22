/** Merge server proposal index with browser session registry (US-032). */
export function mergeProposalTokenLists(
  serverTokens: readonly string[],
  sessionTokens: readonly string[],
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const token of [...serverTokens, ...sessionTokens]) {
    if (!token || seen.has(token)) continue;
    seen.add(token);
    merged.push(token);
  }
  return merged;
}
