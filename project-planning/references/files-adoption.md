# Files platform (markdown backlog)

**Related:** [../SKILL.md](../SKILL.md) · [linear-adoption.md](linear-adoption.md) · [jira-adoption.md](jira-adoption.md)

**Load only when** `delivery_tracker` is `files` or omitted. Markdown under `Epics/` and `Stories/` is the **backlog SSOT**. Otherwise load the matching `<tracker>-adoption.md` instead.

## Usage

Plan in the repo as Markdown files with YAML frontmatter. Filename **prefixes** and stable **ids** (`Epic-`, `EPIC-3`, `STORY-2-1`) belong **only** to this platform. Scripts (`EpicManager`, `StoryManager`, `LintPlan`) apply here only.

## Native breakdown

```text
Project root
  ├── Epics/     Epic-N-<slug>.md     ← themed outcome
  ├── Stories/   Story-N-M-<slug>.md  ← INVEST-sized slice (parent = epic id)
  └── (optional) Tasks/  Task-*.md    ← sub-slice under a story
```

| Need | Files type | How it is identified |
|------|------------|----------------------|
| Themed outcome | Epic markdown (`kind: epic`) | Filename `Epic-N-…`; frontmatter `id: EPIC-N` |
| INVEST-sized deliverable | Story markdown (`kind: story`) | Filename `Story-N-M-…`; `id: STORY-N-M`; `parent: EPIC-N` |
| Optional split | Task markdown (`kind: task`) | Filename `Task-…`; `parent: STORY-N-M` |
| Blockers | Frontmatter `depends_on` | Ids of other work items (DAG) |
| Source links | Frontmatter `traces_to` | Repo paths / anchors |
| Ready / done | Frontmatter `status` | `draft`, `ready`, `in_progress`, `done`, … |

Prefixes and directories are configurable in `.project-planning.yaml` (`naming.*`, `defaults.*`). Defaults: `Epic-`, `Story-`, `Task-` and dirs `Epics/`, `Stories/`.

Normative field list: [frontmatter-schema.md](frontmatter-schema.md). Templates: `assets/EpicTemplate.md`, `StoryTemplate.md`, `TaskTemplate.md`.

## Scripts

| Script | Purpose |
|--------|---------|
| `EpicManager.ts` | Create / list / update epic files |
| `StoryManager.ts` | Create / list / update story files |
| `ShardFromSources.ts` | Write proposed epic/story markdown from specs |
| `LintPlan.ts` | Frontmatter, `depends_on` DAG, `traces_to` on `ready` |

Do **not** run these for backlog items when a tracker is SSOT.

## End-to-end workflow

1. Discover requirements — [artifact-discovery.md](artifact-discovery.md), **ScanSources.ts**.
2. Decompose — [agile-foundations.md](agile-foundations.md), [decomposition-patterns.md](decomposition-patterns.md).
3. Write files — managers or ShardFromSources; fill `traces_to`, `acceptance_criteria`, `depends_on`.
4. Review — `LintPlan.ts` + [plan-quality-review.md](plan-quality-review.md) (files checklist).

## Anti-patterns (files-specific)

- Using `EPIC-` / `STORY-` ids on Linear, Jira, or other trackers — those platforms use their own identifiers.
- Skipping `parent` on stories, or `traces_to` on `status: ready`.
- Treating `naming.*` prefixes as a cross-platform planning language.

## Escalation

| Need | Where |
|------|--------|
| Tracker backlog instead of markdown | [../SKILL.md](../SKILL.md) § Platform guides |
| PRD / spec | `specification` |
| Initiative / horizon | `product-roadmap` |
