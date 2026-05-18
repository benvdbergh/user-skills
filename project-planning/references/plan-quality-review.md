# Plan quality review

Use for “review plan”, “validate planning”, or before marking a milestone ready.

Resolve backlog SSOT first: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot). Apply **one** checklist below.

## When `delivery_tracker: files` (markdown backlog)

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

## When a delivery tracker is SSOT (e.g. `linear`)

Do **not** treat `Epics/` / `Stories/` markdown as backlog or run `LintPlan.ts` on them unless migrating from legacy files.

### Structure (tracker)

- [ ] Epics map to milestones (or platform equivalent); one theme per milestone.
- [ ] Stories map to issues; INVEST-sized; linked to the correct milestone/project.
- [ ] Blockers use tracker relations (e.g. issue `blocks` / `blocked by`) — see [dependencies-and-sequencing.md](dependencies-and-sequencing.md).
- [ ] Each in-scope issue has testable acceptance criteria in its description.

### Duplication and gaps (tracker)

- [ ] No duplicate issues for the same story; no orphan issues without a milestone/parent.
- [ ] No parallel markdown epic/story files for the same backlog items.

### Sources (tracker)

- [ ] Repo requirements (PRD, ADR, spec) linked in milestone/issue “Sources” sections — [traceability-and-sources.md](traceability-and-sources.md).
- [ ] Source inventory from artifact discovery is reflected; conflicts called out.

### Platform review

- [ ] Review via tracker MCP/API per platform guide (e.g. [linear-adoption.md](linear-adoption.md)).
- [ ] Optional [tracker-index.md](tracker-index.md) updated if the project keeps URL pointers only.

Call planning “complete” when the tracker checklist passes — not when markdown lint passes.

## Relation to PlanReview

[PlanReview.md](PlanReview.md) routes here by SSOT mode and to init/review scripts.
