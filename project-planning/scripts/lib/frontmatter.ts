import { parse } from "yaml";
import type { ParsedFrontmatter } from "./types";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function splitFrontmatter(
  content: string
): { frontmatter: string | null; body: string } {
  const trimmed = content.replace(/^\uFEFF/, "");
  const m = trimmed.match(FRONTMATTER_RE);
  if (!m) {
    return { frontmatter: null, body: trimmed };
  }
  return { frontmatter: m[1], body: trimmed.slice(m[0].length) };
}

export function parseMarkdownFrontmatter(content: string): ParsedFrontmatter | null {
  const { frontmatter, body } = splitFrontmatter(content);
  if (frontmatter === null) {
    return null;
  }
  try {
    const data = parse(frontmatter) as Record<string, unknown>;
    return { raw: frontmatter, data };
  } catch {
    return null;
  }
}

export function getKind(data: Record<string, unknown>): string | undefined {
  if (typeof data.kind === "string") {
    return data.kind;
  }
  if (typeof data.type === "string") {
    return data.type;
  }
  return undefined;
}

export function getId(data: Record<string, unknown>): string | undefined {
  if (typeof data.id === "string") {
    return data.id;
  }
  if (typeof data.story_id === "string") {
    return data.story_id;
  }
  if (typeof data.epic_id === "string") {
    return data.epic_id;
  }
  return undefined;
}

export function getDependsOn(data: Record<string, unknown>): string[] {
  const d = data.depends_on;
  if (Array.isArray(d)) {
    return d.filter((x): x is string => typeof x === "string");
  }
  return [];
}

export function getStatus(data: Record<string, unknown>): string | undefined {
  return typeof data.status === "string" ? data.status : undefined;
}

export function hasTracesTo(data: Record<string, unknown>): boolean {
  const t = data.traces_to;
  if (!Array.isArray(t) || t.length === 0) {
    return false;
  }
  for (const item of t) {
    if (typeof item === "string" && item.trim()) {
      return true;
    }
    if (typeof item === "object" && item !== null && "path" in item) {
      const p = (item as { path?: string }).path;
      if (typeof p === "string" && p.trim()) {
        return true;
      }
    }
  }
  return false;
}
