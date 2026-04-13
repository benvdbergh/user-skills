# Required Checks and Branch Policy Reference

## Governance Objective
Ensure merges to protected branches are blocked unless policy-defined checks pass on the latest valid commit context.

## Key Platform Facts
- Branch protection can require status checks before merge.
- Required checks can be strict (branch up to date) or loose.
- Required statuses must be successful, skipped, or neutral.
- Required checks must have run recently (last 7 days) to be selectable.
- If a workflow is skipped due to path/branch/message filtering, required checks can remain pending and block merge.
- Merge queue requires workflows to include `merge_group` trigger for required checks.

## Governance Rules
1. Define a required checks catalog per protected branch/ruleset.
2. Keep required check job names globally unique across all workflows.
3. Use stable job names and avoid frequent renaming.
4. Include `pull_request` and `merge_group` for workflows that emit required checks.
5. Avoid filtering patterns that skip required workflows for valid PRs.
6. Document expected source app for each required check where applicable.

## Mapping Template
- Branch/ruleset: `main`
  - Required checks:
    - `ci / lint`
    - `ci / unit-test (ubuntu-latest, 20)`
    - `ci / security-scan`
  - Trigger events:
    - `pull_request`
    - `merge_group`

## Anti-Patterns
- Duplicate job names in different workflows.
- Required checks generated only on `push` but not on `pull_request`.
- Required workflow skipped by path filter for common change paths.
- Missing merge queue trigger while merge queue is enabled.

## Source Links
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/troubleshooting-required-status-checks
- https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#merge_group
