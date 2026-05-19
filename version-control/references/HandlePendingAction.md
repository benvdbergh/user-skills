# HandlePendingAction

Resolve a pending version-control action after a pending JSON file was created (typically by environment hooks).

## When it applies

When `.vc-pending-action.json` (or a legacy pending file from older tooling) exists in the repository root listing changed paths.

## Usage

```bash
bun run $VC_SCRIPTS/HandlePendingAction.ts --show
bun run $VC_SCRIPTS/HandlePendingAction.ts
bun run $VC_SCRIPTS/HandlePendingAction.ts --commit
bun run $VC_SCRIPTS/HandlePendingAction.ts --commit "Custom commit message"
bun run $VC_SCRIPTS/HandlePendingAction.ts --branch "topic-branch"
bun run $VC_SCRIPTS/HandlePendingAction.ts --branch "topic-branch" "Initial commit message"
bun run $VC_SCRIPTS/HandlePendingAction.ts --skip
```

Set `REPO_ROOT` so the pending file and git commands target the correct tree.

## Workflow example

1. Pending file appears after automated detection
2. Review: `--show`
3. Choose `--commit`, `--branch`, or `--skip`

**Done when:** the pending file is cleared and the chosen git action completed (or skipped).
