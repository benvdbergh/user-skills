# User-in-the-Loop Version Control

Interactive version control system that prompts you to decide how to handle changes to PAI framework files.

## How It Works

### 1. Change Detection

When you (or the AI) modify PAI framework files:
- `hooks/` - Hook files
- `skills/` - Skill definitions and tools
- `scripts/` - Global tools
- `settings.json` - Configuration
- `.gitignore` - Git ignore rules

The `prompt-version-action.ts` hook automatically:
1. Detects the changes
2. Creates a pending action file (`.pai-pending-action.json`)
3. Outputs a notification that the AI can see

### 2. Notification

You'll see a notification like:
```
🔔 PAI Version Control: Changes detected
   Files changed: 3
   Changed files: hooks/new-hook.ts, skills/NewSkill/SKILL.md, settings.json
   Action required: Review pending changes
   Use: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts
```

The AI also sees this and can:
- Show you what changed
- Suggest whether to commit or branch
- Help you make the decision

### 3. Decision Making

You have three options:

#### Commit to Current Branch
```bash
# Auto-generated message
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --commit

# Custom message
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --commit "Add new hook for validation"
```

**Use when:** Changes are stable, tested, and ready for the current branch.

#### Create Branch and Commit
```bash
# Auto-generated description
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --branch "test-new-hook"

# With custom commit message
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --branch "test-new-hook" "Initial implementation"
```

**Use when:** Changes are experimental, need testing, or you want to isolate work.

#### Skip
```bash
bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --skip
```

**Use when:** Changes are temporary, incomplete, or you want to defer version control.

### 4. Execution

Once you choose an action:
- The system executes it (commit, branch creation, or skip)
- The pending action file is cleared
- Changes are versioned (or skipped) as requested

## AI Integration

The AI can help you throughout this process:

1. **Detection**: AI sees the notification automatically
2. **Review**: AI can show you what changed
3. **Suggestion**: AI can recommend commit vs branch based on:
   - Type of changes
   - Current branch context
   - Your workflow patterns
4. **Execution**: AI can execute the action on your behalf

### Example AI Interaction

```
User: "Add a new hook for validating file changes"

[AI makes changes to hooks/validate-files.ts]

🔔 PAI Version Control: Changes detected
   Files changed: 1
   Changed files: hooks/validate-files.ts
   Action required: Review pending changes

AI: "I've created a new validation hook. Would you like to:
   1. Commit to master (if this is stable)
   2. Create a test branch (if you want to test it first)
   3. Skip for now (if it's incomplete)

   Based on the hook's purpose, I'd recommend option 2 to test it first."

User: "Let's test it first"

AI: [Executes] bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --branch "test-validate-files"
```

## Workflow Patterns

### Pattern 1: Direct Development on Master
1. Make changes
2. Review pending action
3. Commit directly: `--commit "Description"`
4. Continue working

### Pattern 2: Experimental Testing
1. Make changes
2. Review pending action
3. Create branch: `--branch "test-feature"`
4. Test and iterate
5. Merge to master when ready

### Pattern 3: Deferred Version Control
1. Make changes
2. Review pending action
3. Skip: `--skip`
4. Continue working
5. Handle later when ready

## Benefits

1. **Control**: You decide when and how to version changes
2. **Awareness**: Know what's changed
3. **Flexibility**: Choose commit, branch, or skip per situation
4. **AI Assistance**: AI can help review and decide
5. **No Surprises**: No automatic commits without your knowledge

## Configuration

The system is enabled by default via the `prompt-version-action.ts` hook in `PostToolUse`.

To disable:
- Remove the hook from `settings.json` PostToolUse section
- Or set environment variable to skip (future enhancement)

## Pending Action File

The `.pai-pending-action.json` file contains:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "sessionId": "session-id",
  "changedFiles": ["hooks/new.ts", "skills/New/SKILL.md"],
  "toolName": "write"
}
```

This file is:
- Created automatically when changes are detected
- Cleared after action is taken
- Not versioned (in .gitignore)

## Troubleshooting

### Notification not appearing
- Check that hook is in `settings.json` PostToolUse
- Verify git repository is initialized
- Ensure changes are to PAI framework files

### Pending action persists
- Run `HandlePendingAction.ts --show` to review
- Use `--skip` to clear if needed
- Check file permissions on `.pai-pending-action.json`

### Want automatic commits back
- Remove `prompt-version-action.ts` from PostToolUse
- Add back `auto-commit-pai-changes.ts` (if it existed)
