# Quick start

Generic git helpers for any repository. Set `REPO_ROOT` or run from the repo root. `VC_SCRIPTS` is the path to `version-control/scripts`.

## First-time setup

```bash
bun run $VC_SCRIPTS/InitializeGit.ts
```

## Daily commands

```bash
bun run $VC_SCRIPTS/GetStatus.ts
bun run $VC_SCRIPTS/ViewHistory.ts --limit 20
bun run $VC_SCRIPTS/CommitChanges.ts --message "Describe change"
bun run $VC_SCRIPTS/CreateCheckpoint.ts --name "before-refactor"
```

## Branch metadata (optional)

```bash
bun run $VC_SCRIPTS/ManageBranches.ts create \
  --name "feature-x" \
  --description "Short summary" \
  --purpose "Why this branch exists"
bun run $VC_SCRIPTS/ManageBranches.ts list
```

Metadata is stored in `.vc-branches.json` in the repo root (legacy branch metadata files are still read if present).

## Pending actions (optional)

If your environment writes a pending-action JSON file, use:

```bash
bun run $VC_SCRIPTS/HandlePendingAction.ts --show
bun run $VC_SCRIPTS/HandlePendingAction.ts --commit "message"
```

Primary filename: `.vc-pending-action.json` (older pending filenames are still read when present).

## Best practices

1. Create checkpoints before risky operations
2. Keep commits scoped and messages descriptive
3. Set `REPO_ROOT` explicitly in automation so the correct tree is always targeted
