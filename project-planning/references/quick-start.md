# project-planning quick start

## Manifest (recommended)

Copy `assets/default.project-planning.yaml` to your project root as `.project-planning.yaml` and adjust `defaults` / `source_globs`. See [frontmatter-schema.md](frontmatter-schema.md).

## Commands

```bash
# Init (cwd = project root, or use --root / --project)
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts --root . --brief "My product"

# List specification sources
bun run $PAI_DIR/skills/project-planning/scripts/ScanSources.ts --root .

# Shard PRD.md into epics
bun run $PAI_DIR/skills/project-planning/scripts/ShardFromSources.ts --root .

bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts --root . --action create --epic "Auth" --description "..."
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts --root . --action create --story "Login" --epic "Auth" --description "..."

bun run $PAI_DIR/skills/project-planning/scripts/LintPlan.ts --root .
```

## Legacy profile (`--project`)

Resolves to `$KNOWLEDGE_DIR/Projects/<project>/` (override with env `KNOWLEDGE_DIR`). Same default subdirs `Epics/`, `Stories/`, `specs/`, `brief.md`. No on-disk manifest required; behavior matches the pre-manifest scripts.

## Docs

- Agile / decomposition: [agile-foundations.md](agile-foundations.md), [decomposition-patterns.md](decomposition-patterns.md)
- Sharding: [ShardFromSources.md](ShardFromSources.md)
- Review: [plan-quality-review.md](plan-quality-review.md)
