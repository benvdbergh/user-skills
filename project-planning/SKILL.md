---
name: project-planning
description: >-
  Applies agile decomposition, traceability, and dependency-aware planning with one backlog
  SSOT per project: markdown files by default, or a delivery tracker (Linear, Jira, and others)
  when configured—never both. Discovers specs/ADRs, shards work using the configured platform's
  native types, and validates plans. Use when agile planning, epic/story breakdown, shard PRD
  or spec, Linear or Jira backlog, dependency ordering, Definition of Ready, story mapping,
  workflow init, LintPlan, ScanSources, or planning review.
license: MIT
metadata:
  author: PAI
  version: 2.5.0
---

<!-- Optimization: v2.5.0
  - Hub routes to a platform file; no cross-platform Epic/Story/prefix mapping
  - Each platform file owns that tracker's native work breakdown
  - Filename prefixes (Epic-, STORY-) documented only for the files platform
-->

# project-planning

## Mandatory agent behaviors

1. **Discover sources** before inventing scope — follow [references/artifact-discovery.md](references/artifact-discovery.md); use **ScanSources.ts** when helpful.
2. **INVEST + vertical slices** for user-facing work — [references/agile-foundations.md](references/agile-foundations.md).
3. **Dependencies** — express blockers in the project **SSOT** ([references/dependencies-and-sequencing.md](references/dependencies-and-sequencing.md)): markdown `depends_on` when `files`; native tracker relations when a delivery tracker is active.
4. **Traceability** — link PRD/spec/ADR in the SSOT ([references/traceability-and-sources.md](references/traceability-and-sources.md)): markdown `traces_to` when `files`; tracker fields/descriptions when a delivery tracker is active. Repo specs stay SSOT for requirements either way.
5. **Normative schema** — [references/frontmatter-schema.md](references/frontmatter-schema.md) for **file-based** work items only.
6. **Single source of truth** — resolve `delivery_tracker` below. Create and update backlog items **only** in the SSOT, using **that platform's native types**. **Never** keep parallel markdown backlog files and tracker items for the same work.

## Delivery tracker (SSOT)

| Layer | SSOT | Examples |
|-------|------|----------|
| **Requirements** | Repo docs | `PRD.md`, specs, ADRs — [artifact-discovery.md](references/artifact-discovery.md) |
| **Backlog** | `delivery_tracker` | Markdown **or** external tracker — **one**, not both |

### Resolve SSOT

1. **User prompt** — e.g. “plan in Linear”, “stories in Jira”.
2. **Manifest** — `delivery_tracker` in `.project-planning.yaml` ([frontmatter-schema.md](references/frontmatter-schema.md)).
3. **Project artifacts** — `brief.md`, README, team docs.
4. **Fallback** — omit or `delivery_tracker: files` → [files-adoption.md](references/files-adoption.md).

Session override: if the manifest is `files` but the user names a tracker, use that tracker as SSOT and note it.

### Platform guides

After resolving `delivery_tracker`, **load that platform's file** and follow its native work breakdown. Do not apply another platform's types, ids, or filename prefixes.

| `delivery_tracker` | Load | Usage |
|--------------------|------|-------|
| `files` (default) | [files-adoption.md](references/files-adoption.md) | Markdown work items under `Epics/` and `Stories/`; prefixes and scripts live here |
| `linear` | [linear-adoption.md](references/linear-adoption.md) | Linear **Project**, **Milestone**, **Issue** via official Linear MCP |
| `jira` | [jira-adoption.md](references/jira-adoption.md) | Jira **Epic**, **Feature**, **Story** via Atlassian MCP |
| `github-issues` | [github-issues-adoption.md](references/github-issues-adoption.md) | GitHub **Issues** (optional Projects / Milestones) |
| `monday` | [monday-adoption.md](references/monday-adoption.md) | monday.com **Board**, **Group**, **Item** |

Optional [tracker-index.md](references/tracker-index.md) for URL pointers only. Migrate `files` → tracker: one-time import, archive markdown after confirmation. Manifest: [default.project-planning.yaml](assets/default.project-planning.yaml).

## MCP dependencies

Tracker platforms only. Servers, tools, and safety are documented on each `<tracker>-adoption.md`. Discover schemas at runtime.

