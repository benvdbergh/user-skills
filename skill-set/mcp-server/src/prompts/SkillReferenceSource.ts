import fs from "node:fs";
import path from "node:path";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import type { PromptSourceRef } from "../domain/types.js";
import { toPosixPath } from "../config/pathModel.js";

export type ReadPromptOptions = {
  /** Directory containing SKILL.md for target-skill-relative refs. */
  targetSkillRoot?: string;
};

export class SkillReferenceSource {
  constructor(private readonly config: SkillLabConfig) {}

  resolveAbsolutePath(relativePath: string, options: ReadPromptOptions = {}): string {
    const normalized = relativePath.replace(/\\/g, "/");
    let absolute: string;

    if (normalized.startsWith("skill-set/")) {
      absolute = path.resolve(this.config.skillsRoot, normalized);
    } else if (
      options.targetSkillRoot &&
      (normalized === "SKILL.md" ||
        normalized.startsWith("references/") ||
        normalized.startsWith("scripts/") ||
        normalized.startsWith("assets/"))
    ) {
      absolute = path.resolve(options.targetSkillRoot, normalized);
    } else if (
      normalized.startsWith("references/") ||
      normalized.startsWith("assets/")
    ) {
      absolute = path.resolve(this.config.skillSetRoot, normalized);
    } else {
      absolute = path.resolve(this.config.skillsRoot, normalized);
    }

    return assertPathUnderRoots(absolute, this.config.allowedRoots);
  }

  posixSourcePath(absolutePath: string): string {
    const rel = path.relative(this.config.skillsRoot, absolutePath);
    return toPosixPath(rel);
  }

  readMarkdownFile(absolutePath: string): string {
    assertPathUnderRoots(absolutePath, this.config.allowedRoots);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Prompt source not found: ${absolutePath}`);
    }
    return fs.readFileSync(absolutePath, "utf8");
  }

  readPromptRef(
    ref: PromptSourceRef,
    options: ReadPromptOptions = {},
  ): { content: string; sourcePath: string; heading?: string } {
    const absolute = this.resolveAbsolutePath(ref.relativePath, options);
    const raw = this.readMarkdownFile(absolute);
    const { content, heading } = extractSection(raw, ref.sectionHeading);
    return {
      content,
      sourcePath: this.posixSourcePath(absolute),
      heading,
    };
  }

  listSkillSetMarkdown(kind: "references" | "assets"): string[] {
    const dir = path.join(this.config.skillSetRoot, kind);
    if (!fs.existsSync(dir)) return [];
    assertPathUnderRoots(dir, this.config.allowedRoots);
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => toPosixPath(path.join("skill-set", kind, f)));
  }
}

/** Extract a markdown section by heading, or return full document. */
export function extractSection(
  markdown: string,
  sectionHeading?: string,
): { content: string; heading?: string } {
  if (!sectionHeading?.trim()) {
    return { content: markdown.trim() };
  }

  const target = sectionHeading.trim().toLowerCase();
  const lines = markdown.split(/\r?\n/);
  let start = -1;
  let level = 0;

  for (let i = 0; i < lines.length; i++) {
    const m = /^(#{1,6})\s+(.+)$/.exec(lines[i]);
    if (!m) continue;
    const title = m[2].trim().toLowerCase();
    if (title === target) {
      start = i;
      level = m[1].length;
      break;
    }
  }

  if (start < 0) {
    return { content: markdown.trim(), heading: sectionHeading };
  }

  const chunk: string[] = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    const m = /^(#{1,6})\s+/.exec(lines[i]);
    if (m && m[1].length <= level) break;
    chunk.push(lines[i]);
  }

  return {
    content: chunk.join("\n").trim(),
    heading: sectionHeading,
  };
}
