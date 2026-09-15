# Workflow: pdm-milestone-plan-after-prd

## Trigger

"Plan milestones after PRD", "outcome phases for Agent Hub", "Life-Hub style milestones", "milestone plan for this project".

## Goal

Define **outcome milestones with exit criteria** on a project that already has (or is getting) a PRD. Planning model — **milestones only**. No issues.

## Preconditions

- Target project identified (`list_projects` / `get_project`).
- PRD available as repo file and/or Linear document (`list_documents` / `get_document`).
- Prefer Life-Hub milestone *shape*: outcome name + exit criteria (+ optional `targetDate`).
- **Name hint:** The live Linear project name for Agent Hub is **Voice-Native Agent Hub**—use for discovery and comparisons.

## Steps

1. **Read framing**
   - `get_project`, `list_documents` / `get_document` for PRD.
   - Extract measurable outcomes, phased goals, and non-goals from the PRD (do not invent scope).
2. **Inventory existing milestones**
   - `list_milestones` for the project.
   - `get_milestone` on each if updating.
3. **Draft outcome phases**
   - Propose 3–7 milestones max unless the PRD clearly needs more.
   - Each milestone: **Name** (outcome-oriented), **Description** including:
     - Outcome statement
     - **Exit criteria** (checklist of truths, not tasks)
     - Optional risks / dependencies (narrative only; Timeline deps are UI-only)
     - **Sources** (PRD sections / repo paths)
   - Optional `targetDate` when the user or roadmap provides timing.
4. **Align with Life-Hub style**
   - Compare structure to Life-Hub milestones if accessible (`list_projects` → Life-Hub → `list_milestones`) for tone and exit-criteria depth—do not copy unrelated domain phases.
5. **Write milestones**
   - Confirm the plan with the user if replacing in-flight milestones.
   - `save_milestone` for each create/update (`project`, `name`, `description`, optional `targetDate`).
6. **Optional health note**
   - If useful, `save_status_update` on the project: "Milestone plan landed; awaiting PO issue fill."
7. **Stop**
   - Never `save_issue` to "seed" milestones.
   - Never assign work to cycles.
   - Next: `pdm-hand-to-po`.

## MCP tools used

| Step | Tools |
|------|--------|
| Discover | `get_project`, `list_documents`, `get_document`, `list_milestones`, `get_milestone`, optional Life-Hub `list_projects` / `list_milestones` |
| Write | `save_milestone`, optional `save_status_update` |
| Forbidden | `save_issue`, cycle mutation, release tools |

## Done criteria

- Every in-scope PRD outcome maps to a milestone or an explicit "out of milestone scope" note.
- Each milestone has exit criteria in the description.
- No issues created by this workflow.

## Anti-patterns

- Milestones named like sprints (`Sprint 1`) without outcomes.
- Exit criteria that are secretly a task list ("create login API").
- One mega-milestone for the entire product.
