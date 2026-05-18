# Frontmatter schema (normative)

**Scope:** Epic/story/task **markdown** work items when `delivery_tracker: files` (or omitted). When a delivery tracker is backlog SSOT, do not create parallel markdown backlog files — use tracker fields per [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot) and the platform guide (e.g. [linear-adoption.md](linear-adoption.md)).

Manifest keys at the end of this file apply to all modes.

Work items are Markdown files with YAML frontmatter. Scripts (`LintPlan.ts`, managers) use these fields. **`kind` + `id` + `title` are required** for lint validation of new content.

## Common fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `kind` | string | yes | `epic`, `story`, or `task` |
| `id` | string | yes | Stable id, e.g. `EPIC-3`, `STORY-3-2` |
| `title` | string | yes | Short title (can mirror H1) |
| `status` | string | recommended | `draft`, `ready`, `in_progress`, `done`, `cancelled`, `planned` |
| `parent` | string | stories/tasks | Parent work item `id` (usually epic id) |
| `depends_on` | string[] | optional | Ids that must complete first (DAG edges) |
| `blocks` | string[] | optional | Inverse hint; may be derived by tools |
| `traces_to` | list | recommended for `ready` | See below |
| `slice` | string | optional | `vertical`, `horizontal`, or `spike` |
| `invest_check` | object | optional | Booleans: `independent`, `negotiable`, `valuable`, `estimable`, `small`, `testable` |
| `acceptance_criteria` | string[] | optional | Testable criteria |
| `priority` | string | optional | e.g. `low`, `medium`, `high` |
| `created` | string | optional | ISO date |
| `updated` | string | optional | ISO date |

## traces_to

Each entry is either:

- A string path (relative to project root preferred), or
- An object: `{ path: "docs/PRD.md", anchor: "#auth" }`

## Aliases (transitional)

`LintPlan.ts` also recognizes:

- `type` as alias for `kind` (`epic` / `story`)
- `story_id` / `epic_id` as alias for `id`

Prefer the canonical names for new files.

## Example epic

```yaml
---
kind: epic
id: EPIC-2
title: Authentication and sessions
status: draft
depends_on: []
traces_to:
  - path: PRD.md
    anchor: "#security"
slice: vertical
acceptance_criteria: []
---
```

## Example story

```yaml
---
kind: story
id: STORY-2-1
title: Sign in with SSO
status: draft
parent: EPIC-2
depends_on: []
traces_to:
  - path: docs/adr/003-auth.md
slice: vertical
invest_check:
  independent: true
  negotiable: true
  valuable: true
  estimable: true
  small: true
  testable: true
acceptance_criteria:
  - Given a valid IdP response, user session is created
---
```

## Manifest file: `.project-planning.yaml`

Stored at the **project root** (or path passed via `--config`). Keys:

| Key | Type | Description |
|-----|------|-------------|
| `version` | number | Schema version (use `1`) |
| `defaults.epics_dir` | string | Relative dir for epic files |
| `defaults.stories_dir` | string | Relative dir for story files |
| `defaults.tasks_dir` | string? | Optional tasks directory |
| `source_globs` | string[] | Globs for `ScanSources.ts` (relative to root) |
| `naming.epic_prefix` | string | Filename prefix (default `Epic-`) |
| `naming.story_prefix` | string | Filename prefix (default `Story-`) |
| `naming.task_prefix` | string | Filename prefix for tasks (default `Task-`) |
| `delivery_tracker` | string | **Backlog SSOT.** `files` (default) = epic/story markdown; `linear`, `jira`, `github-issues`, `monday` = backlog in tracker only — no parallel markdown. See [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot). |
| `tracker_index` | string | Optional path to URL-only index (e.g. `planning/tracker-index.md`) when using a tracker; not backlog SSOT. |

Obsolete keys in older manifests (e.g. `prompt_files`) are ignored by scripts.

See [../assets/default.project-planning.yaml](../assets/default.project-planning.yaml) for a starter file.
