# PlanReview workflow

## When to use

- "review plan", "validate planning", "planning review"

## Steps

1. Run **WorkflowInit** `--action review` for a quick file/directory check.
2. Run **LintPlan.ts** on the project root for frontmatter, `depends_on` DAG, and `traces_to` for `ready` items.
3. Walk the full checklist in [plan-quality-review.md](plan-quality-review.md).

## CLI

```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts --project <name> --action review
bun run $PAI_DIR/skills/project-planning/scripts/LintPlan.ts --root <path>
```

The detailed checklist lives in **plan-quality-review.md** (canonical).
