# Plan quality review

Use for “review plan”, “validate planning”, or before marking work ready in the SSOT.

Resolve backlog SSOT first, then load the platform file ([SKILL.md § Platform guides](../SKILL.md#platform-guides)). Apply **one** checklist below. Type-specific checks (milestones vs epics vs issues) live on the platform page — do not re-map them here.

## When `delivery_tracker: files` (markdown backlog)

See also [files-adoption.md](files-adoption.md).

### Structure

- [ ] Epics have clear single-theme goals and `traces_to` where applicable.
- [ ] Stories are INVEST-aligned; prefer `slice: vertical` for user-facing work.
- [ ] `depends_on` is documented; no cycles (run `LintPlan.ts`).
- [ ] Every `status: ready` story has non-empty `traces_to` and testable `acceptance_criteria`.

### Duplication and gaps

- [ ] No duplicate story titles/ids; split or merge intentionally.
- [ ] No orphan stories (parent epic id exists or is explained).
- [ ] Platform-heavy horizontal work is justified in epic/story notes.

### Sources

- [ ] Source inventory from [artifact-discovery.md](artifact-discovery.md) is reflected in planning (not ignored).
- [ ] ADRs and PRD conflicts are called out, not papered over.

### Scripting

```bash
bun run $PAI_DIR/skills/project-planning/scripts/LintPlan.ts --root <path>
```

Fix reported errors before calling planning “complete” for file-based backlog.

## When a delivery tracker is SSOT

Do **not** treat `Epics/` / `Stories/` markdown as backlog or run `LintPlan.ts` on them unless migrating from legacy files.

Load the platform file and use **its** native types for structure (e.g. Linear milestones/issues, Jira epics/stories).

### Structure (tracker)

- [ ] Each grouping item (per platform file) has one theme / outcome.
- [ ] Deliverables are INVEST-sized and linked to the correct parent/container.
- [ ] Blockers use tracker relations — [dependencies-and-sequencing.md](dependencies-and-sequencing.md) and the platform file.
- [ ] Each in-scope deliverable has testable acceptance criteria in its native description.

### Duplication and gaps (tracker)

- [ ] No duplicate items for the same slice; no orphans without a parent/container (unless explained).
- [ ] No parallel markdown epic/story files for the same backlog items.

### Sources (tracker)

- [ ] Repo requirements (PRD, ADR, spec) linked on the native items — [traceability-and-sources.md](traceability-and-sources.md).
- [ ] Source inventory from artifact discovery is reflected; conflicts called out.

### Platform review

- [ ] Review via tracker MCP/API per the platform file.
- [ ] Optional [tracker-index.md](tracker-index.md) updated if the project keeps URL pointers only (native ids, not `EPIC-`/`STORY-` prefixes).

Call planning “complete” when the tracker checklist **and** the platform file’s review notes pass — not when markdown lint passes.

## Relation to PlanReview

[PlanReview.md](PlanReview.md) routes here by SSOT mode and to init/review scripts.
