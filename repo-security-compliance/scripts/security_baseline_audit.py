#!/usr/bin/env python3
from __future__ import annotations
import argparse
from pathlib import Path

def read_text(p: Path) -> str:
    try:
        return p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return ''

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('repo', nargs='?', default='.')
    ns = ap.parse_args()
    repo = Path(ns.repo).resolve()
    checks = []
    sec = repo / 'SECURITY.md'
    checks.append(('security_md', sec.exists(), 'SECURITY.md exists' if sec.exists() else 'SECURITY.md missing'))
    dep = repo / '.github' / 'dependabot.yml'
    checks.append(('dependabot', dep.exists(), 'dependabot config present' if dep.exists() else 'dependabot config missing'))
    wfdir = repo / '.github' / 'workflows'
    has_scan = False
    if wfdir.exists():
        for wf in list(wfdir.glob('*.yml')) + list(wfdir.glob('*.yaml')):
            t = read_text(wf).lower()
            if 'codeql' in t or 'upload-sarif' in t or 'code-scanning' in t:
                has_scan = True
                break
    checks.append(('code_scanning', has_scan, 'scan workflow found' if has_scan else 'scan workflow not found'))
    passed = sum(1 for _, ok, _ in checks if ok)
    print(f'Checks passed: {passed}/{len(checks)}')
    for name, ok, detail in checks:
        print(f"[{'PASS' if ok else 'FAIL'}] {name}: {detail}")
    return 0 if passed == len(checks) else 1

if __name__ == '__main__':
    raise SystemExit(main())
