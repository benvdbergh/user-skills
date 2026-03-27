# Compare Versions

Compare two versions or commits in PAI repository.

## Steps

1. Verify git repository exists
2. Identify source and target commits/tags
3. Generate diff output
4. Display file changes and statistics

## Usage

```bash
# Compare two commits
bun run $PAI_DIR/skills/version-control/scripts/CompareVersions.ts --from <hash1> --to <hash2>

# Compare with HEAD
bun run $PAI_DIR/skills/version-control/scripts/CompareVersions.ts --from <hash> --to HEAD

# Compare two tags
bun run $PAI_DIR/skills/version-control/scripts/CompareVersions.ts --from checkpoint-v1 --to checkpoint-v2

# Compare specific file across versions
bun run $PAI_DIR/skills/version-control/scripts/CompareVersions.ts --from <hash1> --to <hash2> --file hooks/settings.json
```

## Options

- `--from REF` - Source commit/tag/branch
- `--to REF` - Target commit/tag/branch (default: HEAD)
- `--file PATH` - Compare specific file only
- `--stat` - Show statistics instead of full diff

**Done when:** User sees the diff (or stat) between the two refs.
