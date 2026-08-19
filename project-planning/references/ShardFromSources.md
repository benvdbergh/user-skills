# ShardFromSources workflow

Break specifications into the configured platform's native work items using discovered sources—not only a single `PRD.md`.

## When to use

- User asks: “shard PRD”, “break down spec”, “epics from requirements”, “plan from docs”
- After [artifact-discovery.md](artifact-discovery.md) has identified inputs

Resolve backlog SSOT, then **load that platform's file** ([SKILL.md § Platform guides](../SKILL.md#platform-guides)).

## Mandatory preparation

1. Load [agile-foundations.md](agile-foundations.md) and [decomposition-patterns.md](decomposition-patterns.md).
2. Build a **source inventory** (`source_globs` + `ScanSources.ts` + user paths).
3. Apply **vertical slicing** where the material describes user outcomes.

## Steps

1. **Collect sources** — PRD/spec/ADRs.
2. **Propose a breakdown** — themed outcomes and INVEST-sized slices (methodology, not a prefix scheme).
3. **Create native items** — follow the platform file (markdown files, Linear milestones/issues, Jira types, …). Do not invent `EPIC-` / `STORY-` ids on a tracker.
4. **Validate** — [plan-quality-review.md](plan-quality-review.md); `LintPlan.ts` only when SSOT is `files`.

## CLI (`files` only)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/ShardFromSources.ts --root <path>
```

Do not run when a tracker is backlog SSOT — the script writes markdown epic/story files. Use the platform file instead.

## Integration

- **specification** / **research-analysis** — link requirements in the SSOT (markdown `traces_to` or tracker descriptions).
