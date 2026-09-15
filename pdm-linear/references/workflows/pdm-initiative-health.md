# Workflow: pdm-initiative-health

## Trigger

"Initiative health", "project status update", "PDM status pulse", "are we on track?", "post a Linear update".

## Goal

Assess and communicate health for initiatives/projects using status updates (and light comments). Read-only awareness of cycles/issues for context—**never** mutate issues, cycles, or releases.

## Preconditions

- Target initiative and/or project identified.
- Prefer evidence over vibes: milestones progress narrative, known blockers from stakeholders, optional issue/cycle reads.

## Steps

1. **Collect state**
   - `get_initiative` and/or `get_project`
   - `list_milestones` / `get_milestone` — which phases are framed vs empty
   - `get_status_updates` — prior pulses (avoid contradictory spam)
   - Optional context only: `list_cycles`; if issue list/get tools exist, use **read-only** for orphan/risk signals—never update
   - `list_documents` to ensure PRD still matches status narrative
2. **Judge health**
   - On track / at risk / off track (use Linear status-update health fields per schema).
   - Cite: milestone exit criteria unmet, missing PO handoff, dependency waits (UI-only deps called out), capacity from `list_cycles` if relevant.
3. **Draft update**
   - What changed since last update
   - Risks and asks
   - Next PM/PO actions (PM actions must stay within allowed tools)
4. **Publish**
   - Confirm wording with user when the update is external-facing.
   - `save_status_update` on initiative and/or project.
   - Optional `save_comment` for a durable decision note on the project/doc.
5. **Correct mistakes**
   - `delete_status_update` only with confirmation when a pulse was wrong/duplicate.
6. **Escalate if execution is the problem**
   - Missing issues under milestones → `pdm-hand-to-po` / `project-planning`
   - Release slippage mechanics → `release-versioning` / `ci-cd-governance`
   - Strategy invalid → `product-roadmap` repositioning, then `pdm-roadmap-sync`

## MCP tools used

| Step | Tools |
|------|--------|
| Discover | `get_initiative`, `get_project`, `list_milestones`, `get_milestone`, `get_status_updates`, `list_documents`, `list_cycles`; optional read-only issue tools |
| Write | `save_status_update`, optional `save_comment`, optional `delete_status_update` |
| Forbidden | `save_issue`, cycle mutation, `save_release`, release notes |

## Done criteria

- Status update recorded with clear health and asks.
- No issue/cycle/release mutations.
- Escalation named when the fix is outside PM framing.

## Anti-patterns

- Posting empty "still working" updates without evidence.
- Using status updates to assign individual engineering tasks (that is issue work).
- Deleting history without confirmation.
