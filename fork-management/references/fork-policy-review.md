# ForkPolicyReview

Periodic review to ensure divergence remains intentional and affordable.

## Review Questions

1. Are all fork-only changes still needed?
2. Has parent now implemented equivalent functionality?
3. Which fork patches are strong candidates for upstream PRs?
4. Are there stale entries in `FORK.md` without recent review?

## Steps

1. Compare fork default branch against upstream default branch.
2. Group divergence by area/module.
3. Mark each ledger entry:
   - keep,
   - retire (can adopt parent),
   - upstream-candidate,
   - needs revalidation.
4. Update `FORK.md` with review outcomes and next review date.
5. Open follow-up tasks for retire/upstream-candidate items.

## Health Signals

- Good: low unresolved conflicts, frequent upstream sync, shrinking private patch set.
- Warning: growing undocumented divergence, repeated conflict hotspots, outdated fork policy.

**Done when:** every active divergence entry has an explicit current disposition and review date.
