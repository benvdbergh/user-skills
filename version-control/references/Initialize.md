# Initialize

Initialize a git repository for the selected working tree.

## Steps

1. Confirm whether `.git` already exists
2. Run `git init` if needed
3. Configure `user.name` / `user.email` from environment or defaults
4. Recommend a `.gitignore` when missing
5. Create an initial commit when there are tracked files

## Usage

Set `REPO_ROOT` (or `GIT_WORK_TREE`) to the repository root, or run from that directory. `VC_SCRIPTS` is the path to `version-control/scripts`.

```bash
bun run $VC_SCRIPTS/InitializeGit.ts
```

## Environment variables

- `REPO_ROOT` / `GIT_WORK_TREE` — git working tree (default: current working directory)
- `GIT_USER_NAME` — default: `Version Control`
- `GIT_USER_EMAIL` — default: `version-control@local`

## Output

- `.git` under the chosen root
- Optional initial commit

**Done when:** the tree is a git repository and an initial commit exists when there was content to commit.
