# User in the loop

Some setups create a **pending action** file when edits should be committed or branched explicitly.

## Flow

1. Tooling detects uncommitted paths (or selected paths)
2. Writes `.vc-pending-action.json` in the repo root (or a legacy pending file name produced by older tooling)
3. You choose: commit, new branch + commit, or skip
4. Run `HandlePendingAction.ts` with the matching flags

## Commands

```bash
bun run $VC_SCRIPTS/HandlePendingAction.ts --show
bun run $VC_SCRIPTS/HandlePendingAction.ts --commit "message"
bun run $VC_SCRIPTS/HandlePendingAction.ts --branch "name" "optional message"
bun run $VC_SCRIPTS/HandlePendingAction.ts --skip
```

## Pending file shape (reference)

- `timestamp`, `sessionId`, `changedFiles`, `toolName`, optional `action` / `branchName` / `commitMessage`

**Done when:** pending state is cleared after an explicit decision.
