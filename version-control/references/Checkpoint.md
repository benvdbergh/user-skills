# Create Checkpoint

Create a tagged checkpoint in PAI repository.

## Steps

1. Verify git repository exists
2. Commit uncommitted changes if requested
3. Create annotated tag with checkpoint name
4. Record checkpoint metadata

## Usage

```bash
# Create checkpoint with name
bun run $PAI_DIR/skills/version-control/scripts/CreateCheckpoint.ts --name "before-major-refactor"

# Create checkpoint with custom message
bun run $PAI_DIR/skills/version-control/scripts/CreateCheckpoint.ts --name "stable-v1" --message "Stable version before adding new features"

# Commit changes first, then create checkpoint
bun run $PAI_DIR/skills/version-control/scripts/CreateCheckpoint.ts --name "checkpoint" --commit-first
```

## Options

- `--name NAME` - Checkpoint name (required, will be normalized to tag format)
- `--message MESSAGE` - Custom tag message
- `--commit-first` - Commit uncommitted changes before creating tag

## Tag Format

Checkpoint names are normalized to: `checkpoint-<name>`
- Spaces become hyphens
- Converted to lowercase
- Special characters removed

## Examples

- `--name "Before Refactor"` → tag: `checkpoint-before-refactor`
- `--name "v1.0"` → tag: `checkpoint-v1-0`

**Done when:** Tag is created (and optional commit applied); checkpoint is recorded in metadata.
