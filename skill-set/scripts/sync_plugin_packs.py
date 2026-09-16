#!/usr/bin/env python3
"""Materialize Cursor / Agent plugin packs from skill-set/catalog/plugin-packs.json.

Canonical skill bodies stay at <skills-root>/<skill>/SKILL.md. This script writes:

- .cursor-plugin/marketplace.json
- .cursor-plugin/plugin.json (catch-all plugin at repo root)
- plugins/<pack>/.cursor-plugin/plugin.json
- plugins/<pack>/plugin.json (Agent Plugins manifest)
- plugins/<pack>/mcp.json
- plugins/<pack>/skills/<skill> → relative symlink (or copy with --copy)

Run from anywhere. Default skills root is the parent of skill-set/.

  python skill-set/scripts/sync_plugin_packs.py
  python skill-set/scripts/sync_plugin_packs.py --check
  python skill-set/scripts/sync_plugin_packs.py --copy
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

CATALOG_REL = Path("skill-set/catalog/plugin-packs.json")
MARKETPLACE_REL = Path(".cursor-plugin/marketplace.json")
ROOT_PLUGIN_REL = Path(".cursor-plugin/plugin.json")
AGENT_PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json"


def default_skills_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    path.write_text(text, encoding="utf-8")


def discover_skills(skills_root: Path) -> list[str]:
    names: list[str] = []
    for child in sorted(skills_root.iterdir()):
        if not child.is_dir() or child.name.startswith("."):
            continue
        if child.name in {"plugins", "node_modules"}:
            continue
        if (child / "SKILL.md").is_file():
            names.append(child.name)
    return names


def pack_skill_names(pack: dict, discovered: list[str]) -> list[str]:
    raw = pack.get("skills") or []
    if raw == ["*"]:
        return list(discovered)
    return list(raw)


def relative_skill_target(link_path: Path, skill_name: str, skills_root: Path) -> Path:
    target = (skills_root / skill_name).resolve()
    return Path(os_relpath(target, link_path.parent))


def os_relpath(target: Path, start: Path) -> str:
    return Path(os_path_rel(target, start)).as_posix()


def os_path_rel(target: Path, start: Path) -> str:
    import os

    return os.path.relpath(target, start)


def plugin_manifest(pack: dict, skills: list[str], *, agent_plugin: bool) -> dict:
    author = pack.get("author") or {}
    manifest: dict = {
        "name": pack["name"],
        "description": pack["description"],
        "version": pack.get("version") or "1.0.0",
        "author": {
            "name": author.get("name") or "Ben van den Bergh",
        },
        "license": pack.get("license") or "MIT",
        "keywords": pack.get("keywords") or [],
    }
    if agent_plugin:
        manifest = {
            "$schema": AGENT_PLUGIN_SCHEMA,
            **manifest,
        }
    else:
        if pack.get("kind") == "catch-all":
            manifest["skills"] = skills
        if pack.get("mcp"):
            manifest["mcpServers"] = "mcp.json"
    return manifest


def marketplace_document(catalog: dict, discovered: list[str]) -> dict:
    marketplace = catalog["marketplace"]
    plugins = []
    for pack in catalog["packs"]:
        entry = {
            "name": pack["name"],
            "source": pack["source"],
            "description": pack["description"],
            "version": pack.get("version") or marketplace.get("metadata", {}).get("version") or "1.0.0",
            "keywords": pack.get("keywords") or [],
        }
        if pack.get("kind") == "catch-all":
            entry["skills"] = pack_skill_names(pack, discovered)
        plugins.append(entry)
    return {
        "name": marketplace["name"],
        "owner": marketplace["owner"],
        "metadata": marketplace.get("metadata") or {},
        "plugins": plugins,
    }


def mcp_document(pack: dict) -> dict:
    mcp = pack.get("mcp") or {"mcpServers": {}}
    return {"$schema": MCP_SCHEMA, **mcp}


def sync_skill_pointer(
    link_path: Path, skill_name: str, skills_root: Path, *, copy: bool
) -> None:
    if link_path.exists() or link_path.is_symlink():
        if link_path.is_dir() and not link_path.is_symlink():
            shutil.rmtree(link_path)
        else:
            link_path.unlink()

    target = skills_root / skill_name
    if copy:
        shutil.copytree(target, link_path, symlinks=True)
        return

    rel = relative_skill_target(link_path, skill_name, skills_root)
    link_path.symlink_to(rel, target_is_directory=True)


def validate_catalog(catalog: dict, discovered: list[str]) -> list[str]:
    errors: list[str] = []
    packs = catalog.get("packs") or []
    if not packs:
        return ["plugin-packs.json has no packs"]

    seen_names: set[str] = set()
    assigned: dict[str, str] = {}
    discovered_set = set(discovered)

    for pack in packs:
        name = pack.get("name")
        if not name:
            errors.append("pack is missing name")
            continue
        if name in seen_names:
            errors.append(f"duplicate pack name: {name}")
        seen_names.add(name)

        source = pack.get("source")
        if not source:
            errors.append(f"{name}: missing source")
        elif source.startswith("/") or ".." in Path(source).parts:
            errors.append(f"{name}: source must be a relative path without '..': {source}")

        skills = pack_skill_names(pack, discovered)
        if pack.get("kind") == "catch-all":
            missing = [s for s in discovered if s not in skills]
            extra = [s for s in skills if s not in discovered_set]
            if missing:
                errors.append(f"{name}: catch-all missing skills: {', '.join(missing)}")
            if extra:
                errors.append(f"{name}: catch-all lists unknown skills: {', '.join(extra)}")
            continue

        if not skills:
            errors.append(f"{name}: pack has no skills")
        for skill in skills:
            if skill not in discovered_set:
                errors.append(f"{name}: unknown skill '{skill}'")
                continue
            owner = assigned.get(skill)
            if owner:
                errors.append(f"skill '{skill}' assigned to both {owner} and {name}")
            assigned[skill] = name

    unassigned = sorted(discovered_set - set(assigned))
    if unassigned:
        errors.append(
            "skills not assigned to any domain pack: " + ", ".join(unassigned)
        )
    return errors


def pointers_ok(pack: dict, skills_root: Path) -> list[str]:
    errors: list[str] = []
    if pack.get("kind") == "catch-all":
        return errors
    plugin_dir = skills_root / pack["source"]
    for skill in pack.get("skills") or []:
        pointer = plugin_dir / "skills" / skill
        skill_md = pointer / "SKILL.md"
        if not skill_md.is_file():
            errors.append(f"{pack['name']}: missing {pointer.relative_to(skills_root)}/SKILL.md")
    return errors


def write_pack(pack: dict, skills: list[str], skills_root: Path, author: dict, *, copy: bool) -> None:
    pack = {**pack, "author": pack.get("author") or author, "license": pack.get("license") or "MIT"}
    if pack.get("kind") == "catch-all":
        dump_json(skills_root / ROOT_PLUGIN_REL, plugin_manifest(pack, skills, agent_plugin=False))
        if pack.get("mcp"):
            dump_json(skills_root / "mcp.json", mcp_document(pack))
        return

    plugin_dir = skills_root / pack["source"]
    skills_dir = plugin_dir / "skills"
    if skills_dir.exists():
        for child in skills_dir.iterdir():
            if child.is_dir() and not child.is_symlink() and child.name not in skills:
                shutil.rmtree(child)
            elif child.is_symlink() and child.name not in skills:
                child.unlink()
    skills_dir.mkdir(parents=True, exist_ok=True)

    dump_json(plugin_dir / ".cursor-plugin" / "plugin.json", plugin_manifest(pack, skills, agent_plugin=False))
    dump_json(plugin_dir / "plugin.json", plugin_manifest(pack, skills, agent_plugin=True))
    dump_json(plugin_dir / "mcp.json", mcp_document(pack))

    for skill in skills:
        sync_skill_pointer(skills_dir / skill, skill, skills_root, copy=copy)


def expected_marketplace(catalog: dict, discovered: list[str]) -> dict:
    return marketplace_document(catalog, discovered)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("-s", "--skills-root", type=Path, default=None)
    parser.add_argument("--check", action="store_true", help="Validate without writing.")
    parser.add_argument("--copy", action="store_true", help="Copy skill trees into packs instead of symlinks.")
    args = parser.parse_args()

    skills_root = (args.skills_root or default_skills_root()).resolve()
    catalog_path = skills_root / CATALOG_REL
    if not catalog_path.is_file():
        print(f"missing catalog: {catalog_path}", file=sys.stderr)
        return 1

    catalog = load_json(catalog_path)
    discovered = discover_skills(skills_root)
    errors = validate_catalog(catalog, discovered)

    if args.check:
        marketplace_path = skills_root / MARKETPLACE_REL
        if not marketplace_path.is_file():
            errors.append(f"missing {MARKETPLACE_REL}")
        else:
            actual = load_json(marketplace_path)
            expected = expected_marketplace(catalog, discovered)
            if actual != expected:
                errors.append(f"{MARKETPLACE_REL} is out of date; re-run sync_plugin_packs.py")
        for pack in catalog["packs"]:
            errors.extend(pointers_ok(pack, skills_root))
            if pack.get("kind") == "catch-all":
                plugin_path = skills_root / ROOT_PLUGIN_REL
                if not plugin_path.is_file():
                    errors.append(f"missing {ROOT_PLUGIN_REL}")
        if errors:
            print("Validation failed:", file=sys.stderr)
            for err in errors:
                print(f"- {err}", file=sys.stderr)
            return 1
        print(f"Plugin packs OK ({len(discovered)} skills, {len(catalog['packs'])} plugins).")
        return 0

    if errors:
        print("Validation failed:", file=sys.stderr)
        for err in errors:
            print(f"- {err}", file=sys.stderr)
        return 1

    author = catalog.get("author") or {"name": "Ben van den Bergh"}
    dump_json(skills_root / MARKETPLACE_REL, expected_marketplace(catalog, discovered))
    for pack in catalog["packs"]:
        write_pack(pack, pack_skill_names(pack, discovered), skills_root, author, copy=args.copy)

    print(
        f"Wrote marketplace with {len(catalog['packs'])} plugins "
        f"covering {len(discovered)} skills "
        f"({'copies' if args.copy else 'symlinks'})."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
