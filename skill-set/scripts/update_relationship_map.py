#!/usr/bin/env python3
"""
Sync skill ID lists in maps/skill-relationships.json from canonical sources.

The relationship map (see skill-set SKILL.md § Catalog and Maps) is a *curated*
artifact for refactor planning and Agent Graph alignment: typed edges with
evidence quotes, confidence, and high-risk sequences are judgment-heavy and are
NOT auto-generated here.

This script only updates the machine-syncable parts:
  - skills.user_level — keys from <skills-root>/skill-index.json
  - skills.project_level_ai_vault — names from a project inventory JSON (optional)
  - sources.* paths — optional refresh to resolved paths you pass in
  - updated — ISO timestamp when writing

It also prints warnings when relationship endpoints are missing from the union
of those skill lists (stale renames, typos, or project-only skills).

Default layout matches update_skill_index.py: skills root = parent of skill-set/.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Relationship edges may name MCP servers, DBs, or tools as the "to" or "from"
# node; those are not listed in user_level / project_level skill IDs.
_EXTERNAL_ENDPOINT = re.compile(
    r"^(?:user-|plugin-|neo4j$|.*-server$|.*-mcp$)",
    re.IGNORECASE,
)


def default_skills_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent


def default_relationship_map_path() -> Path:
    return Path(__file__).resolve().parent.parent / "maps" / "skill-relationships.json"


def default_project_inventory_path(skills_root: Path) -> Path | None:
    p = skills_root / "skill-set" / "catalog" / "ai-vault-skill-inventory.json"
    return p if p.is_file() else None


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data: dict) -> None:
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def project_skill_names(inventory: dict) -> list[str]:
    skills = inventory.get("skills")
    if not isinstance(skills, list):
        return []
    names: list[str] = []
    for item in skills:
        if isinstance(item, dict) and item.get("name"):
            names.append(str(item["name"]).strip())
    return names


def validate_endpoints(
    relationships: list,
    known: set[str],
) -> list[str]:
    warnings: list[str] = []
    for rel in relationships:
        if not isinstance(rel, dict):
            continue
        rid = rel.get("id", "?")
        for field in ("from_skill", "to_skill"):
            name = rel.get(field)
            if not name or name in known:
                continue
            if _EXTERNAL_ENDPOINT.search(str(name)):
                continue
            warnings.append(
                f"{rel.get('id', rid)}: {field}={name!r} not in user_level or project_level lists"
            )
    return warnings


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Sync skill ID lists in skill-relationships.json from skill-index (+ optional inventory)."
    )
    parser.add_argument(
        "--skills-root",
        "-s",
        type=Path,
        default=None,
        help="Folder with skill-index.json (default: parent of skill-set/).",
    )
    parser.add_argument(
        "--relationship-map",
        "-r",
        type=Path,
        default=None,
        help="Path to skill-relationships.json (default: skill-set/maps/...).",
    )
    parser.add_argument(
        "--project-inventory",
        "-p",
        type=Path,
        default=None,
        help="ai-vault-skill-inventory.json (or omit to use skill-set/catalog/ if present).",
    )
    parser.add_argument(
        "--no-project-inventory",
        action="store_true",
        help="Do not refresh project_level_* list even if a default inventory exists.",
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Validate endpoints only; do not write the map.",
    )
    args = parser.parse_args()

    skills_root = (args.skills_root or default_skills_root()).expanduser().resolve()
    rel_path = (args.relationship_map or default_relationship_map_path()).expanduser().resolve()

    if not skills_root.is_dir():
        print(f"error: not a directory: {skills_root}", file=sys.stderr)
        return 1
    if not rel_path.is_file():
        print(f"error: relationship map not found: {rel_path}", file=sys.stderr)
        return 1

    index_path = skills_root / "skill-index.json"
    if not index_path.is_file():
        print(f"error: skill-index.json missing: {index_path}", file=sys.stderr)
        return 1

    data = load_json(rel_path)
    index = load_json(index_path)
    skills_block = index.get("skills")
    if not isinstance(skills_block, dict):
        print("error: skill-index.json has no skills object", file=sys.stderr)
        return 1

    user_level = sorted(skills_block.keys(), key=str.lower)

    inv_path: Path | None = None
    project_level: list[str] = []
    if not args.no_project_inventory:
        inv_path = args.project_inventory
        if inv_path is not None:
            inv_path = inv_path.expanduser().resolve()
        else:
            cand = default_project_inventory_path(skills_root)
            inv_path = cand

        if inv_path and inv_path.is_file():
            inv = load_json(inv_path)
            project_level = sorted(project_skill_names(inv), key=str.lower)
        else:
            existing = data.get("skills", {}).get("project_level_ai_vault")
            if isinstance(existing, list):
                project_level = list(existing)

    if "skills" not in data or not isinstance(data["skills"], dict):
        data["skills"] = {}
    data["skills"]["user_level"] = user_level
    data["skills"]["project_level_ai_vault"] = project_level

    if "sources" not in data or not isinstance(data["sources"], dict):
        data["sources"] = {}
    data["sources"]["user_level_skill_index"] = str(index_path.resolve())
    if inv_path and inv_path.is_file():
        data["sources"]["project_level_inventory"] = str(inv_path.resolve())

    data["updated"] = (
        datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    )

    known = set(user_level) | set(project_level)
    rels = data.get("relationships")
    if not isinstance(rels, list):
        rels = []
    for w in validate_endpoints(rels, known):
        print(f"warning: {w}", file=sys.stderr)

    if args.check_only:
        print(
            f"check-only: {len(user_level)} user skills, {len(project_level)} project skills; "
            f"{len(rels)} relationships scanned"
        )
        return 0

    write_json(rel_path, data)
    print(
        f"Wrote {rel_path} (user_level={len(user_level)}, project_level={len(project_level)})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
