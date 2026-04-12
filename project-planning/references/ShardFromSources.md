# ShardFromSources workflow

Break specifications into epics and stories using discovered sources—not only a single `PRD.md`.

## When to use

- User asks: “shard PRD”, “break down spec”, “epics from requirements”, “plan from docs”
- After [artifact-discovery.md](artifact-discovery.md) (or parallel) has identified inputs

## Mandatory preparation

1. Load [agile-foundations.md](agile-foundations.md) and [decomposition-patterns.md](decomposition-patterns.md).
2. Build a **source inventory** (manifest `source_globs` + `ScanSources.ts` + user paths).
3. Apply **vertical slicing** where the material describes user outcomes.

## Steps

1. **Resolve context** — Project root and `.project-planning.yaml` (`--root` / `--config` / legacy `--project`).
2. **Collect sources** — Read PRD/spec/architecture excerpts; note ADRs that constrain scope.
3. **Propose epics** — One theme per epic; set `traces_to` to PRD sections and ADRs.
4. **Propose stories** — INVEST-sized; `parent` = epic `id`; `depends_on` for real blockers.
5. **Write files** — Use epic/story templates under manifest directories; see [frontmatter-schema.md](frontmatter-schema.md).
6. **Validate** — Run `LintPlan.ts`; run [plan-quality-review.md](plan-quality-review.md).

## CLI

Legacy (Knowledge/Projects):

```bash
bun run $PAI_DIR/skills/project-planning/scripts/ShardFromSources.ts --project <name> [--prd <path>]
```

Manifest-based:

```bash
bun run $PAI_DIR/skills/project-planning/scripts/ShardFromSources.ts --root <path>
```

`ShardPRD.ts` remains a thin entry that delegates to the same implementation for backward compatibility.

## Integration

- **specification** skill produces PRDs/plans; reference them via paths in the manifest and `traces_to`.
- **research-analysis** topics may appear in `traces_to` when research gates scope.
