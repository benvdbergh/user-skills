# Traceability and sources

| Layer | Where links live |
|-------|------------------|
| Requirements (PRD, ADR, spec) | Repo files — always |
| Backlog (`files`) | `traces_to` in epic/story frontmatter |
| Backlog (tracker) | “Sources” in milestone/issue descriptions; optional [tracker-index.md](tracker-index.md) |

How to choose backlog SSOT: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot).

## traces_to (file-based backlog only)

Every **story** moving to `ready` should cite sources in `traces_to` (see [frontmatter-schema.md](frontmatter-schema.md)):

- **PRD / spec** — Product intent and acceptance context.
- **ADRs** — Decisions that constrain implementation.
- **Architecture** — arc42 sections, C4, diagrams, OpenAPI paths—whatever the repo uses.

Use `{ path, anchor }` when a heading anchor exists for stable references.

## PRD vs ADR

- **PRD** — What the product should do for users and business.
- **ADR** — Why a technical choice was made, alternatives, consequences.

Planning items should link to **both** when relevant; avoid duplicating full spec text in epics—summarize and link.

## As-built vs to-be

When refactoring or migrations, capture in the body (or a short field in notes):

- **Current behavior** — What exists today (pointer to code/docs).
- **Target behavior** — What the story delivers.

This reduces “already done” confusion during sharding.

## Orphan work items

Items with no `traces_to` and no clear parent may be experimental—either link them or keep `status: draft` until sourced.
