# Handle Pending Action

Review and handle pending version control actions after changes to PAI files.

## Overview

When changes are made to PAI framework files (hooks, skills, scripts, settings.json), a pending action is created. This workflow helps you decide whether to:
- **Commit** changes to current branch
- **Branch** - Create a new branch and commit
- **Skip** - Don't version control these changes

## Steps

1. Check for pending actions
2. Review changed files
3. Decide on action (commit/branch/skip)
4. Execute chosen action
5. Clear pending action

## Usage

### View Pending Action

```bash
# Show current pending action
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --show

# Or just run without args
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts
```

### Commit Changes

```bash
# Commit with auto-generated message
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --commit

# Commit with custom message
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --commit "Custom commit message"
```

### Create Branch and Commit

```bash
# Create branch with auto-generated description
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --branch "test-feature"

# Create branch with custom commit message
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --branch "test-feature" "Initial changes"
```

### Skip Action

```bash
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --skip
```

## AI Integration

The AI will automatically detect pending actions and can:
- Show you what changed
- Suggest whether to commit or branch
- Execute the action on your behalf

When changes are detected, you'll see:
```
🔔 PAI Version Control: Changes detected
   Files changed: 3
   Changed files: hooks/new-hook.ts, skills/NewSkill/SKILL.md, settings.json
   Action required: Review pending changes
```

## Workflow Example

1. **Make changes** to PAI files (e.g., add a new hook)
2. **Hook detects changes** and creates pending action
3. **AI notifies you** about pending changes
4. **Review changes:**
   ```bash
  bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts
   ```
5. **Decide and execute:**
   - For testing: `--branch "test-new-hook"`
   - For stable changes: `--commit "Add new hook"`
   - To defer: `--skip`

## Best Practices

- **Use branches** for experimental or testing work
- **Commit directly** for stable, tested changes
- **Skip** only if changes are temporary or incomplete
- **Review changed files** before deciding on action

**Done when:** User has chosen commit, branch, or skip and the action has been executed; pending action file is cleared.
