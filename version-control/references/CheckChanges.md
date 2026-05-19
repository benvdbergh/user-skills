# CheckChanges

List uncommitted paths in the repository. Use when hooks are not available or you want a quick working-tree summary.

## Steps

1. Resolve repository root (`REPO_ROOT`, `GIT_WORK_TREE`, or cwd)
2. Run `git status --porcelain`
3. Print changed paths and suggested follow-up commands

## Usage

`VC_SCRIPTS` is the path to `version-control/scripts`.

```bash
bun run $VC_SCRIPTS/CheckAndPrompt.ts
```

## When to use

- After edits, before deciding to commit
- In editors without PostToolUse automation
- To show the user what would be included in a commit

## Output

- Count and list of changed paths
- Pointers to `HandlePendingAction.ts` (if you use pending files) or `CommitChanges.ts`

## Example

```bash
$ bun run $VC_SCRIPTS/CheckAndPrompt.ts

📋 Uncommitted changes
==================================================
Files changed: 2

  1. src/app.ts
  2. README.md

💡 Next steps:
  ...
```

**Done when:** changed files are listed or the tool reports a clean tree.
