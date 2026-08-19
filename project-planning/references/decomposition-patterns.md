# Decomposition patterns

Use after [artifact-discovery.md](artifact-discovery.md) has produced a source inventory.

## Epic boundaries

An **epic** should have:

- One clear outcome or theme (one-sentence goal).
- A bounded context: reasoning and tooling fit in one “chunk” for humans and agents.
- Links to sources via `traces_to` (markdown backlog) or a “Sources” section on the **native** tracker item (PRD sections, ADRs, architecture).

Avoid epics that are “the entire product” unless you immediately decompose to stories.

## Story splitting menu

When a story is too large or crosses many risks, split using one or more patterns:

1. **Workflow step** — Separate steps in a journey (e.g. draft vs submit vs notify).
2. **Business rule / variant** — Different rules or personas.
3. **Happy path vs edge cases** — Core flow first, errors and limits after.
4. **Interface / channel** — Only when delivery truly diverges (avoid premature split).
5. **Data or integration boundary** — When two integrations are independent enough to ship separately.

## BMAD-style sharding

**BMAD** (break PRD into themed outcomes then INVEST-sized slices) remains a valid *pattern*. Create those slices as the **platform's native types** — do not treat `EPIC-`/`STORY-` prefixes as a cross-platform language. It is one decomposition style among several—not the only workflow. Prefer vertical slices when the PRD describes user outcomes.

## Tasks (optional)

Use **task**-kind files for sub-story work that still benefits from dependencies and traceability (see [frontmatter-schema.md](frontmatter-schema.md)) when SSOT is `files`. On a tracker, use that platform's split type (sub-issue, sub-task, subitem). Do not replace deliverables with dozens of tasks unless the team needs that granularity.

## Walking skeleton

For new systems, consider a thin end-to-end path first (deploy, auth stub, one core flow), then deepen. Aligns with vertical slicing and story mapping.
