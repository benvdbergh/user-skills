---
name: ci-cd-governance
description: Defines and enforces CI/CD governance for GitHub Actions, including reusable workflows, least-privilege permissions, action pinning, required check policy, matrix and cache strategy, artifact retention, and cost controls. Use when designing, reviewing, or hardening CI/CD pipelines, branch protections, and workflow standards.
---

# CI/CD Governance

## Purpose
This skill standardizes GitHub Actions governance so delivery stays secure, reliable, and cost-aware at scale.

## When to Use
Use this skill when a user asks to:
- design or refactor GitHub Actions workflows
- harden workflow security or token permissions
- enforce reusable workflow patterns (`workflow_call`)
- map required checks to branch protection or rulesets
- improve matrix, caching, and artifact retention behavior
- reduce CI runtime cost and storage spend

## Core Governance Outcomes
- Reuse: common CI logic is centralized via reusable workflows.
- Security: workflows run with least privilege and pinned dependencies.
- Merge quality: branch protection required checks are explicit and stable.
- Efficiency: matrix and cache behavior is intentional, bounded, and observable.
- Cost: artifact/cache retention and runner usage are budget-aware.

## Operating Procedure
1. Discover current state.
   - Inspect `.github/workflows/*.yml`.
   - Identify duplicate logic, high-privilege jobs, unpinned actions, and unclear required checks.
2. Establish policy targets.
   - Define baseline `permissions`.
   - Define allowed action sourcing and pinning rules.
   - Define required checks map per protected branch.
   - Define retention and cache policy.
3. Implement with templates.
   - Introduce reusable workflows for common CI stages.
   - Apply workflow/job-level `permissions`.
   - Pin all third-party actions to full commit SHAs.
   - Normalize stable job names for required checks.
4. Verify governance.
   - Run `scripts/workflow_audit.py`.
   - Compare output against branch protection/rulesets.
   - Fix gaps before merge.

## Guardrails
- Default to `permissions: read-all` or explicit minimal scopes.
- Grant `id-token: write` only in jobs that perform OIDC federation.
- Do not use broad `secrets: inherit` unless explicitly justified.
- Avoid `pull_request_target` for untrusted fork code paths.
- Keep required check job names globally unique across workflows.
- Add `merge_group` trigger for checks that gate merge queue.

## Required Deliverables in Governance Reviews
- Reusable workflow map (`caller` -> `workflow_call`).
- Permission map (workflow default and per-job deltas).
- Action dependency inventory with pinning status.
- Branch/ruleset required checks mapping and coverage.
- Matrix/caching strategy rationale.
- Retention and cost controls with expected impact.

## Quick Implementation Patterns

### Reusable Workflow Caller
Use `assets/reusable-workflow-template.yml` as a baseline.

### Permissions Baseline
Use `assets/workflow-permissions-policy.md` to pick default + exceptions.

### Review Checklist
Run through `assets/ci-governance-checklist.md` before merging workflow changes.

### Optional Automated Audit
Run:

```bash
python scripts/workflow_audit.py --workflows .github/workflows
```

With required checks map:

```bash
python scripts/workflow_audit.py --workflows .github/workflows --required-checks required_checks.json
```

`required_checks.json` format:

```json
{
  "main": ["ci / lint", "ci / test (ubuntu-latest, 20)"],
  "release/*": ["release / verify"]
}
```

## Reference Files
- [Reusable workflows reference](references/reusable-workflows.md)
- [Actions security hardening reference](references/actions-security-hardening.md)
- [Required checks and branch policy reference](references/required-checks-and-branch-policy.md)
- [CI performance and cost reference](references/ci-performance-and-cost.md)

## Primary Source Links
- https://docs.github.com/en/actions/sharing-automations/reusing-workflows
- https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
- https://docs.github.com/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/troubleshooting-required-status-checks
- https://docs.github.com/en/actions/reference/dependency-caching-reference
- https://docs.github.com/actions/using-workflows/storing-workflow-data-as-artifacts
- https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
