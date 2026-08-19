# Linear platform

**Related:** [../SKILL.md](../SKILL.md) · [files-adoption.md](files-adoption.md) · [jira-adoption.md](jira-adoption.md)

**Load only when** `delivery_tracker: linear` (manifest or user). Linear is the **backlog SSOT**. Do not create parallel markdown backlog files. Do not invent `EPIC-` / `STORY-` ids — Linear identifiers (`BEN-123`, project slugs, milestone names) are the ids.

Repo **requirements** (`PRD.md`, specs, ADRs) remain SSOT in git; link them from Linear descriptions.

Guide for [Linear](https://linear.app/) via **official Linear MCP** (`plugin-linear-linear`; `https://mcp.linear.app/mcp` per [Linear MCP docs](https://linear.app/docs/mcp)).

## Usage

Plan in Linear: a **Project** holds dated **Milestones**; **Issues** belong to a milestone (and project). Use official Linear MCP. Optional [tracker-index.md](tracker-index.md) may list Linear URLs only.

## Native breakdown

```text
Initiative          ← strategy / horizon (product-roadmap)
  └── Project       ← delivery container for this effort
        └── Milestone   ← themed / dated outcome
              └── Issue     ← INVEST-sized deliverable with acceptance criteria
                    └── Sub-issue  ← optional split (`parentId`)
Cycle               ← team iteration (pull issues in when scheduling)
```

| Need | Linear type | Notes |
|------|-------------|--------|
| Strategy / horizon | **Initiative** | Owned with `product-roadmap`; link from the Project |
| Delivery container | **Project** | One per product/effort; record URL in `brief.md` |
| Themed / dated outcome | **Milestone** | Name + description + optional target date; belongs to a Project |
| INVEST-sized work | **Issue** | Title, markdown description (AC checklist), `milestone`, `project`, `team` |
| Optional split | **Sub-issue** | `parentId` on `save_issue` |
| Blockers | Issue relations | `blocks` / `blockedBy` on `save_issue` |
| Source links | Description **Sources** | Repo paths; optional `links` |
| Ready | Issue **state** | Team workflow (e.g. Backlog / Todo) — not markdown `status` |
| Iteration | **Cycle** | When pulling into a sprint |

Discover actual teams, projects, and states at runtime (`list_teams`, `list_projects`, `list_issue_statuses`).

## MCP dependencies

- **Server:** `plugin-linear-linear`
- **Auth:** OAuth via `mcp_auth` with `{}` if tools are missing, or Bearer per [Linear MCP docs](https://linear.app/docs/mcp)
- **Primary tools:** `list_teams`, `list_projects`, `save_project`, `list_milestones`, `save_milestone`, `get_milestone`, `list_issues`, `save_issue`, `get_issue`, `list_issue_statuses`, `list_cycles`

Discover tool schemas at runtime — do not assume parameter names from memory.

## Tool usage mapping

| Workflow step | MCP tool | Purpose | Safety |
|---------------|----------|---------|--------|
| Resolve team / project | `list_teams`, `list_projects`, `get_project` | Find containers | Safe |
| Create / update project | `save_project` | Delivery container | Safe |
| Create themed outcome | `save_milestone` | Milestone on a project (`name`, `description`, `targetDate`) | Safe |
| Create deliverable | `save_issue` | Issue with `title`, `team`, `project`, `milestone`, description | Safe |
| Split work | `save_issue` (`parentId`) | Sub-issue | Safe |
| Blockers | `save_issue` (`blocks` / `blockedBy`) | Relations (append-only) | Safe |
| Plan review | `list_milestones`, `list_issues`, `get_issue` | AC, orphans, blocker chains | Safe |
| Status update | `save_status_update` | Project/initiative update | Confirm |
| Archive / delete | (Linear UI or archive flows) | Destructive | User must confirm |

## Tool safety policy

- **Safe:** list/get; create/update project, milestone, issue; set relations and source links.
- **Requires confirmation:** project/initiative status updates; changing team-wide workflow; archive.
- **Never allowed:** deleting workspace data without an explicit user request; writing markdown `Epic-*.md` / `Story-*.md` as a second backlog.

## End-to-end workflow

### 1. Discover requirements (repo)

[artifact-discovery.md](artifact-discovery.md), **ScanSources.ts**. Apply [agile-foundations.md](agile-foundations.md) and [decomposition-patterns.md](decomposition-patterns.md) before creating Linear items.

### 2. Project

Ensure a **Project** exists (`list_projects` / `save_project`). Link an **Initiative** when roadmap context exists. Record the project URL in `brief.md` or optional [tracker-index.md](tracker-index.md).

### 3. Milestones

For each themed outcome, `save_milestone` with:

- `project` — name, id, or slug
- `name` — outcome title
- `description` — scope plus a **Sources** section (repo paths)
- `targetDate` — optional

Use Linear's milestone identity. Do not add `Planning ID: EPIC-n`.

### 4. Issues

For each INVEST-sized slice, `save_issue` with:

- `title`, `team` (required on create)
- `project`, `milestone`
- `description` — acceptance-criteria checklist and **Sources** links
- `priority`, `labels` as needed
- `blocks` / `blockedBy` after related issues exist

Use the Linear identifier (`TEAM-123`) as the stable id. Optional sub-issues via `parentId`.

### 5. Plan review

[plan-quality-review.md](plan-quality-review.md) tracker checklist, plus:

- Every in-scope issue has a milestone (or an explicit reason it does not)
- AC present in the issue description
- Blocker relations are acyclic
- No parallel markdown backlog for the same work

### 6. Agents and intake

Put acceptance criteria, source links, and repo/`AGENTS.md` paths in the **issue description**.

## Anti-patterns (Linear-specific)

- Treating a **Project** as the themed outcome — projects contain milestones; milestones group issues.
- Creating issues with no project/milestone when the team uses that hierarchy.
- Copying full PRD text into every issue — link to repo paths.
- Re-using files-platform prefixes (`EPIC-1`, `STORY-1-1`) as Linear ids.

## Migration from `files`

1. User confirms `delivery_tracker: linear`.
2. Create Project / Milestones / Issues from existing markdown (or start fresh). Linear ids replace markdown ids.
3. Optional [tracker-index.md](tracker-index.md) with Linear URLs.
4. Archive `Epics/` / `Stories/` after confirmation — do not maintain both.

## Escalation

| Need | Skill / file |
|------|----------------|
| Initiative / horizon | `product-roadmap` |
| PRD / spec | `specification` |
| Architecture | `software-architecture` |
| Markdown backlog | [files-adoption.md](files-adoption.md) |

## References

- [Linear](https://linear.app/)
- [Linear MCP documentation](https://linear.app/docs/mcp)
- [Linear MCP for product management](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management)
