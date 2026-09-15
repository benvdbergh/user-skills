# Workflow: pdm-roadmap-sync

## Trigger

"Sync roadmap to Linear", "create initiatives from roadmap", "align initiatives with product-roadmap", "mirror Now/Next/Later into Linear".

## Goal

Reflect approved `product-roadmap` outcomes into Linear **Initiatives** (and attach known projects). Does not shard issues or invent roadmap strategy from scratch.

## Preconditions

- Roadmap artifact or decisions available (from `product-roadmap` workflows / templates). If missing, escalate to `product-roadmap` first.
- Value narrative optional via `value-propositions` when initiative "why" is unclear.
- Linear MCP ready.

## Steps

1. **Load roadmap intent**
   - Read the user’s roadmap horizons, commitments vs forecasts, and outcome themes.
   - If the ask is "build me a roadmap," stop and route to `product-roadmap`; return here after.
2. **Discover Linear initiatives**
   - `list_initiatives`
   - `get_initiative` on candidates
   - `list_initiative_labels` for taxonomy reuse
3. **Map outcomes → initiatives**
   - One initiative per major strategic outcome/theme (or sub-initiative tree for large programs—see Linear sub-initiatives docs).
   - Prefer updating existing initiatives over duplicates when names/intent match.
4. **Write initiatives**
   - `save_initiative` with name, description (outcome, success metrics, links to roadmap doc), status, priority, targetDate as appropriate.
   - Confirm before flipping Active initiatives’ status/dates.
   - `save_initiative_label` when labels are part of the workspace system (avoid deprecated `create_initiative_label` unless necessary).
5. **Attach projects**
   - `list_projects` / `get_project`
   - `save_project` to associate projects under the initiative when the API supports initiative membership.
   - Do not create issue trees under those projects here.
6. **Optional pulse**
   - `save_status_update` on new/changed initiatives summarizing sync rationale.
7. **UI-only reminder**
   - Timeline ordering and project dependency edges: user sets in Linear UI.
8. **Stop**
   - No `save_issue`, no cycles, no releases.
   - Downstream: project shells / PRD publish / milestones via other `pdm-linear` workflows.

## MCP tools used

| Step | Tools |
|------|--------|
| Discover | `list_initiatives`, `get_initiative`, `list_initiative_labels`, `list_projects`, `get_project` |
| Write | `save_initiative`, `save_initiative_label`, `save_project`, optional `save_status_update` |
| Docs | `search_documentation` if initiative semantics unclear |
| Forbidden | `save_issue`, cycle mutation, release tools |

## Done criteria

- Each committed roadmap theme has a Linear initiative (or an explicit deferral).
- Projects that already exist are linked where possible.
- Forecasts/options are labeled as such in initiative descriptions—not silently marked committed.

## Composition

- Strategy quality → `product-roadmap`
- Why/value → `value-propositions`
- Execution after sync → other `pdm-linear` workflows, then `project-planning`
