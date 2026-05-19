# ShardFromSources workflow

Break specifications into epics and stories using discovered sources—not only a single `PRD.md`.

## When to use

- User asks: “shard PRD”, “break down spec”, “epics from requirements”, “plan from docs”
- After [artifact-discovery.md](artifact-discovery.md) has identified inputs

Resolve backlog SSOT: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot) — then follow the matching section below.

## Mandatory preparation

1. Load [agile-foundations.md](agile-foundations.md) and [decomposition-patterns.md](decomposition-patterns.md).
2. Build a **source inventory** (`source_globs` + `ScanSources.ts` + user paths).
3. Apply **vertical slicing** where the material describes user outcomes.

## Steps (`delivery_tracker: files`)

1. **Resolve context** — Project root and `.project-planning.yaml`.
2. **Collect sources** — PRD/spec/ADRs.
3. **Propose epics** — `traces_to` to sources.
4. **Propose stories** — INVEST; `parent`; `depends_on`.
5. **Write files** — [frontmatter-schema.md](frontmatter-schema.md).
6. **Validate** — `LintPlan.ts`; [plan-quality-review.md](plan-quality-review.md) (files checklist).

## Steps (`delivery_tracker: linear`)

1. **Collect sources** — same as above.
2. **Propose epics/stories** — then create **milestones/issues** via [linear-adoption.md](linear-adoption.md) (no `Epic-*.md` / `Story-*.md`).
3. **Validate** — [plan-quality-review.md](plan-quality-review.md) (tracker checklist).

## CLI (`files` only)

```bash
bun run $PAI_DIR/skills/project-planning/scripts/ShardFromSources.ts --root <path>
```

Do not run when a tracker is backlog SSOT — the script writes markdown epic/story files.

## Integration

- **specification** / **research-analysis** — link requirements in SSOT (markdown `traces_to` or tracker descriptions).
