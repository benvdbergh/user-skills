#!/usr/bin/env python3
"""
Lightweight GitHub Actions workflow governance audit.

Checks:
- workflow-level permissions presence
- unpinned third-party actions
- workflow_call reusable workflow detection
- required checks mapping coverage (optional)
- artifact retention-days usage
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple

try:
    import yaml  # type: ignore
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency: pyyaml. Install with: pip install pyyaml"
    ) from exc


USES_RE = re.compile(r"^[^@]+@([A-Za-z0-9_.\-/]+)$")
FULL_SHA_RE = re.compile(r"^[0-9a-f]{40}$")


def load_yaml(path: Path) -> Dict:
    text = path.read_text(encoding="utf-8")
    data = yaml.safe_load(text)
    if not isinstance(data, dict):
        return {}
    return data


def find_workflows(root: Path) -> List[Path]:
    return sorted(
        [p for p in root.glob("*.yml")] + [p for p in root.glob("*.yaml")]
    )


def is_local_or_docker_use(uses_ref: str) -> bool:
    return uses_ref.startswith("./") or uses_ref.startswith("docker://")


def check_action_pinning(uses_ref: str) -> Tuple[bool, str]:
    match = USES_RE.match(uses_ref.strip())
    if not match:
        return False, "invalid uses syntax"
    ref = match.group(1)
    if is_local_or_docker_use(uses_ref):
        return True, "local-or-docker reference"
    if FULL_SHA_RE.match(ref):
        return True, "pinned-to-full-sha"
    return False, f"not pinned to full SHA ({ref})"


def collect_job_names(workflow: Dict) -> Set[str]:
    job_names: Set[str] = set()
    jobs = workflow.get("jobs", {})
    if not isinstance(jobs, dict):
        return job_names
    for job_id, job in jobs.items():
        if isinstance(job, dict):
            name = job.get("name") or str(job_id)
            job_names.add(str(name))
    return job_names


def audit_workflow(path: Path) -> Dict:
    data = load_yaml(path)
    findings = {
        "file": str(path),
        "workflow_call": False,
        "has_permissions": False,
        "unpinned_actions": [],
        "artifacts_without_retention_days": [],
        "job_names": [],
    }

    on_block = data.get("on")
    if isinstance(on_block, dict) and "workflow_call" in on_block:
        findings["workflow_call"] = True

    findings["has_permissions"] = "permissions" in data

    jobs = data.get("jobs", {})
    if not isinstance(jobs, dict):
        return findings

    findings["job_names"] = sorted(collect_job_names(data))

    for _, job in jobs.items():
        if not isinstance(job, dict):
            continue
        steps = job.get("steps", [])
        if not isinstance(steps, list):
            continue
        for step in steps:
            if not isinstance(step, dict):
                continue
            uses_ref = step.get("uses")
            if isinstance(uses_ref, str):
                ok, reason = check_action_pinning(uses_ref)
                if not ok and not is_local_or_docker_use(uses_ref):
                    findings["unpinned_actions"].append(
                        {"uses": uses_ref, "reason": reason}
                    )

                if uses_ref.startswith("actions/upload-artifact@"):
                    with_block = step.get("with", {})
                    if not isinstance(with_block, dict) or "retention-days" not in with_block:
                        findings["artifacts_without_retention_days"].append(
                            {"uses": uses_ref, "step": step.get("name", "<unnamed>")}
                        )
    return findings


def load_required_checks(path: Path) -> Dict[str, List[str]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("required checks file must contain a JSON object")
    normalized: Dict[str, List[str]] = {}
    for key, value in data.items():
        if not isinstance(key, str) or not isinstance(value, list):
            raise ValueError("required checks map must be branch pattern -> list of check names")
        normalized[key] = [str(v) for v in value]
    return normalized


def evaluate_required_checks(
    all_job_names: Set[str], required_checks: Dict[str, List[str]]
) -> Dict[str, List[str]]:
    missing: Dict[str, List[str]] = {}
    for branch, checks in required_checks.items():
        missing_for_branch = [c for c in checks if c not in all_job_names]
        if missing_for_branch:
            missing[branch] = missing_for_branch
    return missing


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit GitHub Actions workflow governance.")
    parser.add_argument(
        "--workflows",
        default=".github/workflows",
        help="Path to workflows directory (default: .github/workflows)",
    )
    parser.add_argument(
        "--required-checks",
        default="",
        help="Optional JSON file mapping branch pattern to required check names",
    )
    args = parser.parse_args()

    root = Path(args.workflows)
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Workflow directory not found: {root}")

    workflow_files = find_workflows(root)
    if not workflow_files:
        raise SystemExit(f"No workflow files found in: {root}")

    report: List[Dict] = []
    all_job_names: Set[str] = set()
    for file_path in workflow_files:
        findings = audit_workflow(file_path)
        report.append(findings)
        all_job_names.update(findings["job_names"])

    summary = {
        "total_workflows": len(report),
        "workflows_missing_permissions": [
            r["file"] for r in report if not r["has_permissions"]
        ],
        "workflows_with_workflow_call": [
            r["file"] for r in report if r["workflow_call"]
        ],
        "unpinned_action_count": sum(len(r["unpinned_actions"]) for r in report),
        "artifacts_missing_retention_days_count": sum(
            len(r["artifacts_without_retention_days"]) for r in report
        ),
    }

    output = {"summary": summary, "workflows": report}

    if args.required_checks:
        req = load_required_checks(Path(args.required_checks))
        missing = evaluate_required_checks(all_job_names, req)
        output["required_checks"] = {
            "configured_branches": list(req.keys()),
            "missing_checks_by_branch": missing,
        }

    print(json.dumps(output, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
