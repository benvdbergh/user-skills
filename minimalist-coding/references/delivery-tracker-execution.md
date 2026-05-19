# Delivery tracker execution

**Load when** a story, task, or tracker issue is in scope. Owns the execution workflow: read work item → claim (in progress) → implement → test → refactor → report outcome.

**Not in scope:** creating epics/stories, sharding PRDs, or plan review → `project-planning`.

## Context (where tasks live)

1. Read **`.project-planning.yaml`** at the project root: `delivery_tracker` (`files` | `linear` | …), optional `defaults.stories_dir` / `defaults.tasks_dir`.
2. Backlog SSOT rules: [project-planning § Delivery tracker](../../project-planning/SKILL.md#delivery-tracker-ssot) — follow that skill for *creating* work; this file for *executing* and updating status.

If the user gave an id, URL, or file path, **do not skip** tracker updates. Ad-hoc edits with no linked item: skip this reference.

## Practices (why bookends matter)

- **Start and close in the tracker** — the board answers “where is this?” without parallel Slack status.
- **Comment on every transition** — status alone is ambiguous; include progress, evidence, next steps, blockers.
- **Never mark done** with failing tests or unchecked acceptance criteria.
- **Blocked is a condition** — comment + relations; do not pretend the work finished.

## Lifecycle

```text
Pre-flight → Start → Implement (SearchPlanImplement + RefactorPass) → Close
```

### Pre-flight

1. Open the work item (issue, or markdown under manifest dirs).
2. Read title, acceptance criteria, and any source links in the description.
3. If not ready to implement (`ready` / team equivalent), stop and ask or escalate to `project-planning`.

### Start (before first code edit)

| `delivery_tracker` | Action |
|--------------------|--------|
| **files** | `status: in_progress`, bump `updated`; append **Execution log** (template below). |
| **linear** | `list_issue_statuses` if needed → `save_issue` (`state` = started) → `save_comment` (**Start**). |

### Implement

Run [SearchPlanImplement.md](SearchPlanImplement.md) and [RefactorPass.md](RefactorPass.md). On blocker mid-flight: **Blocker** comment; do not set terminal status; Linear `blockedBy` when applicable; files stay `in_progress`.

### Close (after tests + refactor pass)

| Outcome | **files** `status` | **linear** `state` (discover via MCP) |
|---------|-------------------|--------------------------------------|
| Completed | `done` | Terminal / Done |
| Handoff (review, deploy) | `done` | In Review or team handoff state |
| Blocked | `in_progress` | Unchanged; `blockedBy` if needed |
| Partial | `in_progress` or `ready` | Team-appropriate; explain in comment |
| Cancelled | `cancelled` | Canceled / Duplicate |

Post **Close** comment or execution log entry with evidence (PR, commit, paths, test command).

### Execution log / comment template

```markdown
### [Start | Blocker | Close] — YYYY-MM-DD

**Outcome:** completed | completed-handoff | blocked | partial | cancelled

**Progress** — …

**Evidence** — PR, commit, files touched, tests run

**Next steps** — (if not terminal)

**Blockers** — (if any)
```

## Linear MCP (`delivery_tracker: linear`)

**Server:** `plugin-linear-linear`. Read tool schemas before calling; `mcp_auth` if tools are missing.

| Step | Tool |
|------|------|
| Discover states | `list_issue_statuses` |
| Read issue | `get_issue` |
| Change state | `save_issue` (`id`, `state`; optional `links` for PR) |
| Narrative | `save_comment` |

**Safety:** Safe — read, list statuses, update state, comment. Confirm with user — archive/delete issue, change milestone or project.

## Markdown (`delivery_tracker: files`)

Edit the work item file: frontmatter `status` / `updated`; append `## Execution log`. Status vocabulary: [frontmatter-schema](../../project-planning/references/frontmatter-schema.md). Do not rely on `StoryManager.ts --action update` (not implemented).

## Anti-patterns

- Code without moving to in progress first.
- Done without tests or evidence in the ticket.
- Status-only updates with no comment.
- Duplicating markdown backlog when tracker is Linear SSOT.
- Guessing Linear state names without `list_issue_statuses`.

## Escalation

| Need | Skill |
|------|--------|
| New / replan backlog items | `project-planning` |
| Architecture | `software-architecture` |
| Git / rollback | `version-control` |
| PR review (not implementation) | `code-review-skill` |
