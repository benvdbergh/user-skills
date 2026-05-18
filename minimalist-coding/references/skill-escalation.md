# Skill escalation boundaries

## Owns

- Search-first implementation, two-phase plan/execute, refactor and quality gates.
- Execution-time tracker updates ([delivery-tracker-execution.md](delivery-tracker-execution.md)).
- Clean Architecture / DDD when requested ([clean-architecture-and-ddd.md](clean-architecture-and-ddd.md)).

## Does not own

- Backlog authoring, sharding, plan review (`project-planning`).
- Roadmap, specs, ADRs, releases, PR review rubrics (`product-roadmap`, `specification`, `software-architecture`, `release-versioning`, `code-review-skill`).
- Tracker admin and OAuth (vendor / `project-planning` platform guides).

## Escalate to

| Trigger | Skill |
|---------|--------|
| Create epic/story/task, replan | `project-planning` |
| PRD / spec | `specification` |
| Architecture / ADR | `software-architecture` |
| PR review | `code-review-skill` |
| Git / rollback | `version-control` |

## Composition

`project-planning` defines *what*; this skill implements and keeps the backlog item current during execution. One SSOT — see `.project-planning.yaml` and [project-planning § Delivery tracker](../../project-planning/SKILL.md#delivery-tracker-ssot).
