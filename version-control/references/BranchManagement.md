# Branch Management System

Comprehensive branch management for PAI framework with AI context awareness.

## Overview

The branch management system allows you to:
- Create branches for testing implementations
- Track branch purpose and description
- Automatically inform AI about current branch context
- Manage branch lifecycle (create, switch, describe, delete)

## How It Works

### 1. Branch Metadata

Branch metadata is stored in `.pai-branches.json`:
```json
{
  "branches": {
    "test-new-hooks": {
      "description": "Testing new hook system implementation",
      "purpose": "Experimental testing of new hook architecture",
      "created": "2024-01-01T00:00:00.000Z",
      "lastUsed": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

### 2. AI Context Loading

At session start, the `load-branch-context.ts` hook:
1. Detects current git branch
2. Loads branch metadata
3. Displays branch context to AI:
   ```
   📋 PAI Branch Context:
   Current branch: test-new-hooks
   Purpose: Experimental testing of new hook architecture
   Description: Testing new hook system implementation
   ```

### 3. Branch Operations

All operations update metadata automatically:
- **Create**: Saves purpose and description
- **Switch**: Updates `lastUsed` timestamp
- **Describe**: Updates metadata for existing branches
- **Delete**: Removes metadata when branch is deleted

## Workflow Example

### Testing a New Feature

1. **Create branch with clear purpose:**
   ```bash
   bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts create \
     --name "test-auto-commit-v2" \
     --description "Testing improved auto-commit hook" \
     --purpose "Experimental: Testing new auto-commit logic with better message generation"
   ```

2. **Work on the branch:**
   - Make changes to hooks, skills, etc.
   - Changes are automatically committed
   - AI is aware you're on experimental branch

3. **Switch back to master when done:**
   ```bash
   bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts switch --name "master"
   ```

4. **Merge or delete when ready:**
   ```bash
   # If keeping changes, merge to master
   git checkout master
   git merge test-auto-commit-v2
   
   # Then delete the branch
   bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts delete --name "test-auto-commit-v2"
   ```

## Best Practices

### Branch Naming
- Use descriptive names: `test-<feature>`, `refactor-<component>`, `experiment-<idea>`
- Keep names short but clear
- Use kebab-case for consistency

### Purpose Statements
- Be specific about what you're testing/implementing
- Mention if it's experimental or breaking
- Explain the goal or hypothesis
- Examples:
  - ✅ "Experimental testing of new hook system - may break existing hooks"
  - ✅ "Refactoring skill system to improve loading performance"
  - ❌ "Testing stuff"
  - ❌ "Changes"

### Description
- Provide human-readable context
- Explain what the branch is for
- Mention related issues or goals

### Branch Lifecycle
1. Create with clear purpose before starting work
2. Work and commit changes (auto-commits help)
3. Test thoroughly on the branch
4. Merge to master when stable
5. Delete branch after merge

## Integration Points

### Session Initialization
Branch context is loaded automatically via `load-branch-context.ts` hook in SessionStart.

### AI Awareness
The AI sees branch context at the start of every session, helping it:
- Understand what you're working on
- Provide appropriate suggestions
- Avoid breaking changes on experimental branches
- Context-aware assistance

### Version Control
- Branch metadata (`.pai-branches.json`) is tracked in git
- Changes to metadata are committed like other files
- Branch operations update metadata automatically

## Commands Reference

```bash
# Create branch
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts create \
  --name <name> --description <desc> --purpose <purpose> [--from <branch>]

# Switch branch
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts switch --name <branch>

# List branches
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts list

# View current branch
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts current

# Update metadata
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts describe \
  --name <branch> [--description <desc>] [--purpose <purpose>]

# Delete branch
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts delete --name <branch> [--force]
```

## Troubleshooting

### Branch metadata not showing
- Check that `.pai-branches.json` exists
- Verify branch name matches exactly (case-sensitive)
- Use `describe` command to add metadata

### AI not seeing branch context
- Verify `load-branch-context.ts` is in SessionStart hooks
- Check that git repository is initialized
- Ensure you're on a branch (not detached HEAD)

### Branch operations fail
- Ensure git repository is initialized
- Check that you're not trying to delete current branch
- Verify branch exists with `list` command
