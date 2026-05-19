---
name: project-planning
description: >-
  Applies agile decomposition, traceability, and dependency-aware planning with a single source of truth per project:
  markdown epics/stories by default, or a delivery tracker (e.g. Linear, Jira) when configured—never both.
  Discovers specs/ADRs, shards into epics and stories, and validates plans. Use when agile planning, epic/story
  breakdown, shard PRD or spec, dependency ordering, Definition of Ready, story mapping, workflow init, LintPlan,
  ScanSources, manifest-driven planning paths, or planning review.
license: MIT
metadata:
  author: PAI
  version: 2.4.0
---

# project-planning

## Mandatory agent behaviors

1. **Discover sources** before inventing scope — follow [references/artifact-discovery.md](references/artifact-discovery.md); use **ScanSources.ts** when helpful.
2. **INVEST + vertical slices** for user-facing stories — [references/agile-foundations.md](references/agile-foundations.md).
3. **Dependencies** — express blockers in the project **SSOT** ([references/dependencies-and-sequencing.md](references/dependencies-and-sequencing.md)): markdown `depends_on` when `files`; tracker relations when a delivery tracker is active.
4. **Traceability** — link PRD/spec/ADR in the SSOT ([references/traceability-and-sources.md](references/traceability-and-sources.md)): markdown `traces_to` when `files`; tracker fields/descriptions when a delivery tracker is active. Repo specs stay SSOT for requirements either way.
5. **Normative schema** — [references/frontmatter-schema.md](references/frontmatter-schema.md) for **file-based** work items only.
6. **Single source of truth** — resolve `delivery_tracker` below. Create and update epics/stories **only** in the SSOT. **Never** keep parallel markdown backlog files and tracker items for the same work.

## Delivery tracker (SSOT)

| Layer | SSOT | Examples |
|-------|------|----------|
| **Requirements** | Repo docs | `PRD.md`, specs, ADRs — [artifact-discovery.md](references/artifact-discovery.md) |
| **Backlog** (epics & stories) | `delivery_tracker` | Markdown **or** external tracker — **one**, not both |

### Resolve SSOT

1. **User prompt** — e.g. “plan in Linear”, “stories in Jira”.
2. **Manifest** — `delivery_tracker` in `.project-planning.yaml` ([frontmatter-schema.md](references/frontmatter-schema.md)).
3. **Project artifacts** — `brief.md`, README, team docs.
4. **Fallback** — omit or `delivery_tracker: files` → markdown under `Epics/`, `Stories/`.

Session override: if manifest is `files` but the user names a tracker, use that tracker as SSOT and note it.

### Supported trackers

| `delivery_tracker` | Backlog SSOT | Epic | Story | Guide |
|--------------------|--------------|------|-------|-------|
| `files` (default) | Markdown | `Epic-*.md` | `Story-*.md` | Scripts + `LintPlan.ts` |
| `linear` | Linear | **Milestone** | **Issue** | [linear-adoption.md](references/linear-adoption.md) |
| `jira`, `github-issues`, `monday` | *Planned* | TBD | TBD | — |

### When tracker is SSOT

- Create backlog **only** in the tracker ([linear-adoption.md](references/linear-adoption.md) when `linear`); no parallel `Epic-*.md` / `Story-*.md`.
- Plan review: [plan-quality-review.md](references/plan-quality-review.md) (tracker checklist), not `LintPlan.ts` on markdown.

### When `files` is SSOT

- Markdown + `EpicManager` / `StoryManager` / `LintPlan.ts`; review via [plan-quality-review.md](references/plan-quality-review.md) (files checklist).

Optional [tracker-index.md](references/tracker-index.md) for URL pointers only. Migrate `files` → tracker: one-time import, archive markdown after confirmation. Manifest: [default.project-planning.yaml](assets/default.project-planning.yaml).

## Workflow routing

| Workflow | Trigger | Reference |
|----------|---------|-----------|
| **WorkflowInit** | workflow init, start planning | [references/WorkflowInit.md](references/WorkflowInit.md) |
| **ShardFromSources** | shard PRD, break down spec, epics from requirements | [references/ShardFromSources.md](references/ShardFromSources.md) |
| **CreateEpic** | create epic, new epic | [references/CreateEpic.md](references/CreateEpic.md) |
| **CreateStory** | create story, new story | [references/CreateStory.md](references/CreateStory.md) |
| **PlanReview** | review plan, validate planning | [references/PlanReview.md](references/PlanReview.md) |
| **PlanInTracker** | plan in Linear/Jira, tracker backlog | [linear-adoption.md](references/linear-adoption.md) (or future platform guides) |

**Deep references (load when needed):** [agile-foundations.md](references/agile-foundations.md), [decomposition-patterns.md](references/decomposition-patterns.md), [plan-quality-review.md](references/plan-quality-review.md).

## CLI summary

| Script | Role |
|--------|------|
| `WorkflowInit.ts` | `--project` \| `--root` \| `--config`, `--brief`, `--action review` |
| `ShardFromSources.ts` | Same context flags; `--prd` optional (default `<root>/PRD.md`). `ShardPRD.ts` = alias |
| `ScanSources.ts` | Print markdown from `source_globs` |
| `LintPlan.ts` | Frontmatter, `depends_on` DAG, `traces_to` — **`delivery_tracker: files` only** |
| `EpicManager.ts` | Create/list/update epic markdown — **`files` only** |
| `StoryManager.ts` | Create/list/update story markdown — **`files` only** |

Paths resolve via **`.project-planning.yaml`** at project root, or `--config` path, or legacy `--project` → `$KNOWLEDGE_DIR/Projects/<name>/`, or **cwd** with defaults.

## Templates and manifest

- Templates (`delivery_tracker: files`): `assets/EpicTemplate.md`, `StoryTemplate.md`, `TaskTemplate.md`, `default.project-planning.yaml`
- Starter manifest: copy `assets/default.project-planning.yaml` → `.project-planning.yaml`

## Integration

- **specification** — consumes PRD/plan artifacts; link paths in manifest and `traces_to` (handoff contract).
- **product-roadmap** — initiatives and release intent; link in epic `traces_to` when relevant.
- **research-analysis** — research notes may appear in `traces_to`.
- **Delivery trackers** — backlog SSOT when configured; see § Delivery tracker (SSOT).
- **StateManagement** / **VersionControl** — optional; see [references/dependencies.md](references/dependencies.md).
- **Boundaries** — [references/skill-escalation.md](references/skill-escalation.md).

**Action bias:** Create/update backlog items in the project SSOT (markdown **or** tracker); run scripts only when `delivery_tracker: files`. Do not only suggest.

## Examples

**Initialize (manifest root)**  
User: "Start planning in this repo" → `WorkflowInit.ts --root . --brief "..."` → dirs + `brief.md` + default manifest if missing.

**Shard (files)**  
`delivery_tracker: files` → artifact discovery → `ShardFromSources.ts --root .` → `LintPlan.ts`

**Shard (Linear)**  
`delivery_tracker: linear` → artifact discovery → create milestones and issues via MCP per [linear-adoption.md](references/linear-adoption.md) — no epic/story markdown

**Validate**  
`files` → `LintPlan.ts` + [plan-quality-review.md](references/plan-quality-review.md). Tracker → review in tracker per platform guide.

More samples: [references/quick-start.md](references/quick-start.md), [references/examples.md](references/examples.md).
