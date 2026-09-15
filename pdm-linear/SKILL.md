---
name: pdm-linear
description: >-
  Operates Linear as Product Manager (PDM) on initiatives, projects, milestones,
  documents, labels, status updates, and handoff comments—never issues, cycles
  CRUD, or releases. Use when bootstrapping an initiative or project shell,
  turning a PRD into a Linear project and PRD document, planning outcome
  milestones after a PRD, syncing roadmap initiatives, posting initiative/project
  health updates, or handing framed work to the Product Owner for issue/cycle
  packing via project-planning.
license: MIT
metadata:
  author: PAI
  version: 1.0.0
  role: product-manager
  tracker: linear
---

# pdm-linear

Hub skill for **Product Manager** work in Linear via official Linear MCP (`user-Linear` / `plugin-linear-linear`). One skill, multiple workflows. Framing stops at **milestones and documents**; issue creation, cycle packing, and release pipelines belong to PO + Eng.

## Purpose

Standardize how the PM shapes strategic work in Linear so:

1. Initiatives express *why* and horizon intent.
2. Projects hold framing, overview, and PRD documents.
3. Milestones encode **outcome phases with exit criteria** (Life-Hub style)—not issue lists.
4. Status updates and comments keep stakeholders aligned.
5. Handoff to PO (`project-planning`) is explicit, complete, and never silently creates issues.

## When to Use

Use this skill when a user asks to:

- bootstrap a Linear initiative and/or empty project shell (e.g. Agent Hub)
- attach or publish a PRD as a Linear document on a project
- plan or refresh project milestones after a PRD lands
- sync Linear initiatives with product-roadmap outcomes
- write initiative/project health / status updates
- hand framed work to the Product Owner for backlog sharding
- operate PM-layer Linear objects without touching issues or releases

Do **not** use this skill to create, edit, or schedule issues; pack cycles; or mutate releases. Escalate those (see Guardrails and `references/skill-escalation.md`).

## Operating model (hard sequence)

```text
Initiative (PM)
  → Project framing (PM)
    → PRD Document (PM)
      → Milestone outcomes + exit criteria (PM)
        → Hand to PO (comment / status update)
          → Issues / Cycles (PO + Eng ONLY via project-planning)
```

| Layer | Owner | Linear objects | This skill |
|-------|-------|----------------|------------|
| Strategy / horizon | PM (+ `product-roadmap`) | Initiative, initiative labels | Owns |
| Delivery container + framing | PM | Project, project labels, overview | Owns |
| Requirements narrative | PM (+ `specification`) | Document (PRD) | Owns publish/link |
| Outcome phases | PM | Milestone | Owns |
| Stakeholder pulse | PM | Status update, comment on project/doc | Owns |
| INVEST backlog / sprint | PO + Eng | Issue, Cycle | **Forbidden** — escalate |
| Ship mechanics | Eng / release owners | Release, release notes | **Forbidden** — escalate |

**Planning model — milestones only:** Prefer outcome milestones with exit criteria over issue-first planning. Timeline edges and project dependencies are **UI-only** (no MCP)—call that out; do not invent MCP calls for them.

## Operating Procedure / workflow routing

1. Confirm the ask is PM-layer (initiative / project / PRD doc / milestones / health / handoff).
2. Route to the matching workflow file; load MCP tool schemas at runtime.
3. Discover current Linear state before writes (`list_*` / `get_*`).
4. Apply Safe / Confirm / Never rules from Tool Safety Policy.
5. Stop at milestones + handoff artifacts; never call `save_issue` or release/cycle mutation tools.

