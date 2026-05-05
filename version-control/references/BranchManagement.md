# Branch metadata

Optional JSON sidecar in the repository root for human- and agent-readable branch context.

## Files

- **Canonical:** `.vc-branches.json`
- **Legacy:** an older default metadata file in the repo root is still **read** if `.vc-branches.json` is missing; new writes always use `.vc-branches.json`.

## Shape

```json
{
  "branches": {
    "main": {
      "description": "Short summary",
      "purpose": "Why this branch exists",
      "created": "ISO-8601",
      "lastUsed": "ISO-8601"
    }
  }
}
```

## Commands

See `CreateBranch.md`, `DescribeBranch.md`, `ListBranches.md`, `SwitchBranch.md`, `DeleteBranch.md`.

**Done when:** metadata reflects the branches you care about and stays in version control if you choose to commit it.
