# SyncFromParent

Bring parent changes into fork while preserving intentional customizations.

## Preconditions

- Working tree clean or intentionally stashed.
- `upstream` remote configured.
- `FORK.md` exists.

## Steps

1. Record pre-sync safety point.
   - Preferred: run `version-control` checkpoint workflow.
2. Fetch parent refs and inspect incoming delta.
3. Classify changed areas by decision model:
   - parent-only changes -> adopt parent.
   - fork-only changes -> keep fork.
   - both changed -> evaluate intent overlap.
4. Integrate parent branch (`merge` or `rebase` based on project policy).
5. Resolve conflicts using decision matrix:
   - equivalent fixes/features -> prefer parent implementation for lower maintenance.
   - fork-specific behavior -> keep fork implementation.
   - partial overlap -> create hybrid patch with explicit comments/notes.
6. Run project validation (typecheck/tests/build as relevant).
7. Update `FORK.md`:
   - sync date and upstream SHA,
   - per-area decision and reason,
   - unresolved follow-ups.

## Decision Matrix

| Situation | Default Decision | Rationale |
|-----------|------------------|-----------|
| Parent touched, fork did not | Adopt parent | Keep fork current with no local cost |
| Fork touched, parent did not | Keep fork | Preserve fork-specific value |
| Both touched, same problem | Prefer parent when quality equivalent | Reduce long-term patch load |
| Both touched, fork product need | Keep fork | Maintain product behavior |
| Both touched, partial overlap | Hybrid | Blend correctness and differentiation |

## Escalation Rules

- If conflict spans security/auth/core invariants, require explicit user confirmation before finalizing.
- If adopting parent would remove contractual fork behavior, keep fork and log an upstream issue/PR candidate.

**Done when:** fork is synchronized, validated, and `FORK.md` is updated with explicit decisions.
