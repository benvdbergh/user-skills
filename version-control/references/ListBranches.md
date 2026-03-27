# List Branches

List all available branches with their metadata.

## Steps

1. Get list of all git branches
2. Load branch metadata
3. Display branches with purpose and description
4. Mark current branch with asterisk

## Usage

```bash
# List all branches
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts list
```

## Output Format

```
Branches:

* master
    Purpose: Main development branch
    Stable production-ready PAI framework

  test-new-hooks
    Purpose: Testing new hook system
    Experimental testing of hook architecture

  refactor-skills
    Purpose: Refactoring skill system
    Major restructuring of skill directory organization
```

## Information Displayed

- Branch name (with * for current branch)
- Purpose statement
- Description
- Branches without metadata show as "(No metadata)"

**Done when:** User sees the list of branches with metadata (and current branch marked).
