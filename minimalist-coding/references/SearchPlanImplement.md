# Search-Plan-Implement Workflow

Coding workflow: search → diff plan → execute → test → refactor. Tracker bookends live in [delivery-tracker-execution.md](delivery-tracker-execution.md).

## When to Use

- implement, code, add feature, modify
- Any change that touches the codebase

## Workflow Steps

### Phase 0 — Tracker (if work item in scope)

[delivery-tracker-execution.md](delivery-tracker-execution.md) **§ Pre-flight** and **§ Start**. Skip when ad-hoc with no linked item.

### Phase 1 — Architect

1. **Search** — `GrepSymbol`, semantic search; list relevant code.
2. **Dependencies** — `GetDependencies` for candidates; assess edit safety.
3. **Diff plan** — Locate → Modify → Create; JSON plan with file, lines, rationale.
4. **Validate** — minimal delta, no unnecessary new files.

### Phase 2 — Scripter

1. **Execute** — `MinimalDiffApply` or create only where planned.
2. **Test** — on failure, rollback via `version-control`.
3. **Refactor** — run [RefactorPass.md](RefactorPass.md).

### Phase 3 — Tracker (if work item in scope)

[delivery-tracker-execution.md](delivery-tracker-execution.md) **§ Close** — after RefactorPass and green tests.

## Output

- Changed files per diff plan
- Refactor / quality gate report
- Tracker updated when a work item was in scope