| Workflow | Trigger phrases | File |
|----------|-----------------|------|
| **pdm-prd-to-project** | PRD to Linear project, publish PRD document, attach PRD to Agent Hub | [references/workflows/pdm-prd-to-project.md](references/workflows/pdm-prd-to-project.md) |
| **pdm-milestone-plan-after-prd** | milestone plan after PRD, outcome phases, Life-Hub style milestones | [references/workflows/pdm-milestone-plan-after-prd.md](references/workflows/pdm-milestone-plan-after-prd.md) |
| **pdm-hand-to-po** | hand to PO, ready for backlog, escalate to project-planning | [references/workflows/pdm-hand-to-po.md](references/workflows/pdm-hand-to-po.md) |
| **pdm-roadmap-sync** | sync roadmap to Linear initiatives, initiative from roadmap | [references/workflows/pdm-roadmap-sync.md](references/workflows/pdm-roadmap-sync.md) |
| **pdm-initiative-health** | initiative health, project status update, PDM status pulse | [references/workflows/pdm-initiative-health.md](references/workflows/pdm-initiative-health.md) |
| **pdm-initiative-bootstrap** / **pdm-project-shell** | new initiative, empty project shell, bootstrap Agent Hub | [references/workflows/pdm-initiative-bootstrap.md](references/workflows/pdm-initiative-bootstrap.md) |

**First natural run (workspace context):** Voice-Native Agent Hub once the PRD is ready — typically `pdm-prd-to-project` → `pdm-milestone-plan-after-prd` → `pdm-hand-to-po`. Initiatives may be empty; Agent Hub may be an empty shell; Cycles & Releases unused—leave them unused from this skill.

## MCP Dependencies

- **Server:** Linear MCP as configured for the user (`user-Linear` / `plugin-linear-linear`; `https://mcp.linear.app/mcp`).
- **Auth:** OAuth / workspace auth per Linear MCP docs. If tools are missing, complete auth—do not invent REST alternatives.
- **Discover schemas at runtime** — do not assume parameter names from memory.
- **Docs helper:** `search_documentation` for Linear product behavior questions.

### Allowed tools (PM)

| Area | Tools |
|------|--------|
| Initiatives | `list_initiatives`, `get_initiative`, `save_initiative`, `list_initiative_labels`, `save_initiative_label`, retire/restore initiative labels as exposed |
| Projects | `list_projects`, `get_project`, `save_project`, `list_project_labels`, `save_project_label` |
| Milestones | `list_milestones`, `get_milestone`, `save_milestone` |
| Documents | `list_documents`, `get_document`, `save_document` |
| Status updates | `get_status_updates`, `save_status_update`, `delete_status_update` |
| Comments | `list_comments`, `save_comment` — **project / document / initiative context only**; never as a substitute for creating issues |
| Cycles (read) | `list_cycles` **only** |
| Docs search | `search_documentation` |

### Forbidden tools (PM — this skill)

| Forbidden | Why |
|-----------|-----|
| `save_issue` | Issue CRUD is PO + Eng (`project-planning`) |
| Creating/editing issues via any issue write API | Same |
| `save_release`, `save_release_note`, release pipeline mutation | Eng / `ci-cd-governance` + `release-versioning` |
| Cycle create/update/delete | Not available / not PM; only `list_cycles` for read context |
| Parallel markdown backlog for the same Linear work | Violates tracker SSOT |

**Read of issues** (`get_issue` / `list_issues`) may be used sparingly for **health context** only. Never create or update issues from this skill.

## Tool Usage Mapping

| Intent | MCP tool(s) | Safety |
|--------|-------------|--------|
| Find / inspect initiatives | `list_initiatives`, `get_initiative` | Safe |
| Create / update initiative | `save_initiative` | Confirm if status/priority/targetDate change on Active work |
| Initiative labels | `list_initiative_labels`, `save_initiative_label` | Safe; retire/restore → Confirm |
| Find / inspect projects | `list_projects`, `get_project` | Safe |
| Create / update project shell or framing | `save_project` | Confirm on status/lead/date changes for Active projects |
| Project labels | `list_project_labels`, `save_project_label` | Safe |
| List / get milestones | `list_milestones`, `get_milestone` | Safe |
| Create / update outcome milestones | `save_milestone` | Confirm when rewriting exit criteria on in-flight milestones |
| Publish / update PRD document | `list_documents`, `get_document`, `save_document` | Confirm on overwrite of published PRD |
| Health pulse | `get_status_updates`, `save_status_update` | Confirm |
| Remove mistaken status update | `delete_status_update` | Confirm (destructive) |
| Handoff note on project/doc | `list_comments`, `save_comment` | Confirm for handoff comments |
| Read cycles (capacity context only) | `list_cycles` | Safe (read-only) |
| Linear product questions | `search_documentation` | Safe |
| Create/update issues | — | **Never** |
| Pack cycles / mutate releases | — | **Never** |

