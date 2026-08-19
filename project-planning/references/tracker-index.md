# Tracker index (optional, not SSOT)

When `delivery_tracker` is **not** `files`, the backlog lives in the tracker. This file is **optional** — use it only if the team wants repo-visible pointers without duplicating backlog content.

## Rules

- **Not SSOT** — no titles, descriptions, acceptance criteria, status, or dependency copies.
- **Allowed:** tracker type, project/team ids, and tables of **native tracker id** → URL.
- **Update** when creating or renaming tracker items; link from `brief.md` if helpful.
- Do **not** use files-platform prefixes (`EPIC-1`, `STORY-1-1`) as the index key.

## Example (`planning/tracker-index.md`)

```markdown
# Backlog index (Linear is SSOT)

delivery_tracker: linear
project: https://linear.app/<workspace>/project/<slug>

| Identifier | Type | URL |
|------------|------|-----|
| Auth slice | milestone | https://linear.app/.../milestone/... |
| BEN-123 | issue | https://linear.app/.../issue/BEN-123 |
```

Identifiers come from the platform (Linear keys, Jira keys, GitHub `#n`) — see the matching `<tracker>-adoption.md`.
