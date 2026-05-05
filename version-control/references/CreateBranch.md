# CreateBranch

Create a branch and record optional metadata in `.vc-branches.json`.

## Usage

```bash
bun run $VC_SCRIPTS/ManageBranches.ts create \
  --name "feature-name" \
  --description "What this branch contains" \
  --purpose "Why it exists / AI or human context"

bun run $VC_SCRIPTS/ManageBranches.ts create \
  --name "hotfix" \
  --description "Emergency fix" \
  --purpose "Production incident response" \
  --from "main"
```

**Done when:** the branch exists, is checked out, and metadata is saved under `.vc-branches.json` (while still honoring any legacy metadata file on read).
