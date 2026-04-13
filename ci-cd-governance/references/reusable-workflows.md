# Reusable Workflows Governance Reference

## Why Reuse
Reusable workflows reduce duplication and centralize policy. Governance controls become easier to enforce when callers delegate to versioned workflow contracts.

## Authoritative Behavior
- Reusable workflows must live in `.github/workflows` (no subdirectories).
- Reuse requires `on: workflow_call`.
- Caller jobs reference reusable workflows with `jobs.<id>.uses`.
- Inputs and secrets are declared in called workflow under `on.workflow_call`.
- Reuse by SHA is safest for cross-repository calls.
- Nested workflows can only maintain or reduce permissions, not elevate them.

## Governance Rules
1. Standardize CI entry points via one or more reusable workflows:
   - `ci-verify.yml`
   - `security-scan.yml`
   - `release-verify.yml`
2. Treat reusable workflows as contracts:
   - strict typed inputs (`string`, `number`, `boolean`)
   - minimal explicit secrets
   - outputs for downstream jobs only when needed
3. Pin external reusable workflow refs to commit SHA for immutable behavior.
4. Avoid broad `secrets: inherit` by default. Use explicit secret maps where possible.
5. Maintain a compatibility matrix for callers when changing reusable workflow interfaces.

## Governance Checks
- Every caller job using `uses` references:
  - `./.github/workflows/<file>.yml` (same repo), or
  - `<org>/<repo>/.github/workflows/<file>.yml@<sha>`
- All `workflow_call` inputs have type + required semantics.
- Permission scopes in called workflow are minimal and documented.
- Breaking input/output changes are versioned with migration notes.

## Source Links
- https://docs.github.com/en/actions/sharing-automations/reusing-workflows
- https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onworkflow_call
- https://docs.github.com/en/actions/reference/reusable-workflows-reference
