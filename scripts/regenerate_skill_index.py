#!/usr/bin/env python3
"""
Regenerate skill-index.json from each top-level */SKILL.md YAML frontmatter.

Aligns with skill-set / Agent Skills L1 discovery: name + description (WHAT + WHEN)
are mirrored for index consumers (environment map, inventory refresh). Paths are
posix-style relative to the skills root.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml


def load_frontmatter(skill_md: Path) -> dict:
    text = skill_md.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    m = re.match(r"^---\s*\n(.*?)\n---\s*", text, re.DOTALL)
    if not m:
        return {}
    data = yaml.safe_load(m.group(1))
    return data if isinstance(data, dict) else {}


def extract_triggers(description: str) -> list[str]:
    if not description:
        return []
    d = " ".join(description.split())
    tail = d
    for marker in ("Use when", "USE WHEN", "use when"):
        idx = d.lower().find(marker.lower())
        if idx != -1:
            tail = d[idx + len(marker) :].strip()
            tail = re.sub(r"^[:\s.]+", "", tail)
            break

    parts = re.split(r",|\bor\b", tail, flags=re.IGNORECASE)
    triggers: list[str] = []
    for p in parts:
        t = p.strip().strip('."\'')
        t = re.sub(r"^[\s\-]+", "", t)
        if 2 < len(t) < 120:
            triggers.append(t)

    seen: set[str] = set()
    out: list[str] = []
    for t in triggers:
        k = t.lower()
        if k not in seen:
            seen.add(k)
            out.append(t)
    return out[:35]


def guess_workflows(skill_md: Path, body: str) -> list[str]:
    m = re.search(
        r"##\s+Workflow[^\n]*\n(.*?)(?=\n##\s|\Z)", body, re.DOTALL | re.IGNORECASE
    )
    if not m:
        return []
    chunk = m.group(1)
    files = re.findall(r"`(?:references|Workflows)/([^`]+\.md)`", chunk)
    w: list[str] = []
    for f in files:
        stem = Path(f).stem
        if stem not in w:
            w.append(stem)
    return w[:40]


def main() -> None:
    skills_root = Path(__file__).resolve().parent.parent
    skills_out: dict[str, dict] = {}
    always = 0
    deferred = 0

    for folder in sorted(skills_root.iterdir(), key=lambda p: p.name.lower()):
        if not folder.is_dir() or folder.name.startswith("."):
            continue
        sm = folder / "SKILL.md"
        if not sm.exists():
            continue

        fm = load_frontmatter(sm)
        folder_name = folder.name
        name = fm.get("name") or folder_name
        desc = fm.get("description")
        if isinstance(desc, str):
            full = " ".join(desc.split())
        else:
            full = str(desc or "")

        # Index tier = load/discovery strategy (L1), not product "core vs supporting".
        tier = "deferred"
        meta = fm.get("metadata")
        if isinstance(meta, dict):
            mt = str(meta.get("tier") or "").lower().strip()
            if mt in ("always", "always-loaded", "always_load", "pinned"):
                tier = "always"

        if tier == "always":
            always += 1
        else:
            deferred += 1

        full_text = sm.read_text(encoding="utf-8")
        body_rest = full_text
        if full_text.startswith("---"):
            parts = full_text.split("---", 2)
            if len(parts) >= 3:
                body_rest = parts[2]

        wf = guess_workflows(sm, body_rest)
        triggers = extract_triggers(full)

        skills_out[folder_name] = {
            "name": name,
            "path": f"{folder_name}/SKILL.md",
            "fullDescription": full,
            "triggers": triggers,
            "workflows": wf,
            "tier": tier,
        }

    idx = {
        "generated": datetime.now(timezone.utc)
        .isoformat()
        .replace("+00:00", "Z"),
        "totalSkills": len(skills_out),
        "alwaysLoadedCount": always,
        "deferredCount": deferred,
        "skills": dict(sorted(skills_out.items(), key=lambda x: x[0].lower())),
    }
    out_path = skills_root / "skill-index.json"
    out_path.write_text(
        json.dumps(idx, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"Wrote {out_path} with {len(skills_out)} skills (always={always}, deferred={deferred})")


if __name__ == "__main__":
    main()
