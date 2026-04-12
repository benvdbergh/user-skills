# WorkflowInit workflow

## When to use

- "workflow init", "initialize project", "start planning"

## Steps

1. Choose **context**: legacy `--project <name>` (`$KNOWLEDGE_DIR/Projects/<name>`), or `--root <dir>`, or `--config <manifest.yaml>`, or cwd with `.project-planning.yaml`.
2. Run **WorkflowInit** with `--brief` — creates dirs from manifest (default `Epics/`, `Stories/`), `brief.md`, optional `.project-planning.yaml` from skill default.
3. Add or generate PRD/spec; run [artifact-discovery.md](artifact-discovery.md) / **ScanSources.ts** as needed.
4. Shard with [ShardFromSources.md](ShardFromSources.md).

## CLI

```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts \
  --project <name> \
  --brief "<description>"

bun run .../WorkflowInit.ts --root <path> --brief "<description>"

bun run .../WorkflowInit.ts --project <name> --action review
```

## Legacy profile

`--project` only → same folder layout as before (`Epics/`, `Stories/`, `specs/`, `brief.md`). See [quick-start.md](quick-start.md).