## Tool safety policy

- **Safe:** Load the platform file; list/get; create native items per that file.
- **Requires confirmation:** Archive/delete tracker items; workspace-wide status broadcasts.
- **Never allowed:** Parallel markdown + tracker backlog; applying files-platform prefixes (`EPIC-`, `STORY-`) on a tracker.

## Workflow routing

| Workflow | Trigger | Reference |
|----------|---------|-----------|
| **WorkflowInit** | workflow init, start planning | [references/WorkflowInit.md](references/WorkflowInit.md) |
| **ShardFromSources** | shard PRD, break down spec, epics from requirements | [references/ShardFromSources.md](references/ShardFromSources.md) |
| **CreateEpic** | create epic, new epic | [references/CreateEpic.md](references/CreateEpic.md) |
| **CreateStory** | create story, new story | [references/CreateStory.md](references/CreateStory.md) |
| **PlanReview** | review plan, validate planning | [references/PlanReview.md](references/PlanReview.md) |
| **PlanInTracker** | plan in Linear/Jira, tracker backlog | Load `<tracker>-adoption.md` from the table above |

**Deep references (load when needed):** [agile-foundations.md](references/agile-foundations.md), [decomposition-patterns.md](references/decomposition-patterns.md), [plan-quality-review.md](references/plan-quality-review.md).

## CLI summary

Scripts apply when `delivery_tracker: files` — see [files-adoption.md](references/files-adoption.md). Tracker SSOT: do not run EpicManager, StoryManager, ShardFromSources, or LintPlan for backlog items.

| Script | Role |
|--------|------|
| `WorkflowInit.ts` | `--project` \| `--root` \| `--config`, `--brief`, `--action review` |
| `ShardFromSources.ts` | Same context flags; `--prd` optional (default `<root>/PRD.md`). `ShardPRD.ts` = alias |
| `ScanSources.ts` | Print markdown from `source_globs` |
| `LintPlan.ts` | Frontmatter, `depends_on` DAG, `traces_to` — **`files` only** |
| `EpicManager.ts` | Create/list/update epic markdown — **`files` only** |
| `StoryManager.ts` | Create/list/update story markdown — **`files` only** |

Paths resolve via **`.project-planning.yaml`** at project root, or `--config` path, or legacy `--project` → `$KNOWLEDGE_DIR/Projects/<name>/`, or **cwd** with defaults.

## Templates and manifest

- Templates (`delivery_tracker: files`): `assets/EpicTemplate.md`, `StoryTemplate.md`, `TaskTemplate.md`, `default.project-planning.yaml`
- Starter manifest: copy `assets/default.project-planning.yaml` → `.project-planning.yaml`

## Integration

- **specification** — consumes PRD/plan artifacts; link paths in manifest and `traces_to` (handoff contract).
- **product-roadmap** — initiatives and release intent; link from the SSOT per the platform guide.
- **research-analysis** — research notes may appear in source links.
- **Delivery trackers** — backlog SSOT when configured; load the matching platform file.
- **StateManagement** / **VersionControl** — optional; see [references/dependencies.md](references/dependencies.md).
- **Boundaries** — [references/skill-escalation.md](references/skill-escalation.md).

**Action bias:** Create/update backlog items in the project SSOT (markdown **or** tracker); run scripts only when `delivery_tracker: files`. Do not only suggest.

## Examples

**Initialize (manifest root)**  
User: "Start planning in this repo" → `WorkflowInit.ts --root . --brief "..."` → dirs + `brief.md` + default manifest if missing.

**Shard (files)**  
`delivery_tracker: files` → artifact discovery → `ShardFromSources.ts --root .` → `LintPlan.ts` — [files-adoption.md](references/files-adoption.md)

**Shard (Linear)**  
`delivery_tracker: linear` → artifact discovery → create Project / Milestones / Issues via MCP per [linear-adoption.md](references/linear-adoption.md)

**Validate**  
`files` → `LintPlan.ts` + [plan-quality-review.md](references/plan-quality-review.md). Tracker → review in the tracker per that platform file.

More samples: [references/quick-start.md](references/quick-start.md), [references/examples.md](references/examples.md).
