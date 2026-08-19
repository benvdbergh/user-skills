# Jira platform

**Related:** [../SKILL.md](../SKILL.md) · [files-adoption.md](files-adoption.md) · [linear-adoption.md](linear-adoption.md)

**Load only when** `delivery_tracker: jira` (manifest or user). Jira is the **backlog SSOT**. Do not create parallel markdown backlog files. Do not invent `EPIC-` / `STORY-` filename prefixes — Jira issue keys (`PROJ-123`) are the ids.

Repo **requirements** remain SSOT in git; link them from Jira descriptions.

## Usage

Plan in Jira using the project's **issue types and hierarchy** (typically Epic → Feature → Story). Discover actual types with Atlassian MCP before creating work. Optional [tracker-index.md](tracker-index.md) may list Jira URLs only.

## Native breakdown

Jira layouts vary by project (company-managed vs team-managed, Advanced Roadmaps). **Discover** types with `jira_get_project_issue_types` rather than assuming names.

Typical software-project shape:

```text
Initiative / parent (optional, often another project or Advanced Roadmaps)
  └── Epic
        └── Feature     ← when the project uses this type
              └── Story / Task / Bug
                    └── Sub-task
Sprint / Board        ← iteration, not a backlog type
```

| Need | Jira type (when present) | Notes |
|------|--------------------------|--------|
| Large outcome | **Epic** | Parent for stories/features; issue key is the id |
| Mid-level grouping | **Feature** | Only if the project defines it — confirm via issue types |
| INVEST-sized work | **Story** (or Task) | Description holds AC + **Sources**; `parent` = Epic/Feature |
| Optional split | **Sub-task** | Child of a Story/Task |
| Blockers | Issue **links** | e.g. Blocks / is blocked by |
| Source links | Description (and remote links if used) | Repo paths |
| Ready | Workflow **status** | Project workflow, not markdown `status` |

`jira_get_project_epic_hierarchy` shows how epics roll up to cross-project parents.

## MCP dependencies

- **Server:** `user-mcp-atlassian`
- **Primary tools:** `jira_search_projects`, `jira_get_project_issue_types`, `jira_get_create_fields`, `jira_get_project_fields`, `jira_get_project_epic_hierarchy`, `jira_get_cross_project_dependencies`, `jira_assign_issue`, `jira_move_issues_to_backlog`
- **Usage:** Discover project, types, and required fields first. Create/update issue tools may be absent — if creation is not available, stop and tell the user rather than writing markdown backlog as a substitute.

Discover tool schemas at runtime.

## Tool usage mapping

| Workflow step | MCP tool | Purpose | Safety |
|---------------|----------|---------|--------|
| Resolve project | `jira_search_projects` | Project key | Safe |
| List types | `jira_get_project_issue_types` | Epic / Feature / Story ids | Safe |
| Required fields | `jira_get_create_fields` | Create schema for a type | Safe |
| Hierarchy view | `jira_get_project_epic_hierarchy` | Epic roll-up | Safe |
| Cross-project deps | `jira_get_cross_project_dependencies` | Links across keys | Safe |
| Assign / backlog | `jira_assign_issue`, `jira_move_issues_to_backlog` | Workflow | Confirm |
| Create issue | (only if a create tool is present) | New Epic/Feature/Story | Safe when tool exists |

## Tool safety policy

- **Safe:** search projects; read issue types, fields, hierarchy, dependencies.
- **Requires confirmation:** assign; move to backlog; cross-project move (`jira_move_issue`).
- **Never allowed:** inventing files-platform prefixes as Jira keys; dual markdown + Jira backlog; creating issues if no create tool is available (ask the user).

## End-to-end workflow

1. Discover repo requirements — [artifact-discovery.md](artifact-discovery.md).
2. Resolve Jira project (`jira_search_projects`) and **actual** issue types.
3. Create (or ask the user to create) Epics, then Features if used, then Stories with AC and source links.
4. Link blockers with Jira issue links.
5. Review with [plan-quality-review.md](plan-quality-review.md) plus this project's type hierarchy.

## Anti-patterns (Jira-specific)

- Assuming every project has Feature — many do not.
- Using markdown `EPIC-n` instead of the Jira key.
- Duplicating the PRD into every story.

## Escalation

| Need | Skill / file |
|------|----------------|
| PRD / spec | `specification` |
| Initiative / horizon | `product-roadmap` |
| Markdown backlog | [files-adoption.md](files-adoption.md) |
