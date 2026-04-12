# CreateStory workflow

## When to use

- "create story", "new story", "add story"

## Quality bar

Apply **INVEST** and prefer **vertical** slices ([agile-foundations.md](agile-foundations.md)). Document **dependencies** ([dependencies-and-sequencing.md](dependencies-and-sequencing.md)) and **traceability** ([traceability-and-sources.md](traceability-and-sources.md)).

## Steps

1. Resolve planning context.
2. Identify parent epic (by title); ensure epic exists.
3. Run **StoryManager** `create`.
4. Edit the story `.md` in place: replace `<!-- TODO -->`, set `acceptance_criteria` and `traces_to` before `status: ready`.

## CLI

```bash
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts \
  --root <path> \
  --action create \
  --story "<name>" \
  --epic "<epic title>" \
  --description "<text>"
```

## Integration

Parent epic `id` (e.g. `EPIC-2`) is set in story frontmatter `parent`.
