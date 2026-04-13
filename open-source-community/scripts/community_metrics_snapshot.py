#!/usr/bin/env python3
"""
Create a lightweight community metrics snapshot from a local git repository.

This script is intentionally simple and dependency-free.
It estimates a small set of indicators useful for quick health checks.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable


def run_git(args: list[str], repo: Path) -> str:
    cmd = ["git", "-C", str(repo)] + args
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or "git command failed")
    return proc.stdout


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a lightweight community metrics snapshot."
    )
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path("."),
        help="Path to a local git repository (default: current directory).",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=90,
        help="Lookback window in days (default: 90).",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("community_metrics_snapshot.json"),
        help="Output JSON file path.",
    )
    return parser.parse_args()


def commit_authors_since(repo: Path, since_iso: str) -> tuple[int, int]:
    out = run_git(["log", f"--since={since_iso}", "--format=%aN <%aE>"], repo)
    authors = [line.strip() for line in out.splitlines() if line.strip()]
    unique_authors = len(set(authors))
    return unique_authors, len(authors)


def first_seen_dates(repo: Path) -> dict[str, datetime]:
    out = run_git(["log", "--reverse", "--format=%aN <%aE>|%aI"], repo)
    first_seen: dict[str, datetime] = {}
    for line in out.splitlines():
        line = line.strip()
        if not line or "|" not in line:
            continue
        author, date_str = line.split("|", 1)
        if author in first_seen:
            continue
        first_seen[author] = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    return first_seen


def contributors_by_period(
    first_seen: dict[str, datetime], since_dt: datetime
) -> tuple[int, int]:
    new_contributors = 0
    existing_contributors = 0
    for _, first_date in first_seen.items():
        if first_date >= since_dt:
            new_contributors += 1
        else:
            existing_contributors += 1
    return new_contributors, existing_contributors


def issue_pr_counts_from_log(repo: Path, since_iso: str) -> Counter:
    out = run_git(["log", f"--since={since_iso}", "--format=%s"], repo)
    counter: Counter[str] = Counter()
    issue_pattern = re.compile(r"(?:#|issue\s+)(\d+)", re.IGNORECASE)
    pr_pattern = re.compile(r"(?:pull request|merge pull request|pr)\b", re.IGNORECASE)

    for subject in out.splitlines():
        s = subject.strip()
        if not s:
            continue
        if pr_pattern.search(s):
            counter["commit_subject_mentions_pr"] += 1
        if issue_pattern.search(s):
            counter["commit_subject_mentions_issue"] += 1
    return counter


def to_iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def main() -> None:
    args = parse_args()
    repo = args.repo.resolve()
    if not repo.exists():
        raise SystemExit(f"Repository path does not exist: {repo}")

    now = datetime.now(timezone.utc)
    since_dt = now - timedelta(days=args.days)
    since_iso = to_iso(since_dt)

    unique_authors_recent, commits_recent = commit_authors_since(repo, since_iso)
    first_seen = first_seen_dates(repo)
    new_contributors, existing_contributors = contributors_by_period(first_seen, since_dt)
    message_counts = issue_pr_counts_from_log(repo, since_iso)

    payload = {
        "generated_at": to_iso(now),
        "repository": str(repo),
        "lookback_days": args.days,
        "metrics": {
            "active_authors_recent": unique_authors_recent,
            "commits_recent": commits_recent,
            "new_contributors_lifetime_first_seen_within_window": new_contributors,
            "existing_contributors_lifetime_first_seen_before_window": existing_contributors,
            "commit_subject_mentions_issue": message_counts.get(
                "commit_subject_mentions_issue", 0
            ),
            "commit_subject_mentions_pr": message_counts.get(
                "commit_subject_mentions_pr", 0
            ),
        },
        "notes": [
            "This snapshot uses git history only.",
            "Issue and PR metrics are approximations based on commit subject patterns.",
            "For precise workflow metrics, combine with platform APIs and CHAOSS-aligned definitions.",
        ],
    }

    args.out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote snapshot: {args.out}")


if __name__ == "__main__":
    main()
