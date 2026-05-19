# CreateEpic workflow

## When to use

- "create epic", "new epic", "add epic"

Resolve backlog SSOT: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot).

- **`files`** — steps below.
- **`linear`** — create a **project milestone** via [linear-adoption.md](linear-adoption.md) (no `Epic-*.md`).
- **Other trackers** — platform guide when available.

## Steps (`files` only)

1. Resolve planning context (`--project`, `--root`, or `--config`).
2. Gather epic name, description, priority.
3. Run **EpicManager** `create`.
4. Edit epic `.md` (`traces_to`, etc.).
5. Run **LintPlan.ts** before `ready`.

## CLI (`files` only)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts \
  --root <path> \
  --action create \
  --epic "<name>" \
  --description "<text>"
```

## Integration

- **specification** — PRD/spec in `traces_to` (markdown) or milestone description (tracker).
