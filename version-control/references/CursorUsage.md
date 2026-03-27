# Using Version Control in Cursor

The version control tools work in Cursor, but **hooks are Claude Code-specific** and won't run automatically.

## How It Works in Cursor

### Manual Detection Required

Since hooks don't run in Cursor, you need to:

1. **Check for changes manually** after modifying PAI files:
   ```bash
   bun run $PAI_DIR/skills/version-control/scripts/CheckAndPrompt.ts
   ```

2. **Handle the changes** using HandlePendingAction:
   ```bash
   bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --commit "Description"
   ```

### Proactive Change Check

After modifying PAI framework files (hooks, skills, scripts, settings.json), run `CheckAndPrompt.ts` to detect changes, then prompt for commit/branch/skip and run the chosen action.

### Example AI Workflow in Cursor

```
User: "Add a new hook for file validation"

[AI creates hooks/validate-files.ts]

[AI runs:]
bun run $PAI_DIR/skills/version-control/scripts/CheckAndPrompt.ts

[AI sees changes and prompts:]
"I've created the validation hook. Would you like to:
 1. Commit to master: --commit 'Add file validation hook'
 2. Create test branch: --branch 'test-validate-files'
 3. Skip for now: --skip"

[User decides, AI executes]
```

## Available Tools (All Work in Cursor)

All version control tools work standalone:

- `CheckAndPrompt.ts` - Check for changes (use this in Cursor!)
- `HandlePendingAction.ts` - Commit, branch, or skip
- `ManageBranches.ts` - Branch operations
- `CommitChanges.ts` - Direct commit
- `ViewHistory.ts` - View git history
- `GetStatus.ts` - Show git status
- `RevertChange.ts` - Revert changes
- `CreateCheckpoint.ts` - Create checkpoints

## Quick Reference for AI

When working in Cursor and modifying PAI files:

1. **After file modifications**, run:
   ```bash
   bun run $PAI_DIR/skills/version-control/scripts/CheckAndPrompt.ts
   ```

2. **If changes detected**, prompt user and use:
   ```bash
   bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --commit "message"
   bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --branch "name"
   bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --skip
   ```

3. **For branch operations**, use:
   ```bash
   bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts list
   bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts switch --name "branch"
   ```

## Differences from Claude Code

| Feature | Claude Code | Cursor |
|---------|-------------|--------|
| Automatic detection | ✅ Via hooks | ❌ Manual check required |
| Pending actions | ✅ Auto-created | ❌ Check manually via CheckAndPrompt |
| Branch context | ✅ Auto-loaded | ⚠️ Manual: `ManageBranches.ts current` |
| Session integration | ✅ Full | ⚠️ Tools only |

## Best Practice for AI in Cursor

**Check for version control after modifying PAI files:**

```typescript
// After write/search_replace to PAI files:
1. Run CheckAndPrompt.ts
2. If changes found, prompt user for action
3. Execute chosen action (commit/branch/skip)
```

This ensures version control is maintained even without hooks.
