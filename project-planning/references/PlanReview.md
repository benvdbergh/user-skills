# PlanReview workflow

## When to use

- "review plan", "validate planning", "planning review"

Resolve backlog SSOT, then **load that platform's file** ([SKILL.md § Platform guides](../SKILL.md#platform-guides)). Use the matching checklist in [plan-quality-review.md](plan-quality-review.md).

## Steps (`delivery_tracker: files`)

1. **WorkflowInit** `--action review` (checks dirs when `files`).
2. **LintPlan.ts** on markdown backlog.
3. [plan-quality-review.md](plan-quality-review.md) — **files** section.
4. [files-adoption.md](files-adoption.md) for prefix/id conventions.

## Steps (tracker SSOT)

1. Load `references/<tracker>-adoption.md`.
2. Review native items via that platform's MCP/API — **files** section of plan-quality-review does not apply.
3. [plan-quality-review.md](plan-quality-review.md) — **tracker** section.
4. Optional [tracker-index.md](tracker-index.md).

## CLI (`files` only)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts --root <path> --action review
bun run $PAI_DIR/skills/project-planning/scripts/LintPlan.ts --root <path>
```
