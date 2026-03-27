---
name: specification
description: >-
  Specification-driven development system for generating and managing project specifications, PRDs, technical plans, and constitutions. USE WHEN generate spec, create PRD, write technical plan, create constitution, specification-driven development, spec-first workflow.
license: MIT
metadata:
  author: PAI
  version: 1.0.0
---

# specification - Specification-Driven Development

**Invoke when:** generate spec, create PRD, write technical plan, create constitution, specification-driven development, spec-first workflow, project specification.

## Overview

The specification skill enables specification-driven development by providing workflows and tools for:
- **Spec Generation** - Spec Kit-style executable specifications
- **PRD Creation** - BMAD-style product requirements documents
- **Technical Planning** - Architecture and implementation plans
- **Constitution** - Project guardrails and constraints

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **GenerateSpec** | "generate spec", "create spec", "specify project" | `references/GenerateSpec.md` |
| **GeneratePRD** | "create PRD", "product requirements", "generate PRD" | `references/GeneratePRD.md` |
| **GeneratePlan** | "technical plan", "implementation plan", "architecture plan" | `references/GeneratePlan.md` |
| **GenerateConstitution** | "create constitution", "project guardrails", "tech stack constraints" | `references/GenerateConstitution.md` |

## Core Components

### 1. CLI Tools

**Specify.ts** - Generate project specifications
```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type <spec|prd|plan|constitution> \
  --output <path>
```

**ValidateSpec.ts** - Validate specification completeness
```bash
bun run $PAI_DIR/skills/specification/scripts/ValidateSpec.ts \
  --spec <path-to-spec.md>
```

**UpdateSpec.ts** - Update and version specifications
```bash
bun run $PAI_DIR/skills/specification/scripts/UpdateSpec.ts \
  --spec <path-to-spec.md> \
  --update <description>
```

### 2. Templates

- **SpecTemplate.md** - Base specification structure (Spec Kit pattern) in `assets/`
- **PRDTemplate.md** - Product requirements template (BMAD pattern) in `assets/`
- **PlanTemplate.md** - Technical plan template in `assets/`
- **ConstitutionTemplate.md** - Project guardrails template in `assets/`

### 3. Storage

Specifications are stored in `~/Knowledge/Projects/{project-name}/specs/` and version controlled via VersionControl skill.

## Examples

**Example 1: Generate project specification**
```
User: "Create a spec for my task management app"
→ Invokes GenerateSpec workflow
→ Uses assets/SpecTemplate.md
→ Generates spec.md in ~/Knowledge/Projects/task-manager/specs/
→ Version controlled automatically
```

**Example 2: Create PRD**
```
User: "Generate a PRD for the authentication feature"
→ Invokes GeneratePRD workflow
→ Uses assets/PRDTemplate.md
→ Integrates with Prompting skill for document generation
→ Creates PRD.md in project directory
```

**Example 3: Generate technical plan**
```
User: "Create a technical plan from the spec"
→ Invokes GeneratePlan workflow
→ Reads existing spec.md
→ Uses assets/PlanTemplate.md
→ Generates implementation plan
```

**Example 4: Create project constitution**
```
User: "Set up guardrails for this project"
→ Invokes GenerateConstitution workflow
→ Uses assets/ConstitutionTemplate.md
→ Creates CONSTITUTION.md with tech stack constraints
```

## Integration Points

- **Prompting Skill** - Uses templates for document generation
- **VersionControl Skill** - All specs are version controlled
- **StateManagement Skill** - Specs inform architectural state
- **ProjectPlanning Skill** - Specs feed into planning workflows

## Project-local specs

Projects may keep **architecture** and **UX design** documents in a `specs/` folder at the project root (e.g. `specs/architecture.md`, `specs/ux-design.md`). These are part of the specification ecosystem:

- **architecture.md** — Technical architecture decisions, system context, building blocks, and dependency direction (aligned with software-architect create-architecture workflow).
- **ux-design.md** — Web UI layout, design system, user flows, wireframes, and validation checklist (aligned with ux-designer workflows).

When making layout, UX, or architectural changes, update these project-local specs so they stay in sync with the codebase and with the main project spec (`specs/spec.md`). Use a temporary change document (e.g. `specs/CHANGES-*.md`) to describe the overall impact of a set of modifications before or while implementing.
