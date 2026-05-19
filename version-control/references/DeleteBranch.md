# DeleteBranch

Delete a local branch and remove its metadata entry.

## Usage

```bash
bun run $VC_SCRIPTS/ManageBranches.ts delete --name "old-branch"
bun run $VC_SCRIPTS/ManageBranches.ts delete --name "old-branch" --force
```

**Done when:** the branch is removed from git and from `.vc-branches.json`.
