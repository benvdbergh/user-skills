---
name: project-planning
description: >-
  Applies agile decomposition, traceability, and dependency-aware planning using markdown work items
  and an optional .project-planning.yaml manifest; discovers specs/ADRs, shards sources into epics and stories,
  and validates plans with scripts. Use when agile planning, epic/story breakdown, shard PRD or spec,
  dependency ordering, Definition of Ready, story mapping, workflow init, LintPlan, ScanSources,
  manifest-driven planning paths, or planning review.
license: MIT
metadata:
  author: PAI
  version: 2.0.1
---

# project-planning

## Mandatory agent behaviors

1. **Discover sources** before inventing scope — follow [references/artifact-discovery.md](references/artifact-discovery.md); use **ScanSources.ts** when helpful.
2. **INVEST + vertical slices** for user-facing stories — [references/agile-foundations.md](references/agile-foundations.md).
3. **Dependencies** — use frontmatter `depends_on` ([references/dependencies-and-sequencing.md](references/dependencies-and-sequencing.md)).
4. **Traceability** — link PRD/spec/ADR in `traces_to` ([references/traceability-and-sources.md](references/traceability-and-sources.md)).
5. **Normative schema** — [references/frontmatter-schema.md](references/frontmatter-schema.md).

## Workflow routing

| Workflow | Trigger | Reference |
|----------|---------|-----------|
| **WorkflowInit** | workflow init, start planning | [references/WorkflowInit.md](references/WorkflowInit.md) |
| **ShardFromSources** | shard PRD, break down spec, epics from requirements | [references/ShardFromSources.md](references/ShardFromSources.md) |
| **CreateEpic** | create epic, new epic | [references/CreateEpic.md](references/CreateEpic.md) |
| **CreateStory** | create story, new story | [references/CreateStory.md](references/CreateStory.md) |
| **PlanReview** | review plan, validate planning | [references/PlanReview.md](references/PlanReview.md) |

**Deep references (load when needed):** [agile-foundations.md](references/agile-foundations.md), [decomposition-patterns.md](references/decomposition-patterns.md), [plan-quality-review.md](references/plan-quality-review.md).

## CLI summary

| Script | Role |
|--------|------|
| `WorkflowInit.ts` | `--project` \| `--root` \| `--config`, `--brief`, `--action review` |
| `ShardFromSources.ts` | Same context flags; `--prd` optional (default `<root>/PRD.md`). `ShardPRD.ts` = alias |
| `ScanSources.ts` | Print markdown from `source_globs` |
| `LintPlan.ts` | Frontmatter, `depends_on` DAG, `traces_to` for `ready` |
| `EpicManager.ts` | `--action create\|list\|update` |
| `StoryManager.ts` | `--action create\|list\|update` |

Paths resolve via **`.project-planning.yaml`** at project root, or `--config` path, or legacy `--project` → `$KNOWLEDGE_DIR/Projects/<name>/`, or **cwd** with defaults.

## Templates and manifest

- Templates: `assets/EpicTemplate.md`, `StoryTemplate.md`, `TaskTemplate.md`, `default.project-planning.yaml`
- Starter manifest: copy `assets/default.project-planning.yaml` → `.project-planning.yaml`

## Integration

- **specification** — consumes PRD/plan artifacts; link paths in manifest and `traces_to` (handoff contract).
- **research-analysis** — research notes may appear in `traces_to`.
- **StateManagement** / **VersionControl** — optional; see [references/dependencies.md](references/dependencies.md).

**Action bias:** Create/update planning files and run scripts; do not only suggest.

## Examples

**Initialize (manifest root)**  
User: "Start planning in this repo" → `WorkflowInit.ts --root . --brief "..."` → dirs + `brief.md` + default manifest if missing.

**Shard**  
User: "Break the PRD into epics" → artifact discovery → `ShardFromSources.ts --root .`

**Validate**  
Before sign-off → `LintPlan.ts --root .` and [plan-quality-review.md](references/plan-quality-review.md)

More samples: [references/quick-start.md](references/quick-start.md), [references/examples.md](references/examples.md).
