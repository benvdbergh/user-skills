# Frontmatter schema (normative)

**Scope:** Epic/story/task **markdown** when `delivery_tracker: files` (or omitted). Prefixes (`Epic-`, `EPIC-3`, `STORY-2-1`) are **files-platform only** — [files-adoption.md](files-adoption.md). When a tracker is backlog SSOT, do not create parallel markdown backlog files; use that platform's native types and ids ([SKILL.md § Platform guides](../SKILL.md#platform-guides)).

Manifest keys at the end of this file apply to all modes (`delivery_tracker`, `source_globs`). `naming.*` and epic/story dirs apply to **files** only.

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
| `naming.epic_prefix` | string | **Files only.** Filename prefix (default `Epic-`) — [files-adoption.md](files-adoption.md) |
| `naming.story_prefix` | string | **Files only.** Filename prefix (default `Story-`) |
| `naming.task_prefix` | string | **Files only.** Filename prefix for tasks (default `Task-`) |
| `delivery_tracker` | string | **Backlog SSOT.** `files` (default) or `linear` / `jira` / `github-issues` / `monday`. Load `references/<value>-adoption.md`. No parallel markdown when a tracker is set. |
| `tracker_index` | string | Optional path to URL-only index (e.g. `planning/tracker-index.md`) when using a tracker; not backlog SSOT. |

Obsolete keys in older manifests (e.g. `prompt_files`) are ignored by scripts.

See [../assets/default.project-planning.yaml](../assets/default.project-planning.yaml) for a starter file.
