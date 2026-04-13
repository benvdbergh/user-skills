# CI Performance and Cost Governance Reference

## Governance Objective
Balance fast feedback with predictable spend for runner minutes, artifact storage, and cache storage.

## Matrix Strategy Governance
- Use matrix only for meaningful compatibility dimensions.
- Use `max-parallel` to limit noisy fan-out and quota spikes.
- Use `fail-fast: true` for non-experimental lanes to reduce wasted runtime.
- Separate experimental dimensions with `continue-on-error` where appropriate.

## Caching Governance
- Cache dependency directories, not entire repositories.
- Build deterministic keys with lockfile hash and runner OS.
- Use restore keys from most-specific to least-specific.
- Review cache churn and avoid cache thrashing.
- Keep sensitive data out of cache paths.
- Default cache retention and storage limits:
  - Entries not accessed for 7 days are removed.
  - Default total cache size is 10 GB per repository unless raised.

## Artifact Governance
- Upload only artifacts required for debugging, compliance, or release handoff.
- Set `retention-days` per artifact class (short for CI intermediates, longer for releases).
- Keep artifact names stable for discoverability.
- Monitor storage because artifacts and caches contribute to billable usage pools.

## Billing Governance
- Public repos with standard runners and self-hosted runners are generally free.
- Private repos consume included minutes and storage by plan, then incur cost.
- Storage billing accrues hourly (GB-Hours), so early deletion limits future charges.
- Minutes and storage should be tracked against budgets and usage alerts.

## Recommended Policy Defaults
- Linux first for routine CI to minimize minute costs.
- PR CI artifact retention: 3-7 days.
- Main branch verification artifacts: 14-30 days.
- Release artifacts: policy-defined (for example, 90+ days if compliance requires).
- Cache limit: keep default unless data shows sustained eviction thrash.

## Source Links
- https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs
- https://docs.github.com/en/actions/reference/dependency-caching-reference
- https://docs.github.com/actions/using-workflows/storing-workflow-data-as-artifacts
- https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching
- https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
