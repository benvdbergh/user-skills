# Skill Escalation — pdm-linear

Related: [../SKILL.md](../SKILL.md), [prior-art.md](prior-art.md)

Defines what this hub skill owns versus what it must escalate.

## Owns (Product Manager / Linear framing layer)

- Linear **Initiatives** (create/update, labels, status, priority, target dates).
- Linear **Projects** as delivery containers and framing shells (overview, labels, lead, dates).
- Linear **Documents** for PRD / overview narratives attached to projects.
- Linear **Milestones** as outcome phases with exit criteria (planning model — milestones only).
- **Status updates** on initiatives and projects (`save_status_update`, read via `get_status_updates`).
- **Comments** on projects/documents (and initiative context when supported) for alignment and **PO handoff**—not for inventing backlog items.
- Read-only **cycle** awareness (`list_cycles`) for capacity context in health narratives.
- Routing users into the correct sibling skill when the ask leaves PM framing.

## Does not own

| Concern | Do not do here | Escalate to |
|---------|----------------|-------------|
| Vision → roadmap horizons, Now/Next/Later sequencing, runway framing | Do not recreate full roadmap frameworks inside Linear-only prose | `product-roadmap` |
| PRD / spec quality, acceptance criteria depth, normative requirements writing | Do not author the full PRD from scratch under this skill unless user already has content; publish/link what `specification` owns | `specification` |
| Value proposition, JTBD, positioning, pricing logic | Do not invent value narrative as substitute for VP work | `value-propositions` |
| Epics/stories/issues, INVEST decomposition, blocker graphs, cycle packing | **Never** `save_issue`; never pack cycles | `project-planning` (PO; Linear via `references/linear-adoption.md`) |
| SemVer, changelogs, release notes, ship pipelines | Never `save_release` / release mutation | `release-versioning` + `ci-cd-governance` |
| CI workflow YAML, required checks, action pinning | Out of scope | `ci-cd-governance` |
| Deep architecture / NFR topology | Out of scope | `software-architecture` |

## Boundary map

| Concern | Primary skill | Notes |
|---------|---------------|-------|
| Initiative ↔ roadmap outcome alignment | `pdm-linear` + `product-roadmap` | Roadmap decides *what* horizons; this skill mirrors into Linear Initiatives |
| PRD content | `specification` | This skill `save_document`s / links the approved PRD |
| Value framing before initiative bootstrap | `value-propositions` | Feed outcomes into initiative description |
| Milestone outcomes after PRD | `pdm-linear` | Then hand to PO |
| Issues under milestones + cycles | `project-planning` | PO + Eng only |
| Releases | `release-versioning` / `ci-cd-governance` | Never from PM Linear skill |

## Composition rules

1. If the user needs a **roadmap** (horizons, commitment vs forecast), run or cite `product-roadmap` first; then `pdm-roadmap-sync`.
2. If the user needs a **PRD written or sharpened**, use `specification`; then `pdm-prd-to-project`.
3. If the user needs **why this product wins**, use `value-propositions` before or beside initiative bootstrap.
4. When milestones + PRD doc + framing are done, run `pdm-hand-to-po` and **stop**. Do not create issues "to be helpful."
5. If the user asks for **tickets, sprint load, or cycle assignment**, refuse issue/cycle writes and escalate to `project-planning`.
6. If the user asks for **release versioning, notes, or pipeline mutation**, escalate to `release-versioning` and `ci-cd-governance`—never Linear release CRUD from this skill.
7. Prefer **one** Linear project per effort shell; use milestones for phases. Split to a new project only when independent lead/health/roadmap line is required (see prior-art).

## Hard refuse (always)

- `save_issue`
- Cycle create/update/delete (only `list_cycles` is allowed)
- `save_release`, `save_release_note`, release pipeline mutation
- Parallel markdown backlog alongside Linear for the same work

When refusing, state the escalation target in one short sentence and offer to prepare the handoff comment instead.
