# Switch Branch

Switch to a different branch and update context.

## Steps

1. Verify branch exists
2. Check for uncommitted changes (warns but allows)
3. Switch to target branch
4. Update last-used timestamp in metadata
5. Display branch purpose and description

## Usage

```bash
# Switch to branch
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts switch --name "test-new-hooks"

# List branches first to see available options
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts list
```

## Options

- `--name BRANCH` - Branch name to switch to (required)

## Behavior

- Updates `lastUsed` timestamp in branch metadata
- Displays branch purpose and description after switching
- Warns if there are uncommitted changes (but allows switch)
- AI will be informed of branch context on next session start

## Integration

After switching branches, the next session will automatically:
- Load branch context via `load-branch-context.ts` hook
- Display branch purpose and description to AI
- Inform AI about what branch you're working on

**Done when:** Working tree is on the target branch and metadata last-used is updated.
