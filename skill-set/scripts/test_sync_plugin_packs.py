#!/usr/bin/env python3
"""Tests for plugin-pack catalog validation (no filesystem overlay required)."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sync_plugin_packs as spp  # noqa: E402


class ValidateCatalogTests(unittest.TestCase):
    def test_current_repo_catalog_covers_discovered_skills(self) -> None:
        root = spp.default_skills_root()
        catalog = spp.load_json(root / spp.CATALOG_REL)
        discovered = spp.discover_skills(root)
        self.assertGreaterEqual(len(discovered), 40)
        self.assertEqual(spp.validate_catalog(catalog, discovered), [])

    def test_unassigned_skill_is_an_error(self) -> None:
        catalog = {
            "packs": [
                {
                    "name": "user-skills",
                    "source": ".",
                    "kind": "catch-all",
                    "skills": ["*"],
                },
                {
                    "name": "user-skills-engineering",
                    "source": "plugins/engineering",
                    "kind": "pack",
                    "skills": ["version-control"],
                },
            ]
        }
        errors = spp.validate_catalog(catalog, ["version-control", "brand"])
        self.assertTrue(any("not assigned" in e for e in errors))

    def test_duplicate_assignment_is_an_error(self) -> None:
        catalog = {
            "packs": [
                {
                    "name": "user-skills",
                    "source": ".",
                    "kind": "catch-all",
                    "skills": ["*"],
                },
                {
                    "name": "a",
                    "source": "plugins/a",
                    "kind": "pack",
                    "skills": ["brand"],
                },
                {
                    "name": "b",
                    "source": "plugins/b",
                    "kind": "pack",
                    "skills": ["brand"],
                },
            ]
        }
        errors = spp.validate_catalog(catalog, ["brand"])
        self.assertTrue(any("both" in e for e in errors))

    def test_parent_path_in_source_is_rejected(self) -> None:
        catalog = {
            "packs": [
                {
                    "name": "sneaky",
                    "source": "../other",
                    "kind": "pack",
                    "skills": ["brand"],
                }
            ]
        }
        errors = spp.validate_catalog(catalog, ["brand"])
        self.assertTrue(any(".." in e for e in errors))


class OverlayCheckTests(unittest.TestCase):
    def test_generated_overlay_matches_catalog(self) -> None:
        root = spp.default_skills_root()
        catalog = spp.load_json(root / spp.CATALOG_REL)
        discovered = spp.discover_skills(root)
        marketplace = spp.load_json(root / spp.MARKETPLACE_REL)
        self.assertEqual(marketplace, spp.expected_marketplace(catalog, discovered))
        self.assertTrue((root / spp.ROOT_PLUGIN_REL).is_file())
        for pack in catalog["packs"]:
            self.assertEqual(spp.pointers_ok(pack, root), [])


if __name__ == "__main__":
    unittest.main()
