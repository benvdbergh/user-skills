# Skill Escalation

Related: `../SKILL.md`, `industry-standards.md`, `framework-selection-by-scale.md`

Defines what this skill should own versus delegate.

## Boundary Map

| Concern | Primary skill | Delegate to |
|---|---|---|
| Roadmap horizons, outcome framing, release intent | `product-roadmap` | N/A |
| Epics/stories/tasks and dependency DAG in planning files | `project-planning` | `product-roadmap` provides upstream roadmap outcomes |
| Technical topology decisions, NFR architecture, API/data design | `software-architecture` | `product-roadmap` consumes constraints and runway guidance |
| SemVer policy, changelog, release automation process | `release-versioning` | `product-roadmap` provides feature/enabler slices by release |
| Version history and branch operations for PAI changes | `version-control` | `product-roadmap` only references release intent and timing |
| Deep external evidence refresh | `deep-research` / `research-analysis` | `product-roadmap` consumes synthesized findings |

## Composition Rules

1. If roadmap conflict is primarily technical feasibility, route to `software-architecture` first.
2. If roadmap is approved and needs implementation decomposition, route to `project-planning`.
3. If release mechanics are requested (version bump, notes, automation), route to `release-versioning`.
4. Keep `product-roadmap` focused on decision framing, sequencing, and impact assessment.
