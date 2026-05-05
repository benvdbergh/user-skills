# DescribeBranch

Update stored purpose/description for a branch.

## Usage

```bash
bun run $VC_SCRIPTS/ManageBranches.ts describe \
  --name "main" \
  --purpose "Default integration branch"

bun run $VC_SCRIPTS/ManageBranches.ts describe \
  --name "feature-x" \
  --description "Adds export API" \
  --purpose "Shipping CSV export for reporting"
```

Metadata is written to `.vc-branches.json`.

**Done when:** metadata for the branch is updated.
