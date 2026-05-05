---
name: fork-management
description: >-
  Governs long-lived GitHub forks using a FORK.md ledger, upstream sync decisions,
  and contribution workflows back to parent repositories. Use when the user mentions
  maintaining a fork, syncing with upstream/parent, deciding whether to keep fork
  patches vs adopt parent changes, documenting fork-only modifications, or opening
  pull requests from a fork to upstream.
---

# fork-management

Fork maintenance workflow for tracking intentional divergence and keeping forks healthy over time.

## Purpose

This skill manages fork-specific strategy and records decisions in `FORK.md`.

It does **not** replace `version-control`:
- `fork-management` decides *what* should happen for upstream sync and fork policy.
- `version-control` executes/records generic git state actions (checkpoint, compare, commit, branch handling).

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **BootstrapForkLedger** | "create FORK.md", "set up fork tracking", "initialize fork policy" | `references/bootstrap-fork-ledger.md` |
| **SyncFromParent** | "sync fork", "bring upstream changes", "reconcile parent changes" | `references/sync-from-parent.md` |
| **ContributeUpstreamPR** | "open PR to parent", "send fork changes upstream", "upstream contribution" | `references/contribute-upstream-pr.md` |
| **ForkPolicyReview** | "review fork divergence", "is this fork still healthy", "audit fork customizations" | `references/fork-policy-review.md` |

## Use Cases

### Use Case 1: Establish fork governance
- **Trigger:** User says "set up a FORK.md for this repo".
- **Steps:** infer parent/fork remotes, generate baseline `FORK.md`, classify current divergence, create initial sync policy.
- **Tools:** git/gh CLI, markdown editing.
- **Result:** fork has an explicit ledger of why it diverges and how sync should be decided.

### Use Case 2: Sync parent while preserving intended customizations
- **Trigger:** User says "sync upstream but keep our custom adapter patch".
- **Steps:** fetch parent, diff impacted files, apply decision matrix (adopt parent / keep fork / hybrid), resolve conflicts, update ledger with rationale.
- **Tools:** git, `version-control` compare/checkpoint workflows, markdown editing.
- **Result:** parent changes integrated safely and all exceptions documented.

### Use Case 3: Upstream contribution from fork
- **Trigger:** User says "submit this feature back to parent".
- **Steps:** isolate contribution branch, validate local diff quality, prepare PR message with intent and risk notes, open upstream PR.
- **Tools:** git, gh CLI, `version-control` branch/checkpoint workflows.
- **Result:** clean, reviewable pull request from fork to parent with traceable context.

## Prior Art Summary

Common fork-maintenance guidance converges on: keep a dedicated upstream remote, sync frequently, and avoid silent divergence. Upstream integration is typically merge or rebase based on branch-sharing constraints; rebase is cleaner for single-owner branches, merge is safer when history rewriting is risky. Sustainable long-lived forks use an explicit patch policy so decisions are repeatable, plus regular upstreaming of generally useful changes to reduce future maintenance burden. This skill adopts those patterns by centering workflow decisions in `FORK.md` and reusing `version-control` for low-level git mechanics.

## Integration With version-control

- Reuse `version-control` for:
  - Compare (`references/Compare.md`) before and after sync.
  - Checkpoint (`references/Checkpoint.md`) before risky reconciliation.
  - Branch operations when preparing upstream PR work.
  - Pending-action handling when your environment uses optional pending JSON files.
- Do not duplicate:
  - Generic git initialization, checkpoint tagging, or repo history utilities.
- Additional expectation:
  - `fork-management` updates project-level `FORK.md`; `version-control` operates on the git tree (set `REPO_ROOT` / `GIT_WORK_TREE` or run from the repo root).

## Decision Model

For each changed area during sync:
1. **Parent changed + fork unchanged** -> take parent change.
2. **Parent unchanged + fork changed** -> keep fork change.
3. **Both changed, same intent** -> prefer parent implementation if equivalent or better.
4. **Both changed, fork-specific intent** -> keep fork change and annotate future recheck criteria.
5. **Both changed, incompatible** -> create explicit hybrid patch and record conflict rationale.

## Output Contract

After any significant sync or upstream PR workflow, the skill updates `FORK.md` with:
- upstream base and sync date,
- impacted areas/files,
- decision per area (adopt parent / keep fork / hybrid),
- rationale and follow-up action,
- PR linkage where relevant.

## Examples

**Example 1: Initialize ledger**
```text
User: "Create a FORK.md for this repository."
-> BootstrapForkLedger workflow
-> Detect origin/upstream remotes
-> Build baseline divergence table
-> Write FORK.md with sync policy and first entries
```

**Example 2: Parent sync with selective retention**
```text
User: "Sync upstream main, but keep our custom UI telemetry behavior."
-> SyncFromParent workflow
-> Checkpoint current state
-> Fetch + reconcile upstream/main
-> Keep fork change for telemetry files; adopt parent elsewhere
-> Update FORK.md decisions and next review date
```

**Example 3: Upstream PR**
```text
User: "Open a parent PR for our bug fix."
-> ContributeUpstreamPR workflow
-> Isolate minimal branch and remove fork-only noise
-> Push and create PR with motivation + test evidence
-> Record PR link and status in FORK.md
```
