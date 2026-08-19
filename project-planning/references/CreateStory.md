# CreateStory workflow

## When to use

- "create story", "new story", "add story", "add a slice"

Resolve backlog SSOT, then **load that platform's file** ([SKILL.md § Platform guides](../SKILL.md#platform-guides)). Create the native item that file uses for an INVEST-sized deliverable. Do not apply files-platform prefixes unless the SSOT is `files`.

## Quality bar

**INVEST**, vertical slices ([agile-foundations.md](agile-foundations.md)), dependencies and traceability in the SSOT ([dependencies-and-sequencing.md](dependencies-and-sequencing.md), [traceability-and-sources.md](traceability-and-sources.md)).

## Steps

1. Resolve `delivery_tracker`.
2. Load `references/<tracker>-adoption.md` (`files` → [files-adoption.md](files-adoption.md)).
3. Follow that file's create steps for the deliverable type (parent grouping must exist).

When SSOT is `files`, that means StoryManager + story markdown ([files-adoption.md](files-adoption.md) scripts).

## CLI (`files` only)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts \
  --root <path> \
  --action create \
  --story "<name>" \
  --epic "<epic title>" \
  --description "<text>"
```
