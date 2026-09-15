# Workflow: pdm-initiative-bootstrap / pdm-project-shell

Also known as **pdm-project-shell** when only the project container is needed.

## Trigger

"Bootstrap initiative", "create empty project shell", "set up Agent Hub in Linear", "new initiative + project", "scaffold Linear for this product".

## Goal

Create or refresh the **Initiative** and/or **Project shell** so later PRD publish and milestone planning have a home. Leaves milestones minimal (or empty) until PRD-driven planning. Never creates issues.

## When to use which mode

| Mode | Use when |
|------|----------|
| Initiative + project | New strategic theme with no Linear home (common while Initiatives view is empty) |
| Project shell only | Initiative exists (or is deferred) and you need an empty project like Agent Hub |
| Initiative only | Portfolio theme with projects to attach later |

## Preconditions

- Name, one-line outcome, and owner/lead if known.
- Optional inputs from `value-propositions` / `product-roadmap` for description quality.
- Workspace context: Initiatives may be empty; ~7 projects may already exist; Agent Hub may already be an empty shell—**discover before create**.
- **Name hint:** The live Linear project name for Agent Hub is **Voice-Native Agent Hub**—search for it first to avoid duplicates.

## Steps

1. **Discover**
   - `list_initiatives`, `list_projects`
   - `get_initiative` / `get_project` on fuzzy matches to avoid duplicates (e.g. existing Agent Hub shell).
   - `list_initiative_labels` / `list_project_labels` for reuse.
2. **Optional value/roadmap check**
   - If "why" is fuzzy, escalate briefly to `value-propositions`.
   - If horizon placement is fuzzy, cite `product-roadmap` or schedule `pdm-roadmap-sync` after shell exists.
3. **Create or update initiative** (if in scope)
   - `save_initiative`: name, description (outcome, success signal, non-goals), status (`Proposed`/`Planned`), priority, targetDate if known.
   - Labels via `save_initiative_label` as needed.
4. **Create or update project shell**
   - `save_project`: name (e.g. Agent Hub), summary/overview stub, lead, status, initiative association when available.
   - Do not paste the entire PRD yet—overview stub + "PRD pending" is enough; use `pdm-prd-to-project` when PRD lands.
   - Optional `save_project_label`.
5. **Shell milestones policy**
   - Default: **no milestones** until PRD (`pdm-milestone-plan-after-prd`).
   - Exception: user explicitly wants a single "Framing" milestone with exit criteria "PRD published and reviewed"—then one `save_milestone` only.
6. **Record bootstrap pulse**
   - Optional `save_status_update`: shell created; waiting on PRD / roadmap sync.
7. **Stop**
   - No `save_issue`, no cycles, no releases.
   - Next natural chain for Voice-Native Agent Hub: `pdm-prd-to-project` → `pdm-milestone-plan-after-prd` → `pdm-hand-to-po`.

## MCP tools used

| Step | Tools |
|------|--------|
| Discover | `list_initiatives`, `get_initiative`, `list_projects`, `get_project`, label list tools |
| Write | `save_initiative`, `save_initiative_label`, `save_project`, `save_project_label`, optional single `save_milestone`, optional `save_status_update` |
| Forbidden | `save_issue`, cycle mutation, release tools |

## Done criteria

- Initiative and/or project URLs returned.
- No duplicate shells created when one already exists.
- Clear pointer to the next workflow (usually PRD publish).

## Agent Hub note

If Agent Hub already exists as an empty shell, **update** via `save_project` rather than creating a second project. Prefer initiative bootstrap only when a strategic parent is missing and desired.
