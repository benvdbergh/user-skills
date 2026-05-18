# Skill escalation boundaries

## Owns

- Agile decomposition into epics, stories, and optional tasks in the backlog **SSOT** (markdown work items or a configured delivery tracker).
- `.project-planning.yaml` manifest; dependencies and traceability expressed in that SSOT (`depends_on` / `traces_to` in files, or tracker fields per platform guide).
- Planning workflows: init, shard from sources, create epic/story, plan review.
- Lint and quality gates (`LintPlan.ts` when `files`; [plan-quality-review.md](plan-quality-review.md) by SSOT mode).
- **Backlog SSOT** in markdown or a configured delivery tracker — never both ([SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot)).

## Does not own

- Product vision, initiative horizons, or portfolio roadmap framing (`product-roadmap`).
- PRD/spec/constitution authoring (`specification`).
- Technical architecture and ADR content (`software-architecture`).
- SemVer, changelog, or release automation (`release-versioning`).
- Tracker workspace administration, billing, or OAuth setup (vendor docs).

## Escalate to

| Trigger | Skill |
|---------|--------|
| “What should we build next quarter?” / initiative scope | `product-roadmap` |
| “Write the PRD” / spec-first artifacts | `specification` |
| System design, NFRs, API topology | `software-architecture` |
| Version bump, release notes, tagging | `release-versioning` |
| Git history, branches, checkpoints | `version-control` |

## Composition with delivery trackers

- **project-planning** defines *what* to build; backlog lives in one SSOT (markdown or tracker).
- Requirements stay in repo docs; epics/stories are not duplicated across markdown and a tracker.
- **Linear:** [linear-adoption.md](linear-adoption.md) when `delivery_tracker: linear` — milestones/issues are SSOT.
