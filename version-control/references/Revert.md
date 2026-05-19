# Revert

Revert commits, restore paths from `HEAD`, or discard uncommitted work in the selected repository.

## Usage

```bash
bun run $VC_SCRIPTS/RevertChange.ts --commit <hash>
bun run $VC_SCRIPTS/RevertChange.ts --commit <hash> --hard
bun run $VC_SCRIPTS/RevertChange.ts --file path/to/file.ts
bun run $VC_SCRIPTS/RevertChange.ts --hard
```

**Done when:** the working tree matches the chosen revert/restore outcome.
