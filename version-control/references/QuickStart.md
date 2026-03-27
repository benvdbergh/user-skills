# VersionControl Quick Start

Self-version management for the PAI framework.

## Initial Setup

Initialize git repository for the `.claude` folder:

```bash
bun run $PAI_DIR/skills/version-control/scripts/InitializeGit.ts
```

This will:
- Create a git repository in `~/.claude`
- Configure git user (from `GIT_USER_NAME` and `GIT_USER_EMAIL` env vars)
- Create initial commit with current framework state

## Auto-Commit

The system automatically commits changes to PAI framework files:
- `hooks/` - Hook files
- `skills/` - Skill definitions and tools
- `scripts/` - Global tools
- `settings.json` - Configuration
- `.gitignore` - Git ignore rules

Auto-commits happen after each tool execution that modifies these files.

## Branch Management

### Create Branch for Testing
```bash
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts create \
  --name "test-feature" \
  --description "Testing new feature implementation" \
  --purpose "Experimental testing of new feature - AI should be aware this is experimental"
```

### Switch Branches
```bash
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts switch --name "test-feature"
```

### List All Branches
```bash
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts list
```

### View Current Branch Info
```bash
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts current
```

### Update Branch Metadata
```bash
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts describe \
  --name "test-feature" \
  --purpose "Updated purpose for AI context"
```

### Delete Branch
```bash
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts delete --name "test-feature"
```

## AI Context Awareness

When you switch to a branch, the AI is automatically informed at session start:
- Current branch name
- Branch purpose (what you're testing/implementing)
- Branch description

This helps the AI understand the context of your work and provide appropriate assistance.

## Manual Operations

### View Status
```bash
bun run $PAI_DIR/skills/version-control/scripts/GetStatus.ts
```

### View History
```bash
# Last 10 commits
bun run $PAI_DIR/skills/version-control/scripts/ViewHistory.ts

# Last 20 commits with statistics
bun run $PAI_DIR/skills/version-control/scripts/ViewHistory.ts --limit 20 --format stat

# History for specific file
bun run $PAI_DIR/skills/version-control/scripts/ViewHistory.ts --file hooks/settings.json
```

### Create Checkpoint
```bash
bun run $PAI_DIR/skills/version-control/scripts/CreateCheckpoint.ts --name "before-refactor"
```

### Revert Changes
```bash
# Restore specific file
bun run $PAI_DIR/skills/version-control/scripts/RevertChange.ts --file hooks/settings.json

# Revert to specific commit (creates new commit)
bun run $PAI_DIR/skills/version-control/scripts/RevertChange.ts --commit <hash>

# Hard reset (destructive - discards changes)
bun run $PAI_DIR/skills/version-control/scripts/RevertChange.ts --hard
```

### Compare Versions
```bash
bun run $PAI_DIR/skills/version-control/scripts/CompareVersions.ts --from <hash1> --to <hash2>
```

### Manual Commit
```bash
# Auto-generate commit message
bun run $PAI_DIR/skills/version-control/scripts/CommitChanges.ts

# Custom commit message
bun run $PAI_DIR/skills/version-control/scripts/CommitChanges.ts --message "Custom message"

# Commit specific files
bun run $PAI_DIR/skills/version-control/scripts/CommitChanges.ts --files "hooks/settings.json,skills/version-control/SKILL.md"
```

## Excluded Files

The following are excluded from version control (see `.gitignore`):
- `history/` - Session history
- `debug/` - Debug outputs
- `projects/` - Project data
- `session-env/` - Session state
- `statsig/` - Statsig cache
- `todos/` - Todo files
- `plugins/` - External plugins

## Integration

The VersionControl skill is integrated into the PAI hook system:
- **PostToolUse**: Auto-commits changes to framework files
- Hooks run automatically on every tool execution

## Best Practices

1. **Create checkpoints** before major refactoring
2. **Review history** regularly to understand framework evolution
3. **Use descriptive commit messages** when committing manually
4. **Test reverts** on non-critical changes first
5. **Keep .gitignore updated** as new transient directories are added

## Troubleshooting

### Git not initialized
Run `scripts/InitializeGit.ts` to set up the repository.

### Auto-commit not working
- Check that git repository exists (`.git` directory in PAI_DIR)
- Verify hook is in `settings.json` PostToolUse section
- Check file path matches PAI patterns (hooks/, skills/, scripts/, settings.json)

### Want to disable auto-commit
Remove the `auto-commit-pai-changes.ts` hook from `settings.json` PostToolUse section.
