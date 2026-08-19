# project-planning quick start

Check **backlog SSOT** in `.project-planning.yaml` → `delivery_tracker`, then load that platform file ([SKILL.md § Platform guides](../SKILL.md#platform-guides)).

- **Omitted or `files`** — commands below; prefixes and scripts: [files-adoption.md](files-adoption.md).
- **Any tracker** — plan with that platform's native types. Do **not** run Shard/EpicManager/StoryManager/LintPlan for backlog items.

## Manifest

Copy `assets/default.project-planning.yaml` to `.project-planning.yaml`. See [frontmatter-schema.md](frontmatter-schema.md).

## Commands (`delivery_tracker: files`)

```bash
# Init (creates Epics/, Stories/ when files is SSOT)
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts --root . --brief "My product"

bun run $PAI_DIR/skills/project-planning/scripts/ScanSources.ts --root .

bun run $PAI_DIR/skills/project-planning/scripts/ShardFromSources.ts --root .

bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts --root . --action create --epic "Auth" --description "..."
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts --root . --action create --story "Login" --epic "Auth" --description "..."

bun run $PAI_DIR/skills/project-planning/scripts/LintPlan.ts --root .
```

## Commands (tracker SSOT)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts --root . --brief "My product"
# Skips Epics/Stories dirs when delivery_tracker is not files

bun run $PAI_DIR/skills/project-planning/scripts/ScanSources.ts --root .
# Then create native items per references/<tracker>-adoption.md
```

## Legacy profile (`--project`)

`$KNOWLEDGE_DIR/Projects/<project>/`; default markdown backlog unless manifest sets `delivery_tracker`.

## Docs

- [agile-foundations.md](agile-foundations.md), [decomposition-patterns.md](decomposition-patterns.md)
- [ShardFromSources.md](ShardFromSources.md), [plan-quality-review.md](plan-quality-review.md)
