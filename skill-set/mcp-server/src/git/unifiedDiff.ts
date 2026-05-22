/** Minimal unified diff for workbench preview (no external diff dependency). */
export function buildUnifiedDiff(
  relativePath: string,
  oldText: string,
  newText: string,
): string {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const header = `--- a/${relativePath}\n+++ b/${relativePath}\n`;
  if (oldText === newText) {
    return `${header}@@ -1,${oldLines.length} +1,${newLines.length} @@\n`;
  }

  const body: string[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    if (oldLine === newLine) {
      if (oldLine !== undefined) body.push(` ${oldLine}`);
      continue;
    }
    if (oldLine !== undefined) body.push(`-${oldLine}`);
    if (newLine !== undefined) body.push(`+${newLine}`);
  }

  const removed = oldLines.filter((l, i) => l !== newLines[i]).length;
  const added = newLines.filter((l, i) => l !== oldLines[i]).length;
  const hunkOld = Math.max(1, oldLines.length);
  const hunkNew = Math.max(1, newLines.length);
  return `${header}@@ -1,${hunkOld} +1,${hunkNew} @@\n${body.join("\n")}\n`;
}
