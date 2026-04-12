# Plan quality review

Use for “review plan”, “validate planning”, or before marking a milestone ready.

## Checklist

### Structure

- [ ] Epics have clear single-theme goals and `traces_to` where applicable.
- [ ] Stories are INVEST-aligned; prefer `slice: vertical` for user-facing work.
- [ ] `depends_on` is documented; no cycles (run `LintPlan.ts`).
- [ ] Every `status: ready` story has non-empty `traces_to` and testable `acceptance_criteria`.

### Duplication and gaps

- [ ] No duplicate story titles/ids; split or merge intentionally.
- [ ] No orphan stories (parent epic id exists or is explained).
- [ ] Platform-heavy horizontal work is justified in epic/story notes.

### Sources

- [ ] Source inventory from [artifact-discovery.md](artifact-discovery.md) is reflected in planning (not ignored).
- [ ] ADRs and PRD conflicts are called out, not papered over.

### Scripting

```bash
bun run $PAI_DIR/skills/project-planning/scripts/LintPlan.ts --root <path>
```

Fix reported errors before calling planning “complete.”

## Relation to PlanReview

This file is the **canonical** review checklist. [PlanReview.md](PlanReview.md) only routes here and to workflows.