## Tool Safety Policy

- **Safe:** All list/get reads; `search_documentation`; creating draft/proposed shells when the user explicitly asked to bootstrap.
- **Requires confirmation:** Status updates; deleting status updates; overwriting published documents; changing Active initiative/project status, lead, or target dates; rewriting milestones that already have PO-owned issues attached (if discoverable via read); posting handoff comments that notify stakeholders.
- **Never allowed:**
  - `save_issue` or any issue create/update
  - Cycle packing or cycle mutation
  - `save_release`, `save_release_note`, or release pipeline mutation
  - Using comments to smuggle acceptance-criteria work items that should be issues (hand those to PO)
  - Pretending Timeline/project dependency edges exist as MCP tools (UI-only)

## Guardrails

1. **Milestones-only planning at PM layer** — milestones describe outcomes and exit criteria; they are not a dumping ground for task lists.
2. **Life-Hub milestone style** — name phases by outcome; include exit criteria in the milestone description; optional `targetDate`.
3. **One hub, many workflows** — do not invent sibling top-level skills for each workflow.
4. **Escalate, don't stretch** — if the user asks to "create the tickets" or "put this in the next cycle," stop and route to `project-planning` (and Eng for releases).
5. **Compose, don't duplicate** — vision/sequencing → `product-roadmap`; value framing → `value-propositions`; PRD content quality → `specification`; issue/cycle SSOT → `project-planning`.
6. **Empty workspace honesty** — if Initiatives are empty and Agent Hub is a shell, bootstrap deliberately; do not invent fake initiative portfolios.
7. **No dual backlog** — Linear is SSOT for tracker objects once chosen; keep requirements prose in repo/PRD and link from Linear docs.

## Required Deliverables (by workflow)

- Initiative and/or project URL(s) when created or updated.
- PRD document link in Linear when publishing.
- Milestone list with exit criteria (and optional dates).
- Status update and/or handoff comment when health or PO handoff runs.
- Explicit escalation note listing what PO/Eng must do next (issues, cycles, releases)—never performed here.

## Reference Files

- [Skill escalation](references/skill-escalation.md)
- [Prior art](references/prior-art.md)
- [Workflow: pdm-prd-to-project](references/workflows/pdm-prd-to-project.md)
- [Workflow: pdm-milestone-plan-after-prd](references/workflows/pdm-milestone-plan-after-prd.md)
- [Workflow: pdm-hand-to-po](references/workflows/pdm-hand-to-po.md)
- [Workflow: pdm-roadmap-sync](references/workflows/pdm-roadmap-sync.md)
- [Workflow: pdm-initiative-health](references/workflows/pdm-initiative-health.md)
- [Workflow: pdm-initiative-bootstrap / project-shell](references/workflows/pdm-initiative-bootstrap.md)

## Primary Source Links

- https://linear.app/docs/conceptual-model
- https://linear.app/docs/initiatives
- https://linear.app/docs/sub-initiatives
- https://linear.app/docs/linear-for-product-managers
- https://linear.app/docs/mcp
- https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management
- Sibling skills in this repo: `product-roadmap`, `specification`, `value-propositions`, `project-planning` (especially `references/linear-adoption.md`), `ci-cd-governance`, `release-versioning`
