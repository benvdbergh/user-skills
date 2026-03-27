---
name: version-control
description: Self-version management for PAI framework. USE WHEN tracking changes to .claude folder, reverting framework modifications, viewing version history, creating checkpoints, managing git repository for PAI infrastructure, OR after modifying PAI files in Cursor (hooks don't auto-run - use CheckAndPrompt.ts).
---

# VersionControl

Self-version management system for the Personal AI Infrastructure (PAI). Automatically tracks all changes to the `.claude` folder using git, enabling rollback, history viewing, and checkpoint management. In Cursor, hooks do not run; use CheckAndPrompt.ts and HandlePendingAction when PAI files change.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Initialize** | "initialize version control", "set up git for PAI" | `references/Initialize.md` |
| **ViewHistory** | "show version history", "git log PAI", "what changed" | `references/ViewHistory.md` |
| **Revert** | "revert changes", "rollback PAI", "undo framework change" | `references/Revert.md` |
| **Checkpoint** | "create checkpoint", "save current state", "tag version" | `references/Checkpoint.md` |
| **Compare** | "compare versions", "diff changes", "what's different" | `references/Compare.md` |
| **CreateBranch** | "create branch", "new branch for testing", "branch for feature" | `references/CreateBranch.md` |
| **SwitchBranch** | "switch branch", "change branch", "checkout branch" | `references/SwitchBranch.md` |
| **ListBranches** | "list branches", "show branches", "what branches exist" | `references/ListBranches.md` |
| **DescribeBranch** | "describe branch", "update branch info", "set branch purpose" | `references/DescribeBranch.md` |
| **DeleteBranch** | "delete branch", "remove branch" | `references/DeleteBranch.md` |
| **HandlePendingAction** | "handle pending changes", "review changes", "commit or branch" | `references/HandlePendingAction.md` |
| **CheckChanges** | "check for changes", "what changed in PAI", "review PAI changes" | `references/CheckChanges.md` |

## Examples

**Example 1: Initialize version control**
```
User: "Set up version control for the PAI framework"
→ Invokes Initialize workflow
→ Creates git repository in .claude
→ Sets up .gitignore
→ Creates initial commit
→ Configures auto-commit hooks
```

**Example 2: View recent changes**
```
User: "What changed in the PAI framework recently?"
→ Invokes ViewHistory workflow
→ Shows git log with recent commits
→ Displays file changes summary
```

**Example 3: Handle pending action**
```
User: "I changed some PAI files—commit or create a branch?"
→ Invokes CheckChanges then HandlePendingAction workflow
→ Reviews changed files
→ User chooses commit, branch, or skip
→ Executes chosen action and clears pending state
```

## Architecture

The VersionControl skill works in two modes:

### Claude Code (Automatic via Hooks)
- **SessionStart Hook**: Loads current branch context and informs AI about branch purpose
- **PostToolUse Hook**: Detects changes to PAI files and creates pending action (user-in-the-loop)
- **PreToolUse Hook**: Validates git operations to prevent dangerous commands
- **SessionEnd Hook**: Creates session summary commit

### Cursor / Manual Usage (Standalone Tools)
- All tools work independently without hooks
- Use `CheckAndPrompt.ts` to manually check for changes
- Tools can be invoked directly by the AI or user
- No automatic detection - requires explicit invocation

**Note:** Hooks only work in Claude Code. In Cursor, use the tools directly.

## User-in-the-Loop

Changes to PAI files are detected (via hooks in Claude Code or CheckAndPrompt in Cursor); a pending action is created and the user chooses commit, branch, or skip. See `references/UserInTheLoop.md`.

## Branch Management

Branch metadata (purpose, description, timestamps) is stored in `.pai-branches.json` and loaded at session start for AI context. See `references/BranchManagement.md`.

## Tools

- `scripts/InitializeGit.ts` - Initialize git repository in .claude (auto-updates state)
- `scripts/CommitChanges.ts` - Commit current changes with message (auto-updates state)
- `scripts/ViewHistory.ts` - Display git log and change history
- `scripts/RevertChange.ts` - Revert to specific commit or file version (auto-updates state)
- `scripts/CreateCheckpoint.ts` - Create tagged checkpoint (auto-updates state)
- `scripts/CompareVersions.ts` - Compare two commits or versions
- `scripts/GetStatus.ts` - Show current git status
- `scripts/ManageBranches.ts` - Create, switch, list, describe, and delete branches with metadata (auto-updates state)
- `scripts/HandlePendingAction.ts` - Review and handle pending version control actions (commit/branch/skip)
- `scripts/StateIntegration.ts` - Helper module for StateManagement integration

## StateManagement Integration

The VersionControl skill automatically integrates with StateManagement to track version control operations in project state:

- **Commits** - Records commit hash, message, and changed files in state
- **Checkpoints** - Records checkpoint name, commit hash, and message
- **Branch Operations** - Records branch creation and switches
- **Reverts** - Records revert operations and target commits
- **Initialization** - Records git repository initialization

State updates are automatic and happen silently in the background. If a project is detected (via workspace path), state will be updated. If no project is detected or StateManagement is not available, operations continue normally without state updates.

## Excluded Files

The following are excluded from version control (via .gitignore):
- `history/` - Session history files
- `debug/` - Debug output files
- `projects/` - Project-specific data
- `session-env/` - Session environment state
- `statsig/` - Statsig cache files
- `todos/` - Todo files
- `file-history/` - File history cache
- `shell-snapshots/` - Shell snapshots
- `plugins/` - External plugins
