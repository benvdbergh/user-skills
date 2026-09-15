# Workflow: pdm-prd-to-project

## Trigger

"Publish this PRD to Linear", "attach PRD to Agent Hub", "PRD to project", "create Linear project from PRD".

## Goal

Ensure a Linear **Project** exists (or is correctly framed), publish the PRD as a Linear **Document**, and link framing so PO can later shard issues. Does **not** create issues or milestones beyond what the user also requested (for milestones, prefer chaining `pdm-milestone-plan-after-prd`).

## Preconditions

- PRD content available (repo path such as `PRD.md`, or paste). Prefer quality via `specification` if the draft is thin.
- Linear MCP authenticated; tool schemas discovered at runtime.
- Know target project name/slug (e.g. Agent Hub / Voice-Native Agent Hub).
- **Name hint:** The live Linear project name for Agent Hub is **Voice-Native Agent Hub**—discover first to avoid duplicates.

## Steps

1. **Discover project**
   - `list_projects` (filter/search by name if supported).
   - `get_project` on the match.
   - If missing, either run [pdm-initiative-bootstrap.md](pdm-initiative-bootstrap.md) first or `save_project` with name, summary/overview from PRD vision, and optional initiative link.
2. **Confirm initiative link (optional but preferred)**
   - `list_initiatives` / `get_initiative`.
   - If a matching initiative exists, `save_project` to attach/update initiative membership when the schema allows.
   - If initiatives are empty and roadmap work is pending, note follow-up `pdm-roadmap-sync`—do not block PRD publish.
3. **Publish PRD document**
   - `list_documents` for the project to avoid duplicates.
   - `get_document` if updating an existing PRD doc.
   - `save_document` with title (e.g. `PRD — Voice-Native Agent Hub`), body derived from the approved PRD (summarize huge dumps; keep structure: problem, vision, goals, scope, non-goals, success metrics). Include a **Sources** section with the repo path.
   - Confirm with the user before overwriting a published document.
4. **Refresh project framing**
   - `save_project` to set/update overview: one-paragraph outcome, link/pointer to the PRD document, lead if known, status (`Planned` / `Backlog`-equivalent per schema).
5. **Optional label hygiene**
   - `list_project_labels` / `save_project_label` for stable tags (e.g. `prd-ready`) if the workspace uses them.
6. **Stop conditions**
   - Do **not** call `save_issue`.
   - Do **not** pack cycles or touch releases.
   - Offer next workflows: `pdm-milestone-plan-after-prd`, then `pdm-hand-to-po`.

## MCP tools used

| Step | Tools |
|------|--------|
| Discover | `list_projects`, `get_project`, `list_initiatives`, `get_initiative`, `list_documents`, `get_document` |
| Write | `save_project`, `save_document`, optional `save_project_label` |
| Forbidden | `save_issue`, release tools, cycle mutation |

## Done criteria

- Project URL known and framing reflects PRD intent.
- Linear document exists for the PRD with source link to repo.
- Explicit note: issues/cycles remain for PO (`project-planning`).

## Example path (Agent Hub)

Empty Agent Hub shell + landed Voice-Native Agent Hub PRD → update project overview → `save_document` PRD → proceed to milestone plan.
