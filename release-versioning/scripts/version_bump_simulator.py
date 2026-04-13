#!/usr/bin/env python3
"""
Simple version bump simulator from conventional commit headers.

Usage:
  python scripts/version_bump_simulator.py --current 1.4.2 --commit "feat(api): add export"
  python scripts/version_bump_simulator.py --current 1.4.2 --file commits.txt
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from typing import Iterable, List


COMMIT_RE = re.compile(r"^(?P<type>[a-z]+)(\([^)]+\))?(?P<breaking>!)?:\s+.+$")
SEMVER_RE = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")


@dataclass(frozen=True)
class Decision:
    level: str
    reasons: List[str]


def parse_version(version: str) -> tuple[int, int, int]:
    if not SEMVER_RE.match(version):
        raise ValueError(f"Invalid version: {version}")
    major, minor, patch = version.split(".")
    return int(major), int(minor), int(patch)


def classify_commit(header: str) -> str | None:
    header = header.strip()
    if not header:
        return None

    match = COMMIT_RE.match(header)
    if not match:
        return None

    ctype = match.group("type")
    breaking = bool(match.group("breaking"))

    if breaking:
        return "major"
    if ctype == "feat":
        return "minor"
    if ctype in {"fix", "perf"}:
        return "patch"
    return None


def decide_bump(commits: Iterable[str]) -> Decision:
    reasons: List[str] = []
    level = "none"
    rank = {"none": 0, "patch": 1, "minor": 2, "major": 3}

    for line in commits:
        line = line.strip()
        if not line:
            continue
        bump = classify_commit(line)
        if bump:
            reasons.append(f"{bump}: {line}")
            if rank[bump] > rank[level]:
                level = bump

    return Decision(level=level, reasons=reasons)


def apply_bump(version: tuple[int, int, int], level: str) -> tuple[int, int, int]:
    major, minor, patch = version
    if level == "major":
        return major + 1, 0, 0
    if level == "minor":
        return major, minor + 1, 0
    if level == "patch":
        return major, minor, patch + 1
    return major, minor, patch


def read_commits(args: argparse.Namespace) -> List[str]:
    commits: List[str] = []
    for item in args.commit:
        commits.append(item)
    if args.file:
        with open(args.file, "r", encoding="utf-8") as handle:
            commits.extend(handle.readlines())
    return commits


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Simulate SemVer bump from commits.")
    parser.add_argument("--current", required=True, help="Current version, for example 1.2.3")
    parser.add_argument(
        "--commit",
        action="append",
        default=[],
        help="Commit header to include. Can be repeated.",
    )
    parser.add_argument("--file", help="Optional file with one commit header per line.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.commit and not args.file:
        parser.error("Provide at least one --commit or --file")

    try:
        current = parse_version(args.current)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    commits = read_commits(args)
    decision = decide_bump(commits)
    new_version = apply_bump(current, decision.level)

    print(f"current_version: {args.current}")
    print(f"recommended_bump: {decision.level}")
    print(f"next_version: {new_version[0]}.{new_version[1]}.{new_version[2]}")
    print("reasons:")
    if decision.reasons:
        for reason in decision.reasons:
            print(f"- {reason}")
    else:
        print("- none (no releasable commit found)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
