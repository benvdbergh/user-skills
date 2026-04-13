#!/usr/bin/env python3
"""
Lightweight local repository docs audit.

Checks presence/location of core docs and reports pass/fail summary.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple


SEARCH_DIRS = [".github", ".", "docs"]
README_CANDIDATES = ["README", "README.md", "README.rst", "README.txt"]


@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str


def existing_path(repo: Path, rel_options: Iterable[str]) -> Optional[Path]:
    for rel in rel_options:
        p = repo / rel
        if p.exists():
            return p
    return None


def doc_candidates(filename: str) -> List[str]:
    return [f"{base}/{filename}" if base != "." else filename for base in SEARCH_DIRS]


def find_readme(repo: Path) -> Optional[Path]:
    opts: List[str] = []
    for base in SEARCH_DIRS:
        for name in README_CANDIDATES:
            opts.append(f"{base}/{name}" if base != "." else name)
    return existing_path(repo, opts)


def find_one(repo: Path, filename: str) -> Optional[Path]:
    return existing_path(repo, doc_candidates(filename))


def check_file(repo: Path, display: str, filename: str) -> CheckResult:
    path = find_one(repo, filename)
    if path:
        return CheckResult(display, True, str(path.relative_to(repo)))
    return CheckResult(display, False, "not found in .github/, root, or docs/")


def check_issue_template(repo: Path) -> CheckResult:
    folder = repo / ".github" / "ISSUE_TEMPLATE"
    if not folder.exists() or not folder.is_dir():
        return CheckResult("Issue templates", False, ".github/ISSUE_TEMPLATE missing")

    matches: List[Path] = []
    for ext in ("*.md", "*.yml", "*.yaml"):
        matches.extend(folder.glob(ext))
    if matches:
        return CheckResult("Issue templates", True, f"{len(matches)} template file(s)")
    return CheckResult("Issue templates", False, "folder exists, but no template files")


def check_pr_template(repo: Path) -> CheckResult:
    options = [
        "pull_request_template.md",
        "PULL_REQUEST_TEMPLATE.md",
        ".github/pull_request_template.md",
        ".github/PULL_REQUEST_TEMPLATE.md",
        "docs/pull_request_template.md",
        "docs/PULL_REQUEST_TEMPLATE.md",
    ]
    path = existing_path(repo, options)
    if path:
        return CheckResult("PR template", True, str(path.relative_to(repo)))
    return CheckResult("PR template", False, "no supported template file found")


def check_readme_size(repo: Path) -> CheckResult:
    readme = find_readme(repo)
    if not readme:
        return CheckResult("README size <= 500 KiB", False, "README missing")
    size_bytes = readme.stat().st_size
    limit = 500 * 1024
    passed = size_bytes <= limit
    return CheckResult(
        "README size <= 500 KiB",
        passed,
        f"{readme.relative_to(repo)} ({size_bytes} bytes)",
    )


def run_audit(repo: Path) -> Tuple[List[CheckResult], int]:
    results: List[CheckResult] = []

    readme = find_readme(repo)
    results.append(
        CheckResult(
            "README",
            bool(readme),
            str(readme.relative_to(repo)) if readme else "README not found",
        )
    )
    results.append(check_file(repo, "LICENSE", "LICENSE"))
    results.append(check_file(repo, "CONTRIBUTING", "CONTRIBUTING.md"))
    results.append(check_file(repo, "CODE_OF_CONDUCT", "CODE_OF_CONDUCT.md"))
    results.append(check_file(repo, "SECURITY", "SECURITY.md"))
    results.append(check_file(repo, "SUPPORT", "SUPPORT.md"))
    results.append(check_issue_template(repo))
    results.append(check_pr_template(repo))
    results.append(check_readme_size(repo))

    failed = sum(1 for r in results if not r.passed)
    return results, failed


def print_results(results: List[CheckResult], failed: int) -> None:
    print("Repo Docs Audit")
    print("=" * 40)
    for result in results:
        status = "PASS" if result.passed else "FAIL"
        print(f"[{status}] {result.name}: {result.detail}")
    print("=" * 40)
    print(f"Total checks: {len(results)}")
    print(f"Failed checks: {failed}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit repository docs baseline.")
    parser.add_argument("--repo", default=".", help="Path to repository root")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not repo.exists() or not repo.is_dir():
        print(f"Repository path does not exist or is not a directory: {repo}")
        return 2

    results, failed = run_audit(repo)
    print_results(results, failed)
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
