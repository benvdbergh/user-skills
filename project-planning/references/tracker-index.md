# Tracker index (optional, not SSOT)

When `delivery_tracker` is **not** `files`, the backlog lives in the tracker. This file is **optional** — use it only if the team wants repo-visible pointers without duplicating backlog content.

## Rules

- **Not SSOT** — no titles, descriptions, acceptance criteria, status, or `depends_on` copies.
- **Allowed:** tracker type, project/team ids, and tables of `Planning ID` → URL (or tracker id).
- **Update** when creating or renaming milestones/issues; link from `brief.md` if helpful.

## Example (`planning/tracker-index.md`)

```markdown
# Backlog index (Linear is SSOT)

delivery_tracker: linear
project: https://linear.app/<workspace>/project/<slug>

| Planning ID | Type | URL |
|-------------|------|-----|
| EPIC-1 | milestone | https://linear.app/.../milestone/... |
| STORY-1-1 | issue | https://linear.app/.../issue/ENG-123 |
```

Planning IDs are labels or description footers on tracker items — see [linear-adoption.md](linear-adoption.md).
