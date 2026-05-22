/** Extract skill folder name from a SKILL.md source path when possible. */
export function skillNameFromSourcePath(sourcePath: string): string | null {
  const normalized = sourcePath.replace(/\\/g, "/");
  const match = normalized.match(/(?:^|\/)([^/]+)\/SKILL\.md$/i);
  return match?.[1] ?? null;
}
