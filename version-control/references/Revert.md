# Revert Changes

Revert changes in PAI repository.

## Steps

1. Verify git repository exists
2. Identify target (commit, file, or all)
3. Perform revert operation
4. Create revert commit if needed

## Usage

```bash
# Revert specific commit (creates new commit)
bun run $PAI_DIR/skills/version-control/scripts/RevertChange.ts --commit <hash>

# Hard reset to specific commit (destructive)
bun run $PAI_DIR/skills/version-control/scripts/RevertChange.ts --commit <hash> --hard

# Restore specific file from HEAD
bun run $PAI_DIR/skills/version-control/scripts/RevertChange.ts --file hooks/settings.json

# Discard all uncommitted changes (destructive)
bun run $PAI_DIR/skills/version-control/scripts/RevertChange.ts --hard
```

## Options

- `--commit HASH` - Commit hash to revert to
- `--file PATH` - File to restore from HEAD
- `--hard` - Hard reset (destructive, discards changes)

## Warnings

- `--hard` flag permanently discards uncommitted changes
- Review changes before reverting
- Consider creating a checkpoint before major reverts

**Done when:** Target state is restored (revert commit created or file/hard reset applied).
