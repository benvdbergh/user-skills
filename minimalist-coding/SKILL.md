---
name: minimalist-coding
description: Search-first coding workflow enforcing YAGNI principles, Clean Architecture layering, and DDD structural standards. USE WHEN implementing features, writing code, modifying codebase, structuring layers, applying clean architecture, DDD, naming conventions, library-first approach, OR user requests code changes. Enforces Locate→Modify→Create hierarchy, two-phase coding loop, and automatic refactoring.
license: MIT
---

# minimalist-coding — Search-First Code Development

## Overview

This skill enforces a "Search-Plan-Implement-Refactor" workflow over "Generate-and-Test." Makes code reuse the default and new code creation the exception.

## Core Principles

### YAGNI (You Ain't Gonna Need It) Hierarchy

**Strict operation order:** Locate → Modify → Create. This order reduces regression surface and keeps diffs reviewable.

1. **Locate** - Can this be done by calling an existing function?
2. **Modify** - Can this be done by adding a parameter/logic to an existing function?
3. **Create** - Only if #1 and #2 are impossible, create a new utility.

### Two-Phase Coding Loop

1. **Architect (Planner)** - Reviews story and existing code. Outputs Diff Plan.
2. **Scripter (Executor)** - Executes only the approved Diff Plan.

### State Reset & Refactor

- **Automatic Rollback** - On test failure, revert to git HEAD before retry
- **Refactor Pass** - After success, mandatory cleanup (remove dead code, simplify)

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **SearchPlanImplement** | "implement", "code", "add feature", "modify" | `references/SearchPlanImplement.md` |
| **RefactorPass** | "refactor", "cleanup code", after implementation success | `references/RefactorPass.md` |
| **CleanArchitectureAndDDD** | "clean architecture", "DDD", "layer structure", "naming conventions", "library-first", "ports and adapters", "bounded context" | `references/clean-architecture-and-ddd.md` |

## Tools

**GrepSymbol.ts** - Search for function/class names globally
```bash
bun run $PAI_DIR/skills/minimalist-coding/scripts/GrepSymbol.ts --symbol <name> --type <function|class>
```

**GetDependencies.ts** - See what calls a specific function
```bash
bun run $PAI_DIR/skills/minimalist-coding/scripts/GetDependencies.ts --symbol <name> --file <path>
```

**MinimalDiffApply.ts** - Apply specific line changes only
```bash
bun run $PAI_DIR/skills/minimalist-coding/scripts/MinimalDiffApply.ts --file <path> --start <line> --end <line> --content <text>
```

**LintAndShrink.ts** - Post-processing: lint + remove dead code
```bash
bun run $PAI_DIR/skills/minimalist-coding/scripts/LintAndShrink.ts --file <path>
```

**CodeQualityGate.ts** - Check complexity, quality metrics
```bash
bun run $PAI_DIR/skills/minimalist-coding/scripts/CodeQualityGate.ts --file <path> --baseline <score>
```

## Examples

**Example 1: Implement user validation**
```
User: "Add user validation"
→ Architect: Searches for "validate", "user", "check"
→ Finds existing validateUser() function
→ Diff Plan: Modify validateUser() to add new check
→ Scripter: Applies minimal diff
→ Refactor: Removes dead code
```

**Example 2: Create new feature**
```
User: "Add email notification"
→ Architect: Searches codebase, finds no existing notification code
→ Diff Plan: Create new NotificationService class
→ Scripter: Creates minimal implementation
→ Quality Gate: Validates complexity, lint score
```

## Success Criteria

**Definition of Done:**
- ✅ Tests pass
- ✅ No new files (unless justified)
- ✅ Lint score maintained or improved
- ✅ Cyclomatic complexity under threshold
- ✅ Code delta reasonable for task complexity

## Integration

- **VersionControl Skill** - Rollback on failure, diff application
- **Prompting Skill** - YAGNI principles in coding prompts
- **Agents Skill** - Architect/Scripter personas
- **ProjectPlanning Skill** - Code quality in story acceptance criteria
