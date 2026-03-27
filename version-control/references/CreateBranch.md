# Create Branch

Create a new git branch with metadata for testing implementations.

## Steps

1. Verify git repository exists
2. Create branch from current branch or specified source
3. Switch to new branch
4. Save branch metadata (purpose, description)
5. Update last-used timestamp

## Usage

```bash
# Create branch from current position
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts create \
  --name "test-new-hooks" \
  --description "Testing new hook system implementation" \
  --purpose "Experimental testing of new hook architecture"

# Create branch from specific commit or branch
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts create \
  --name "refactor-skills" \
  --description "Refactoring skill system structure" \
  --purpose "Major refactoring work" \
  --from master
```

## Options

- `--name NAME` - Branch name (required)
- `--description DESC` - Human-readable description (required)
- `--purpose PURPOSE` - Purpose statement for AI context (required)
- `--from BRANCH` - Source branch/commit (default: current branch)

## Best Practices

- Use descriptive names: `test-<feature>`, `refactor-<component>`, `experiment-<idea>`
- Provide clear purpose statements - the AI will see this at session start
- Create branches from stable points (master/main) for major changes
- Use purpose to explain what you're testing/implementing

## Examples

**Testing a new feature:**
```bash
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts create \
  --name "test-auto-commit" \
  --description "Testing automatic commit functionality" \
  --purpose "Evaluate auto-commit hook behavior and performance"
```

**Refactoring work:**
```bash
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts create \
  --name "refactor-hook-system" \
  --description "Restructuring hook execution pipeline" \
  --purpose "Major architectural change to hook system - experimental"
```

**Done when:** New branch exists, is checked out, and metadata is saved in `.pai-branches.json`.
