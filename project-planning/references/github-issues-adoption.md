# GitHub Issues platform

**Related:** [../SKILL.md](../SKILL.md) · [files-adoption.md](files-adoption.md)

**Load only when** `delivery_tracker: github-issues`. GitHub is the **backlog SSOT**. Do not create parallel markdown backlog files. GitHub issue numbers (`#123`) are the ids — not `EPIC-` / `STORY-` prefixes.

## Usage

Plan in the GitHub repository: **Issues** are the work items. Optional **Milestones** group issues by date; optional **Projects** (v2) provide a board. MCP/tooling for this tracker is not specified in this skill yet — discover available GitHub tools at runtime or stop if none exist.

## Native breakdown

```text
Repository
  ├── Milestone     ← optional dated grouping
  ├── Project (v2)  ← optional board / status
  └── Issue         ← deliverable (labels, assignees, body = AC + Sources)
        └── Task list / sub-issues  ← optional split
```

| Need | GitHub type | Notes |
|------|-------------|--------|
| Dated grouping | **Milestone** | Title + due date |
| Board / status | **Project** | Status field on the project |
| INVEST-sized work | **Issue** | Body holds AC and repo source links |
| Labels | **Label** | Filters, not hierarchy |

## Tool safety policy

- **Never allowed:** dual markdown + GitHub backlog; inventing files-platform prefixes as GitHub ids.

When GitHub MCP is not available, tell the user rather than writing `Epic-*.md` as a substitute.
