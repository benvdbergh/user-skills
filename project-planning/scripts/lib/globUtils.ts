import { existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

function walkDir(dir: string, acc: string[]): void {
  if (!existsSync(dir)) {
    return;
  }
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    try {
      if (statSync(p).isDirectory()) {
        walkDir(p, acc);
      } else if (name.endsWith(".md")) {
        acc.push(p);
      }
    } catch {
      // skip unreadable
    }
  }
}

/**
 * Resolve simple manifest globs relative to project root.
 * Supports: `PRD.md`, `docs/**/*.md`, `**/adr/**/*.md` (treated as walk from root filtering path containing /adr/)
 */
export function expandSourceGlobs(projectRoot: string, globs: string[]): string[] {
  const seen = new Set<string>();
  const add = (paths: string[]) => {
    for (const p of paths) {
      seen.add(p);
    }
  };

  for (const pattern of globs) {
    const trimmed = pattern.replace(/\\/g, "/").trim();
    if (!trimmed.includes("*")) {
      const p = join(projectRoot, trimmed);
      if (existsSync(p) && statSync(p).isFile()) {
        add([p]);
      }
      continue;
    }

    if (trimmed.startsWith("**/")) {
      const rest = trimmed.slice(3);
      if (rest === "*.md" || rest.endsWith(".md")) {
        const acc: string[] = [];
        walkDir(projectRoot, acc);
        add(acc);
      } else if (rest.includes("**/")) {
        const segment = rest.split("/").filter((s) => s && s !== "**")[0];
        const acc: string[] = [];
        walkDir(projectRoot, acc);
        add(acc.filter((f) => relative(projectRoot, f).split(/[/\\]/).includes(segment)));
      }
      continue;
    }

    const parts = trimmed.split("**");
    if (parts.length >= 2) {
      const basePart = parts[0].replace(/\/$/, "");
      const base = basePart ? join(projectRoot, basePart) : projectRoot;
      const acc: string[] = [];
      walkDir(base, acc);
      add(acc);
      continue;
    }

    const singleStar = trimmed.split("*");
    if (singleStar.length === 2 && !trimmed.includes("**")) {
      const prefix = singleStar[0].replace(/\/$/, "");
      const base = join(projectRoot, prefix || ".");
      const acc: string[] = [];
      walkDir(base, acc);
      add(acc);
    }
  }

  return [...seen].sort();
}
