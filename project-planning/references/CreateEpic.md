# CreateEpic workflow

## When to use

- "create epic", "new epic", "add epic", "add a themed outcome"

Resolve backlog SSOT, then **load that platform's file** ([SKILL.md § Platform guides](../SKILL.md#platform-guides)). Create the native item that file uses for a themed / large outcome. Do not apply files-platform prefixes unless the SSOT is `files`.

## Steps

1. Resolve `delivery_tracker`.
2. Load `references/<tracker>-adoption.md` (`files` → [files-adoption.md](files-adoption.md)).
3. Follow that file's create steps for the large-outcome type.

When SSOT is `files`, that means EpicManager + epic markdown ([files-adoption.md](files-adoption.md) scripts).

## CLI (`files` only)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts \
  --root <path> \
  --action create \
  --epic "<name>" \
  --description "<text>"
```

## Integration

- **specification** — PRD/spec in `traces_to` (files) or the native item's description (tracker).
