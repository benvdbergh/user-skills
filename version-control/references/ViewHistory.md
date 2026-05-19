# ViewHistory

Show commit history for the selected repository.

## Usage

`VC_SCRIPTS` = path to `version-control/scripts`. Set `REPO_ROOT` or run from the repo root.

```bash
bun run $VC_SCRIPTS/ViewHistory.ts
bun run $VC_SCRIPTS/ViewHistory.ts --limit 20
bun run $VC_SCRIPTS/ViewHistory.ts --file path/to/file.ts
bun run $VC_SCRIPTS/ViewHistory.ts --format stat
bun run $VC_SCRIPTS/ViewHistory.ts --since "1 week ago"
```

**Done when:** the requested log output is shown.
