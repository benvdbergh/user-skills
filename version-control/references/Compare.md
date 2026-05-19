# Compare

Diff two refs (commits, tags, or branches).

## Usage

```bash
bun run $VC_SCRIPTS/CompareVersions.ts --from <hash1> --to <hash2>
bun run $VC_SCRIPTS/CompareVersions.ts --from <hash> --to HEAD
bun run $VC_SCRIPTS/CompareVersions.ts --from checkpoint-v1 --to checkpoint-v2
bun run $VC_SCRIPTS/CompareVersions.ts --from <hash1> --to <hash2> --file path/to/file.ts
bun run $VC_SCRIPTS/CompareVersions.ts --from a --to b --stat
```

**Done when:** diff or stat output is displayed.
