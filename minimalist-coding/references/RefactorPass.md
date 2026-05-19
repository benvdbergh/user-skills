# Refactor Pass Workflow

Post-test cleanup before closing a work item in the tracker.

## When to Use

- After tests pass (end of SearchPlanImplement Phase 2)
- On explicit refactor or cleanup request

## Steps

1. **LintAndShrink** — unused imports, dead code, simplify.
2. **Complexity** — flag functions over threshold.
3. **CodeQualityGate** — lint score and complexity vs baseline.
4. **Report** — lines removed, metrics.

## Completion

Done when LintAndShrink and CodeQualityGate show no regressions. If a work item was in scope, run [delivery-tracker-execution.md](delivery-tracker-execution.md) **§ Close** next (not before refactor).

## Integration

- `version-control` — optional commit after close
- Tools: `LintAndShrink`, `CodeQualityGate` in `scripts/`
