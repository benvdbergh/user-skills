# BootstrapForkLedger

Create and seed `FORK.md` so fork intent is explicit.

## Steps

1. Confirm remotes:
   - `origin` should point to fork.
   - `upstream` should point to parent (add if missing).
2. Identify baseline:
   - default branch names (`main`/`master`),
   - ahead/behind counts vs upstream,
   - high-change areas (modules with repeated divergence).
3. Generate initial `FORK.md` using the template below.
4. Add first ledger entries:
   - features added in fork,
   - issue fixes that diverge,
   - operational customizations.
5. If available, create a checkpoint with `version-control` before first sync.

## FORK.md Template

```markdown
# FORK

## Fork Metadata
- Parent repo: <org/repo>
- Fork repo: <org/repo>
- Upstream default branch: <branch>
- Fork default branch: <branch>
- Maintainers: <names>

## Fork Policy
- Goal: <why this fork exists>
- Divergence policy: minimize / strategic / productized
- Sync cadence: weekly / biweekly / monthly / event-driven
- Preferred sync mode: merge / rebase (with constraints)

## Divergence Ledger
| Area | Type | Keep/Adopt/Hybrid | Reason | Last Reviewed | Parent Link |
|------|------|-------------------|--------|---------------|-------------|
| path/or/module | feature/fix/customization | Keep | Needed for X | YYYY-MM-DD | issue/pr/url |

## Sync History
| Date | Upstream Ref | Result | Notes |
|------|--------------|--------|-------|
| YYYY-MM-DD | upstream/main@<sha> | success/partial | conflict summary |

## Upstream Contribution Log
| Date | Branch | PR URL | Status | Notes |
|------|--------|--------|--------|-------|
| YYYY-MM-DD | fork/fix-xyz | <url> | open/merged/closed | summary |
```

**Done when:** `FORK.md` exists with metadata, policy, and at least one divergence entry.
