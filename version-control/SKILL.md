---
name: version-control
description: >-
  Generic git workflow support for any repository: history, checkpoints, diffs, branches with
  optional branch metadata, and commit/branch/skip prompts when pending-change tooling is used.
  Use when the user asks for git checkpoints, comparing commits, branch management, reverting
  changes, viewing history, initializing a repo, or handling uncommitted changes after edits.
  Set REPO_ROOT or GIT_WORK_TREE to the repository root, or run scripts from that directory
  (defaults to current working directory). Do not use for fork/upstream policy; use fork-management.
---

# Version control

Generic git state management for a single working tree: history, checkpoints, compare/revert, branch helpers, and optional pending-action flows.

## Scope boundaries

`version-control` applies to **one git repository** (the tree selected by `REPO_ROOT`, `GIT_WORK_TREE`, or the current working directory).

For fork governance (`FORK.md`, upstream sync policy, PRs to parent), use **fork-management** and reuse this skill only for mechanical git steps (checkpoint, compare, branches).

## Workflow routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Initialize** | "initialize git", "set up version control for this repo" | `references/Initialize.md` |
| **ViewHistory** | "show version history", "git log", "what changed in commits" | `references/ViewHistory.md` |
| **Revert** | "revert changes", "rollback", "undo commit", "restore file from git" | `references/Revert.md` |
| **Checkpoint** | "create checkpoint", "save current state", "tag this point" | `references/Checkpoint.md` |
| **Compare** | "compare versions", "diff two commits", "what's different" | `references/Compare.md` |
| **CreateBranch** | "create branch", "new branch for testing", "branch for feature" | `references/CreateBranch.md` |
| **SwitchBranch** | "switch branch", "checkout branch", "change branch" | `references/SwitchBranch.md` |
| **ListBranches** | "list branches", "show branches", "what branches exist" | `references/ListBranches.md` |
| **DescribeBranch** | "describe branch", "update branch info", "set branch purpose" | `references/DescribeBranch.md` |
| **DeleteBranch** | "delete branch", "remove branch" | `references/DeleteBranch.md` |
| **HandlePendingAction** | "handle pending changes", "commit or branch", "review pending VC action" | `references/HandlePendingAction.md` |
| **CheckChanges** | "check for changes", "what is uncommitted", "review working tree" | `references/CheckChanges.md` |

## Repository selection

Scripts use this precedence for the git root:

1. `REPO_ROOT`
2. `GIT_WORK_TREE`
3. `process.cwd()`

Run commands from the repository root or export `REPO_ROOT` before invoking scripts.

**Script path placeholder:** `$VC_SCRIPTS` means the directory containing these scripts (e.g. `.../version-control/scripts`). Examples use `bun run $VC_SCRIPTS/<Script>.ts`.

## Optional automation (hooks)

If the environment wires **PostToolUse** (or similar) to create a pending-action file and notify the user, the **HandlePendingAction** and **CheckChanges** flows apply. In editors without those hooks, invoke `CheckAndPrompt.ts` manually after edits.

## User-in-the-loop

When a pending-action file is present, the user chooses commit, branch, or skip. See `references/UserInTheLoop.md`.

## Branch metadata

Optional JSON sidecar in the repo root: **`.vc-branches.json`**. Older tooling may have written the same data under a different filename; that file is still read if the canonical one is absent. Used for purpose/description when listing branches. See `references/BranchManagement.md`.

## Tools

- `scripts/InitializeGit.ts` — `git init` and baseline commit in the selected repo
- `scripts/CommitChanges.ts` — stage and commit with optional auto-generated message
- `scripts/ViewHistory.ts` — log and history variants
- `scripts/RevertChange.ts` — revert commit, restore paths, or reset
- `scripts/CreateCheckpoint.ts` — annotated tags as checkpoints
- `scripts/CompareVersions.ts` — diff between refs
- `scripts/GetStatus.ts` — short status and recent commits
- `scripts/ManageBranches.ts` — create/switch/list/describe/delete + metadata
- `scripts/HandlePendingAction.ts` — commit/branch/skip for pending-action files
- `scripts/CheckAndPrompt.ts` — print uncommitted changes and suggested next commands
- `scripts/repoRoot.ts` — shared resolver for `REPO_ROOT` / `GIT_WORK_TREE` / cwd
- `scripts/StateIntegration.ts` — optional state mirror when `STATE_MANAGER_SCRIPT` and project detection apply

## State integration (optional)

If `STATE_MANAGER_SCRIPT` points to an executable state updater and the workspace matches your project layout, commit/checkpoint/branch/revert/init operations may record metadata there. Failures are non-blocking. Details: `references/STATEMANAGEMENT_INTEGRATION.md`.

## Examples

**Example 1: Initialize a repo**

```text
User: "Initialize git in this folder."
→ Initialize workflow
→ Run InitializeGit.ts with REPO_ROOT set (or cwd = repo root)
→ Initial commit when there are files to commit
```

**Example 2: Inspect history**

```text
User: "What changed recently?"
→ ViewHistory workflow
→ ViewHistory.ts with appropriate --limit / --since
```

**Example 3: Pending action**

```text
User: "I have pending changes—commit or branch?"
→ CheckChanges / HandlePendingAction
→ User chooses --commit, --branch, or --skip
```
