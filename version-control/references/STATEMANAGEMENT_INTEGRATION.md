# Optional state mirror

Version-control scripts can notify an external state manager after commits, checkpoints, branches, reverts, and init. This is **optional** and **non-blocking**.

## Requirements

1. `STATE_MANAGER_SCRIPT` — absolute path to a script invocable as:
   `bun run <script> --project <name> --action update --data <json>`
2. `VERSION_CONTROL_PROJECTS_ROOT` (or alias `KNOWLEDGE_PROJECTS_DIR`) — optional; when set, project name is derived from `CURSOR_WORKSPACE` / `CWD` / cwd when the path is under this root (first path segment after the root).
3. When `VERSION_CONTROL_PROJECTS_ROOT` is set, a `.state` directory under `<root>/<project>/` can gate updates (if `.state` is missing, the update is skipped).

If any requirement is missing, git operations proceed with no state call.

## Operations recorded

- `commit` — hash, message, files
- `checkpoint` — tag name, hash, message
- `branch_create` / `branch_switch` — branch name
- `revert` — target and resulting hash when applicable
- `initialize` — flag

## Example

```bash
export STATE_MANAGER_SCRIPT=/path/to/StateManager.ts
export VERSION_CONTROL_PROJECTS_ROOT=/path/to/projects
bun run $VC_SCRIPTS/CommitChanges.ts --message "Sync docs"
```

**Done when:** your state tool receives updates; if not configured, nothing extra runs.
