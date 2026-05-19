# Editor usage (manual)

When automatic hooks are not running, invoke the scripts from the repository root (or set `REPO_ROOT`).

## Check working tree

```bash
bun run $VC_SCRIPTS/CheckAndPrompt.ts
```

## Pending file workflow

```bash
bun run $VC_SCRIPTS/HandlePendingAction.ts --show
bun run $VC_SCRIPTS/HandlePendingAction.ts --commit "message"
bun run $VC_SCRIPTS/HandlePendingAction.ts --branch "branch-name"
bun run $VC_SCRIPTS/HandlePendingAction.ts --skip
```

## Branches

```bash
bun run $VC_SCRIPTS/ManageBranches.ts list
bun run $VC_SCRIPTS/ManageBranches.ts switch --name "branch"
```

## Suggested habit

After substantive edits, run `CheckAndPrompt.ts`, then commit or branch using `CommitChanges.ts` / `ManageBranches.ts` / `HandlePendingAction.ts` as appropriate.
