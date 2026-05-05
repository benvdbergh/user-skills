# Checkpoint

Create an annotated tag marking the current state (optional commit first).

## Usage

```bash
bun run $VC_SCRIPTS/CreateCheckpoint.ts --name "before-major-refactor"
bun run $VC_SCRIPTS/CreateCheckpoint.ts --name "stable-v1" --message "Stable baseline"
bun run $VC_SCRIPTS/CreateCheckpoint.ts --name "checkpoint" --commit-first
```

**Done when:** the tag exists (and optional commit was created).
