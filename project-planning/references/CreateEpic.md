# CreateEpic workflow

## When to use

- "create epic", "new epic", "add epic"
- Manual epic creation outside of sharding

## Quality bar

Read [agile-foundations.md](agile-foundations.md) and [decomposition-patterns.md](decomposition-patterns.md). Set `traces_to` and `slice` in frontmatter per [frontmatter-schema.md](frontmatter-schema.md).

## Steps

1. Resolve planning context (`--project`, `--root`, or `--config`).
2. Gather epic name, description, priority.
3. Run **EpicManager** `create` (writes template under manifest `epics_dir`).
4. Edit the epic `.md` in place (replace `<!-- TODO -->`, set `traces_to`, etc.).
5. Run **LintPlan.ts** before marking items `ready`.

## CLI

```bash
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts \
  --root <path> \
  --action create \
  --epic "<name>" \
  --description "<text>"
# Legacy:
bun run .../EpicManager.ts --project <name> --action create --epic "..." --description "..."
```

## Integration

- **specification** — PRD/spec paths belong in `traces_to`.
- **StateManagement** — optional decision tracking.
