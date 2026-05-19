# PlanReview workflow

## When to use

- "review plan", "validate planning", "planning review"

Resolve backlog SSOT: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot). Use the matching checklist in [plan-quality-review.md](plan-quality-review.md).

## Steps (`delivery_tracker: files`)

1. **WorkflowInit** `--action review` (checks dirs when `files`).
2. **LintPlan.ts** on markdown backlog.
3. [plan-quality-review.md](plan-quality-review.md) — **files** section.

## Steps (tracker SSOT, e.g. `linear`)

1. Load [linear-adoption.md](linear-adoption.md).
2. Review milestones/issues via MCP — **files** section of plan-quality-review does not apply.
3. [plan-quality-review.md](plan-quality-review.md) — **tracker** section.
4. Optional [tracker-index.md](tracker-index.md).

## CLI (`files` only)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts --root <path> --action review
bun run $PAI_DIR/skills/project-planning/scripts/LintPlan.ts --root <path>
```
