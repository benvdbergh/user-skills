# Describe Branch

Update or add metadata for a branch.

## Steps

1. Load existing metadata
2. Update or create branch entry
3. Save metadata to `.pai-branches.json`

## Usage

```bash
# Add description to existing branch
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts describe \
  --name "master" \
  --description "Main stable branch" \
  --purpose "Production-ready PAI framework"

# Update only description
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts describe \
  --name "test-branch" \
  --description "Updated description"

# Update only purpose
bun run $PAI_DIR/skills/version-control/scripts/ManageBranches.ts describe \
  --name "test-branch" \
  --purpose "Updated purpose statement"
```

## Options

- `--name BRANCH` - Branch name (required)
- `--description DESC` - Branch description (optional)
- `--purpose PURPOSE` - Purpose statement (optional)

## Use Cases

- Add metadata to existing branches (e.g., master/main)
- Update branch purpose as work evolves
- Document branches created outside this tool
- Clarify branch intent for AI context

## Metadata Storage

Metadata is stored in `.pai-branches.json`:
```json
{
  "branches": {
    "branch-name": {
      "description": "Human description",
      "purpose": "Purpose for AI context",
      "created": "2024-01-01T00:00:00.000Z",
      "lastUsed": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

**Done when:** `.pai-branches.json` is updated with the branch's description and/or purpose.
