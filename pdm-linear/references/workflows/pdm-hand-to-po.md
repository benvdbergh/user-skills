# Workflow: pdm-hand-to-po

## Trigger

"Hand to PO", "ready for backlog", "escalate to project-planning", "PM framing done".

## Goal

Produce a crisp handoff so Product Owner + Eng can run `project-planning` (Linear adoption: milestones → issues → cycles) without PM creating issues.

## Preconditions

- Project framing present (`get_project`).
- PRD document published or linked (`list_documents` / `get_document`).
- Outcome milestones exist (`list_milestones`) with exit criteria.
- User wants PO to take execution ownership.

## Steps

1. **Verify ready checklist**
   - Initiative linked or explicitly deferred.
   - Project overview understandable in one screen.
   - PRD document current.
   - Milestones cover the PRD outcomes with exit criteria.
   - Open questions listed (do not silently invent answers).
2. **Compose handoff package** (in the comment body)
   - Project URL + PRD document URL
   - Milestone list (names + one-line outcomes)
   - Explicit ask: shard INVEST issues under milestones; set relations; pack cycles when ready
   - Out of scope for PO until Eng/release owners engage: SemVer, release pipelines
   - Pointers: load `project-planning` → `references/linear-adoption.md`
3. **Post handoff on Linear (not as issues)**
   - `list_comments` on the project (and PRD document if useful) to avoid duplicate handoffs.
   - `save_comment` on the **project** (preferred) and/or **document** with the handoff package. Tag/mention PO if the schema/UI supports it—do not create placeholder issues for mentions.
   - Optional: `save_status_update` on project/initiative: health = on track / at risk as appropriate; body states "Framing complete — handed to PO for issues/cycles."
4. **Escalate in the agent session**
   - Tell the user (via the parent agent) to continue with `project-planning`.
   - Refuse any follow-up that requires `save_issue` or cycle packing inside `pdm-linear`.
5. **Never**
   - `save_issue`
   - Cycle create/update
   - `save_release` / release notes

## MCP tools used

| Step | Tools |
|------|--------|
| Verify | `get_project`, `list_documents`, `get_document`, `list_milestones`, `get_milestone`, optional `list_initiatives` / `get_initiative` |
| Handoff | `list_comments`, `save_comment`, optional `save_status_update` |
| Context only | `list_cycles` (read) if commenting on near-term capacity |
| Forbidden | `save_issue`, cycle mutation, release tools |

## Done criteria

- Handoff comment visible on the project (and optionally PRD doc).
- Optional status update recorded.
- Session explicitly routes remaining work to `project-planning`.

## Comment template

```markdown
## PM → PO handoff

**Project:** <url>
**PRD document:** <url>
**Initiative:** <url or "deferred">

### Milestones (outcomes)
1. <name> — <one-line outcome> — exit: <short>
2. …

### PO asks
- Create INVEST issues under each milestone (`project-planning` / Linear MCP `save_issue`).
- Wire blockers; pack cycles when the team is ready.
- Do not alter milestone exit criteria without PM sync.

### Open questions
- …

### Explicitly not done by PM
- No issues created
- No cycle packing
- No release pipeline work (`release-versioning` / `ci-cd-governance`)
```
