# CreateStory workflow

## When to use

- "create story", "new story", "add story"

Resolve backlog SSOT: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot).

- **`files`** — steps below.
- **`linear`** — create an **issue** on the parent milestone — [linear-adoption.md](linear-adoption.md) (no `Story-*.md`).
- **Other trackers** — platform guide when available.

## Quality bar

**INVEST**, vertical slices ([agile-foundations.md](agile-foundations.md)), dependencies and traceability in the SSOT ([dependencies-and-sequencing.md](dependencies-and-sequencing.md), [traceability-and-sources.md](traceability-and-sources.md)).

## Steps (`files` only)

1. Resolve planning context.
2. Parent epic exists.
3. Run **StoryManager** `create`.
4. Edit story `.md`: `acceptance_criteria`, `traces_to`, then `status: ready`.
5. Run **LintPlan.ts** when marking `ready`.

## CLI (`files` only)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts \
  --root <path> \
  --action create \
  --story "<name>" \
  --epic "<epic title>" \
  --description "<text>"
```
