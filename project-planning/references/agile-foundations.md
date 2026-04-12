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

Use the optional `invest_check` object in work-item frontmatter to record an explicit pass/fail per dimension (see [frontmatter-schema.md](frontmatter-schema.md)).

## Vertical vs horizontal slices

- **Vertical slice** — Delivers a thin end-to-end outcome (e.g. one user-visible behavior touching UI + API + persistence as needed). Prefer for features when you want feedback and reduced integration risk.
- **Horizontal slice** — Same layer across many features (e.g. “all DB migrations”). Use when platform work truly blocks many tracks, but avoid defaulting to this—it defers value.

Set `slice: vertical` or `slice: horizontal` (or `spike`) on the work item.

## Definition of Ready (DoR)

Before marking a story `ready`:

- Dependencies identified (`depends_on`) and feasible ordering exists.
- Acceptance criteria are testable.
- Source traceability (`traces_to`) points at specs/ADRs where applicable.
- Unknowns are either small or spun out as spikes.

## Definition of Done (DoD)

Team-specific; typical elements: tests passing, docs updated, traces preserved, feature flags off default-on where relevant. Planning skill: ensure **acceptance_criteria** in frontmatter/body match what DoD will verify.

## User story mapping (summary)

Arrange work along the **user journey** (backbone, left to right). Below each step, add variations and depth. **Release slices** are horizontal cuts through the map that deliver a coherent thin outcome (MVP / experiment / milestone). Use this before flattening everything into a single backlog.

## Spikes

Time-boxed research or prototype stories when estimation or feasibility is unknown. Use `slice: spike` and narrow acceptance criteria (e.g. “document recommendation + tradeoffs”).
