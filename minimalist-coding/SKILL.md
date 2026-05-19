---
name: minimalist-coding
description: >-
  Search-first coding workflow enforcing YAGNI, Clean Architecture layering, and DDD standards.
  Keeps delivery-tracker work items transparent when a story or issue is in scope. USE WHEN
  implementing features, writing code, modifying codebase, executing a story or task, or user
  requests code changes. Enforces Locate→Modify→Create, two-phase coding loop, and refactor pass.
license: MIT
metadata:
  version: 1.2.0
---

# minimalist-coding — Search-First Code Development

## Overview

Search-Plan-Implement-Refactor over generate-and-test. Code reuse is default; new code is the exception.

## Core Principles

### YAGNI hierarchy

**Order:** Locate → Modify → Create.

### Two-phase loop

1. **Architect** — search codebase, output Diff Plan.
2. **Scripter** — execute plan only.

### State reset and refactor

- Roll back to git HEAD on test failure (`version-control`).
- **Refactor pass** after success — mandatory cleanup.

### Work item in scope?

Run [delivery-tracker-execution.md](references/delivery-tracker-execution.md) **§ Start** before code and **§ Close** after refactor pass. Context: `.project-planning.yaml` at project root (`delivery_tracker`, story/task dirs).

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **DeliveryTrackerExecution** | story/task/issue id, "implement STORY-", Linear issue | `references/delivery-tracker-execution.md` |
| **SearchPlanImplement** | implement, code, add feature, modify | `references/SearchPlanImplement.md` |
| **RefactorPass** | refactor, cleanup, after tests pass | `references/RefactorPass.md` |
| **CleanArchitectureAndDDD** | clean architecture, DDD, ports and adapters | `references/clean-architecture-and-ddd.md` |

Boundaries: [skill-escalation.md](references/skill-escalation.md)

## Tools

Run from this skill’s `scripts/` directory (or set `PAI_DIR` to your skills root).

```bash
bun run scripts/GrepSymbol.ts --symbol <name> --type <function|class>
bun run scripts/GetDependencies.ts --symbol <name> --file <path>
bun run scripts/MinimalDiffApply.ts --file <path> --start <n> --end <n> --content <text>
bun run scripts/LintAndShrink.ts --file <path>
bun run scripts/CodeQualityGate.ts --file <path> --baseline <score>
```

## Examples

**With work item (STORY-2-1)**

```
→ Read .project-planning.yaml; delivery-tracker § Start
→ SearchPlanImplement → RefactorPass
→ delivery-tracker § Close with evidence
```

**Ad-hoc (no linked item)**

```
→ SearchPlanImplement → RefactorPass (skip delivery-tracker)
```

## Success Criteria

- Tests pass; minimal diff; lint/complexity gates hold.
- Work item in scope: tracker started before code, closed with outcome + evidence after refactor.

## MCP and safety

Linear execution (`delivery_tracker: linear`): mapping and safety in [delivery-tracker-execution.md](references/delivery-tracker-execution.md) § Linear MCP.

**Tool safety (summary):** Safe to read issues and update state/comments. Confirm with user before archive, delete, or changing milestone/project scope.

## Integration

- **project-planning** — backlog SSOT and manifest; not execution status updates.
- **version-control** — rollback, commits/PRs for tracker evidence.
- **code-review-skill** — review after handoff; not a substitute for close comment.
