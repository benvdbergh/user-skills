---
name: repo-triage-pr-ops
description: >-
  Defines OSS issue and pull request operations for GitHub repositories:
  issue forms, PR templates, label taxonomy, triage states with SLAs, stale
  policy, CODEOWNERS routing, and maintainer response patterns. Use when the
  user asks to set up or improve repository triage, contributor intake, review
  routing, backlog hygiene, or maintainer communication workflows.
license: MIT
compatibility: "Python 3.10+ for optional scripts"
metadata:
  author: PAI
  version: 1.1.0
---

# repo-triage-pr-ops

Govern issue and PR operations for open source maintenance with explicit templates, routing, response SLAs, and backlog hygiene.

## Scope

- GitHub repository operations only (issues, pull requests, labels, CODEOWNERS, stale automation).
- Focus on repeatable maintainer process and contributor experience.
- Not a release-management or CI/CD skill, except where needed for triage automation.
- Not a support desk process for private customer tickets.
- Not a security incident response process (route security reports to private channels).

## Quick Start

1. Read `references/issue-forms-and-pr-templates.md`.
2. Apply templates from `assets/` to `.github/ISSUE_TEMPLATE/` and `.github/`.
3. Read `references/triage-sla-and-label-taxonomy.md` and implement labels from `assets/label-taxonomy.md`.
4. Read `references/codeowners-review-routing.md` and update `.github/CODEOWNERS`.
5. Read `references/stale-and-backlog-management.md` and add stale workflow rules.
6. Optionally run `scripts/triage_metrics.py --help` and baseline operational metrics.

## Topic Map

- Template setup and authoring: `references/issue-forms-and-pr-templates.md`
- Triage states, labels, and SLA behavior: `references/triage-sla-and-label-taxonomy.md`
- CODEOWNERS and review routing: `references/codeowners-review-routing.md`
- Stale policy and backlog lifecycle: `references/stale-and-backlog-management.md`
- Reusable repository artifacts: `assets/bug_report.yml`, `assets/feature_request.yml`, `assets/pull_request_template.md`, `assets/label-taxonomy.md`
- Optional SLA analytics script: `scripts/triage_metrics.py`

## Execution Workflow

### 1) Intake Design

- Require structured issue forms for bug and feature requests.
- Use PR template to enforce change summary, risk, test evidence, and issue linkage.
- Disable blank issues for non-maintainers and route support/security via `contact_links`.

### 2) Triage Classification

- Apply one label from each axis:
  - Type: bug/feature/docs/question/chore
  - Priority: p0/p1/p2/p3
  - Status: triage-needed/needs-info/accepted/in-progress/blocked/ready-for-review
  - Area: component or subsystem
- Start SLA timer at issue creation.
- Move to `needs-info` only with explicit maintainer question.

### 3) Routing and Review

- Assign based on `CODEOWNERS` with smallest stable ownership boundaries.
- Keep catch-all owners, but ensure high-churn paths have specific owners.
- Require code owner approval on protected branches for sensitive paths.

### 4) Backlog Hygiene

- Auto-mark stale after inactivity threshold.
- Exempt high-value labels (`security`, `p0`, `accepted`, `in-progress`, `pinned`).
- Close stale only after warning window with clear reopen policy.

### 5) Maintainer Response Patterns

- Respond quickly, briefly, and publicly.
- Acknowledge, classify, ask for missing data, and set expectation on next touchpoint.
- Close out-of-scope and duplicate items with links and polite rationale.

## Maintainer Response Macros

Use these concise patterns:

- Acknowledge + next action: "Thanks for reporting this. We labeled it `triage-needed` and will classify within 48h."
- Needs info: "Thanks. To reproduce, we need version, environment, and exact steps. Please reply within 14 days or this may be auto-closed as stale."
- Duplicate: "Thanks for the report. Tracking this in #1234 to keep context in one thread."
- Out of scope: "Thanks for the suggestion. This is out of current project scope (see roadmap/vision). We are closing for now."
- PR revision request: "Thanks for the contribution. Please address CI/test failures and update the risk section, then request re-review."

## Optional Script

`scripts/triage_metrics.py` is agent-callable and read-only:

- Purpose: summarize triage throughput and SLA compliance from GitHub Issues export JSON.
- Runtime: Python 3.10+, stdlib only.
- Help: `python scripts/triage_metrics.py --help`
- Typical run:
  - `python scripts/triage_metrics.py --input issues.json`
  - `python scripts/triage_metrics.py --input issues.json --sla-hours-first-response 48 --sla-days-close-needs-info 14`

## Quality Guardrails

- Keep terminology consistent: "issue", "pull request", "triage", "owner", "stale".
- Prefer one default process with explicit exceptions.
- Use forward slashes for all paths.
- Keep policy explainable in `CONTRIBUTING.md` with short rationale per rule.

## References

- `references/issue-forms-and-pr-templates.md`
- `references/triage-sla-and-label-taxonomy.md`
- `references/codeowners-review-routing.md`
- `references/stale-and-backlog-management.md`
- `assets/label-taxonomy.md`
- `assets/bug_report.yml`
- `assets/feature_request.yml`
- `assets/pull_request_template.md`
- `scripts/triage_metrics.py`
