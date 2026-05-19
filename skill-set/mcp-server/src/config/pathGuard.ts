import path from "node:path";

export class PathAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathAccessError";
  }
}

/** Ensure resolved target is under one of the configured roots (NFR-009). */
export function assertPathUnderRoots(
  targetPath: string,
  allowedRoots: string[],
): string {
  const resolved = path.resolve(targetPath);
  for (const root of allowedRoots) {
    const resolvedRoot = path.resolve(root);
    const rel = path.relative(resolvedRoot, resolved);
    if (rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))) {
      return resolved;
    }
  }
  throw new PathAccessError(
    `Path is outside configured skills roots: ${targetPath}`,
  );
}

export function isPathUnderRoots(
  targetPath: string,
  allowedRoots: string[],
): boolean {
  try {
    assertPathUnderRoots(targetPath, allowedRoots);
    return true;
  } catch {
    return false;
  }
}
