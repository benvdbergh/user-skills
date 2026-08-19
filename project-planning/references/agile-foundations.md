# Agile foundations for planning

Load this when decomposing requirements, refining backlogs, or validating stories.

## INVEST (user stories)

Good stories tend to be:

- **Independent** — Can be prioritized and delivered with minimal hard ordering constraints.
- **Negotiable** — Scope and solution details are discussed, not frozen upfront.
- **Valuable** — Clear user or business outcome.
- **Estimable** — Team can size risk/effort enough to plan.
- **Small** — Fits iteration capacity (avoid “epic disguised as a story”).
- **Testable** — Observable completion.

When SSOT is `files`, the optional `invest_check` object in work-item frontmatter records an explicit pass/fail per dimension ([frontmatter-schema.md](frontmatter-schema.md)). On a tracker, record the same bar in the native item (description or fields) per the platform file.

## Vertical vs horizontal slices

- **Vertical slice** — Delivers a thin end-to-end outcome (e.g. one user-visible behavior touching UI + API + persistence as needed). Prefer for features when you want feedback and reduced integration risk.
- **Horizontal slice** — Same layer across many features (e.g. “all DB migrations”). Use when platform work truly blocks many tracks, but avoid defaulting to this—it defers value.

On `files`, set `slice: vertical` or `slice: horizontal` (or `spike`) on the work item. On a tracker, use labels or description notes per the platform file.

## Definition of Ready (DoR)

Before marking a deliverable ready in the backlog **SSOT**:

- Dependencies identified and feasible ordering exists (`depends_on` in markdown, or native blocker relations in a tracker — [dependencies-and-sequencing.md](dependencies-and-sequencing.md)).
- Acceptance criteria are testable (frontmatter/body or the native item description).
- Source traceability points at specs/ADRs (`traces_to` or tracker “Sources” — [traceability-and-sources.md](traceability-and-sources.md)).
- Unknowns are either small or spun out as spikes.

“Ready” is the platform’s equivalent state — see the loaded `<tracker>-adoption.md`.

## Definition of Done (DoD)

Team-specific; typical elements: tests passing, docs updated, traces preserved, feature flags off default-on where relevant. Planning skill: ensure **acceptance_criteria** in frontmatter/body match what DoD will verify.

## User story mapping (summary)

Arrange work along the **user journey** (backbone, left to right). Below each step, add variations and depth. **Release slices** are horizontal cuts through the map that deliver a coherent thin outcome (MVP / experiment / milestone). Use this before flattening everything into a single backlog.

## Spikes

Time-boxed research or prototype work when estimation or feasibility is unknown. On `files`, use `slice: spike`. Narrow acceptance criteria (e.g. “document recommendation + tradeoffs”).
