# WorkflowInit workflow

## When to use

- "workflow init", "initialize project", "start planning"

## Steps

1. Choose **context**: legacy `--project <name>`, `--root <dir>`, `--config <manifest.yaml>`, or cwd with `.project-planning.yaml`.
2. Resolve backlog SSOT: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot) (`delivery_tracker` in manifest).
3. Run **WorkflowInit** with `--brief`:
   - **`files`** — creates `Epics/`, `Stories/`, `brief.md`, manifest if missing.
   - **Tracker** (e.g. `linear`) — creates `brief.md`, `specs/`, manifest; **does not** create markdown backlog dirs. Record tracker in `brief.md`; optional [tracker-index.md](tracker-index.md).
4. Add or generate PRD/spec; [artifact-discovery.md](artifact-discovery.md) / **ScanSources.ts** as needed.
5. Shard per SSOT: [ShardFromSources.md](ShardFromSources.md).

## CLI

```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts \
  --project <name> \
  --brief "<description>"

bun run .../WorkflowInit.ts --root <path> --brief "<description>"

bun run .../WorkflowInit.ts --project <name> --action review
```

`WorkflowInit.ts` reads `delivery_tracker` from the manifest (same rules as above for init/review).

## Legacy profile

`--project` only → `$KNOWLEDGE_DIR/Projects/<name>/`; default `delivery_tracker: files` unless manifest specifies otherwise. See [quick-start.md](quick-start.md).
