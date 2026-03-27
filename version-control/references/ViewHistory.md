# View History

View git history for PAI repository.

## Steps

1. Verify git repository exists
2. Display commit history
3. Show file changes if requested
4. Filter by file or date if specified

## Usage

```bash
# View last 10 commits
bun run $PAI_DIR/skills/version-control/scripts/ViewHistory.ts

# View last 20 commits
bun run $PAI_DIR/skills/version-control/scripts/ViewHistory.ts --limit 20

# View history for specific file
bun run $PAI_DIR/skills/version-control/scripts/ViewHistory.ts --file hooks/settings.json

# View with statistics
bun run $PAI_DIR/skills/version-control/scripts/ViewHistory.ts --format stat

# View since date
bun run $PAI_DIR/skills/version-control/scripts/ViewHistory.ts --since \"1 week ago\"
```

## Options

- `--limit N` - Number of commits to show (default: 10)
- `--file PATH` - Filter by file path
- `--since DATE` - Show commits since date
- `--format FORMAT` - Output format: short, full, or stat

**Done when:** User sees the requested commit history (and optional file/stat details).
