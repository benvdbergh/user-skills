# monday.com platform

**Related:** [../SKILL.md](../SKILL.md) · [files-adoption.md](files-adoption.md)

**Load only when** `delivery_tracker: monday`. monday.com is the **backlog SSOT**. Do not create parallel markdown backlog files. monday item ids are the ids — not `EPIC-` / `STORY-` prefixes.

## Usage

Plan on a monday **Board**. Groups cluster work; **Items** are the deliverables. MCP/tooling for this tracker is not specified in this skill yet — discover available monday tools at runtime or stop if none exist.

## Native breakdown

```text
Workspace
  └── Board
        └── Group     ← cluster / theme
              └── Item      ← deliverable (updates + columns)
                    └── Subitem  ← optional split
```

| Need | monday type | Notes |
|------|-------------|--------|
| Delivery container | **Board** | One board (or workspace board) for the effort |
| Theme / cluster | **Group** | Board section |
| INVEST-sized work | **Item** | Description/updates hold AC and source links |
| Optional split | **Subitem** | Child of an item |
| Status / ready | Status **column** | Board workflow, not markdown `status` |

## Tool safety policy

- **Never allowed:** dual markdown + monday backlog; inventing files-platform prefixes as monday ids.

When monday MCP is not available, tell the user rather than writing `Epic-*.md` as a substitute.
