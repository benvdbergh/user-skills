import fs from "node:fs";
import path from "node:path";

/** Normalize to forward slashes for stable DTOs and comparisons. */
export function toPosixPath(p: string): string {
  return p.replace(/\\/g, "/");
}

export function normalizePathInput(p: string): string {
  return path.normalize(p.trim());
}

export interface ResolvedPathInfo {
  raw: string;
  normalized: string;
  posix: string;
  resolved: string | null;
  resolvable: boolean;
}

export function resolvePathInfo(
  rawPath: string,
  baseDir?: string,
): ResolvedPathInfo {
  const normalized = normalizePathInput(rawPath);
  const posix = toPosixPath(normalized);
  try {
    const resolved = baseDir
      ? path.resolve(baseDir, normalized)
      : path.resolve(normalized);
    return {
      raw: rawPath,
      normalized,
      posix: toPosixPath(resolved),
      resolved,
      resolvable: fs.existsSync(resolved),
    };
  } catch {
    return {
      raw: rawPath,
      normalized,
      posix,
      resolved: null,
      resolvable: false,
    };
  }
}
