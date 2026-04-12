# Dependencies and sequencing

## Modeling dependencies

Use frontmatter `depends_on: [STORY-1, EPIC-2]` for **hard** prerequisites: the item should not start until those ids are done.

- **Upstream** — Items listed in `depends_on`.
- **Downstream** — Items that list this id in their `depends_on` (can be derived by `LintPlan.ts` / graph output).
- **Parallel work** — No edge between items; ordering is by priority only.

Optional `blocks` in frontmatter is a human hint; scripts may treat it as documentation-only unless you standardize otherwise.

## Reducing coupling

Prefer:

- **Interfaces and stubs** — So downstream can start with a contract.
- **Feature flags** — Ship dark, enable incrementally.
- **Splitting stories** — So “must wait for entire platform layer” becomes “wait for narrow API”.

When dependency chains grow long, call out a **critical path** in epic notes (narrative), not only in graphs.

## Cycles

`depends_on` must be acyclic at the **id** level. `LintPlan.ts` reports cycles.

## Ordering for agents

When generating plans:

1. Topologically sort by `depends_on` where possible.
2. Apply priority and value (MVP slices from story mapping).
3. Flag items with missing upstream ids (broken references).
