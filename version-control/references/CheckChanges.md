# Check for Changes

Check for uncommitted changes to PAI framework files. Use this in Cursor or when hooks aren't available.

## Steps

1. Check git status for PAI framework files
2. Filter to relevant files (hooks/, skills/, scripts/, settings.json)
3. Display changed files
4. Provide next steps

## Usage

```bash
# Check for changes
bun run $PAI_DIR/skills/version-control/scripts/CheckAndPrompt.ts
```

## When to Use

- **In Cursor**: After modifying PAI framework files
- **Manual check**: When you want to see what's changed
- **Before committing**: To review changes before version control

## Output

Shows:
- Number of changed files
- List of changed files
- Suggested next steps (commit, branch, or skip)

## Integration with AI

Use this tool after modifying PAI framework files; show results to the user, prompt for commit/branch/skip, then run the chosen action.

## Example

```bash
$ bun run $PAI_DIR/skills/version-control/scripts/CheckAndPrompt.ts

📋 PAI Framework Changes Detected
==================================================
Files changed: 3

  1. hooks/new-hook.ts
  2. skills/NewSkill/SKILL.md
  3. settings.json

💡 Next steps:
  1. Review changes: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --show
  2. Commit: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --commit [message]
  3. Branch: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --branch <name>
  4. Skip: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --skip
```

**Done when:** User sees the list of changed files and suggested next steps (or no changes reported).
