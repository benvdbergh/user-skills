import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { SkillFileRef } from "./types.js";

/** Same/stricter trigger extraction as skill-set/scripts/update_skill_index.py */
export function extractTriggers(description: string): string[] {
  if (!description) return [];
  const d = description.split(/\s+/).join(" ");
  let tail = d;
  for (const marker of ["Use when", "USE WHEN", "use when"]) {
    const idx = d.toLowerCase().indexOf(marker.toLowerCase());
    if (idx !== -1) {
      tail = d.slice(idx + marker.length).trim();
      tail = tail.replace(/^[:.\s]+/, "");
      break;
    }
  }

  const parts = tail.split(/,|\bor\b/i);
  const triggers: string[] = [];
  for (const p of parts) {
    let t = p.trim().replace(/^["'.]+|["'.]+$/g, "");
    t = t.replace(/^[\s-]+/, "");
    if (t.length > 2 && t.length < 120) triggers.push(t);
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of triggers) {
    const k = t.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(t);
    }
  }
  return out.slice(0, 35);
}

/** Workflow stems from ## Workflow section routing table links. */
export function guessWorkflows(body: string): string[] {
  const m = body.match(/##\s+Workflow[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!m) return [];
  const chunk = m[1];
  const files = [...chunk.matchAll(/`(?:references|Workflows)\/([^`]+\.md)`/g)];
  const w: string[] = [];
  for (const f of files) {
    const stem = path.basename(f[1], path.extname(f[1]));
    if (!w.includes(stem)) w.push(stem);
  }
  return w.slice(0, 40);
}

const REF_PATTERNS = [
  /`references\/([^`]+)`/g,
  /`scripts\/([^`]+)`/g,
  /`assets\/([^`]+)`/g,
  /\[([^\]]+)\]\(references\/([^)]+)\)/g,
  /\[([^\]]+)\]\(scripts\/([^)]+)\)/g,
  /\[([^\]]+)\]\(assets\/([^)]+)\)/g,
];

export interface ParsedSkillMd {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  allowedTools?: string;
  metadata?: Record<string, unknown>;
  tier: "always" | "deferred";
  triggers: string[];
  workflows: string[];
  references: SkillFileRef[];
  scripts: SkillFileRef[];
  assets: SkillFileRef[];
  hasSkillEscalation: boolean;
  missingReferences: string[];
}

function collectRefs(
  skillDir: string,
  body: string,
  kind: "reference" | "script" | "asset",
  subdir: string,
  pattern: RegExp,
): SkillFileRef[] {
  const refs: SkillFileRef[] = [];
  const seen = new Set<string>();
  for (const match of body.matchAll(pattern)) {
    const rel = match[1] ?? match[2];
    if (!rel || seen.has(`${kind}:${rel}`)) continue;
    seen.add(`${kind}:${rel}`);
    const full = path.join(skillDir, subdir, rel);
    refs.push({
      kind,
      relativePath: `${subdir}/${rel}`,
      exists: fs.existsSync(full),
    });
  }
  return refs;
}

export function parseSkillMd(
  skillMdPath: string,
  indexTier?: "always" | "deferred",
): ParsedSkillMd {
  const text = fs.readFileSync(skillMdPath, "utf8");
  const { data, content } = matter(text);
  const skillDir = path.dirname(skillMdPath);
  const folderName = path.basename(skillDir);

  const name = (data.name as string) || folderName;
  const descRaw = data.description;
  const description =
    typeof descRaw === "string"
      ? descRaw.split(/\s+/).join(" ")
      : String(descRaw ?? "");

  let tier: "always" | "deferred" = indexTier ?? "deferred";
  const meta = data.metadata;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const mt = String((meta as Record<string, unknown>).tier ?? "")
      .toLowerCase()
      .trim();
    if (["always", "always-loaded", "always_load", "pinned"].includes(mt)) {
      tier = "always";
    }
  }

  const triggers = extractTriggers(description);
  const workflows = guessWorkflows(content);

  const references = collectRefs(
    skillDir,
    content,
    "reference",
    "references",
    /`references\/([^`]+)`/g,
  );
  const scripts = collectRefs(
    skillDir,
    content,
    "script",
    "scripts",
    /`scripts\/([^`]+)`/g,
  );
  const assets = collectRefs(
    skillDir,
    content,
    "asset",
    "assets",
    /`assets\/([^`]+)`/g,
  );

  const escalationPath = path.join(skillDir, "references", "skill-escalation.md");
  const hasSkillEscalation = fs.existsSync(escalationPath);

  const missingReferences = [...references, ...scripts, ...assets]
    .filter((r) => !r.exists)
    .map((r) => r.relativePath);

  return {
    name,
    description,
    license: data.license as string | undefined,
    compatibility: data.compatibility as string | undefined,
    allowedTools: data["allowed-tools"] as string | undefined,
    metadata:
      meta && typeof meta === "object" && !Array.isArray(meta)
        ? (meta as Record<string, unknown>)
        : undefined,
    tier,
    triggers,
    workflows,
    references,
    scripts,
    assets,
    hasSkillEscalation,
    missingReferences,
  };
}
