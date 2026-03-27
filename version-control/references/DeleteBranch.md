# Delete Branch

Delete a branch and its metadata.

## Steps

1. Verify branch exists
2. Check that branch is not current
3. Delete git branch (with or without merge check)
4. Remove branch metadata

## Usage

```bash
# Delete merged branch (safe)
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts delete --name "test-branch"

# Force delete unmerged branch (destructive)
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts delete --name "test-branch" --force
```

## Options

- `--name BRANCH` - Branch name to delete (required)
- `--force` - Force delete even if not merged (destructive)

## Safety

- Cannot delete current branch (switch away first)
- Default behavior requires branch to be merged
- `--force` bypasses merge check (use with caution)
- Metadata is automatically removed

## Workflow

1. Switch away from branch if it's current
2. Delete branch (merged or with --force)
3. Metadata automatically cleaned up

**Done when:** Branch is removed from git and its entry is removed from `.pai-branches.json`.
