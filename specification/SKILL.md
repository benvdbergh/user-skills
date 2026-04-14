---
name: specification
description: >-
  Specification-driven development orchestrator for project specifications, PRDs,
  technical implementation plans, and constitutions with scale-aware standards,
  quality gates, and handoff contracts to architecture and planning skills. Use
  when the user asks to generate a spec, create a PRD, write a technical plan,
  define project guardrails, or run a spec-first workflow.
license: MIT
metadata:
  author: PAI
  version: 2.0.0
---

# specification - Specification-Driven Development

This skill owns the **specification backbone** for product delivery: creating high-quality specifications and setting quality/decision guardrails before implementation starts.

It is intentionally **domain-first** (standards and decision quality) and **artifact-second** (templates/scripts).

## Mandatory Agent Behaviors

1. **Start with product and delivery context** before drafting artifacts: business outcome, user, constraints, risk, and scale.
2. **Use scale-aware defaults** from `references/scale-playbooks.md` (startup, growth, enterprise) instead of one-size-fits-all templates.
3. **Write measurable requirements and acceptance criteria**; reject vague wording such as "fast", "secure", or "user friendly" without thresholds.
4. **Define explicit quality gates** using `references/quality-gates.md` and embed go/no-go checks in PRD/plan/constitution outputs.
5. **Keep handoff contracts intact** for downstream skills (`project-planning`, `software-architecture`, `ux-designer`): stable section names, traceability links, and assumptions.
6. **Do not invent architecture details** when architecture is unresolved; escalate to `software-architecture` and reference unresolved decisions.
7. **Treat templates/scripts as scaffolding**; the final artifact must reflect domain quality standards in `references/domain-standards.md`.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **GenerateSpec** | "generate spec", "create spec", "specify project" | `references/GenerateSpec.md` |
| **GeneratePRD** | "create PRD", "product requirements", "generate PRD" | `references/GeneratePRD.md` |
| **GeneratePlan** | "technical plan", "implementation plan", "architecture plan" | `references/GeneratePlan.md` |
| **GenerateConstitution** | "create constitution", "project guardrails", "tech stack constraints" | `references/GenerateConstitution.md` |

## Domain Knowledge Backbone

- `references/domain-standards.md` - Industry-aligned standards for requirement quality, NFR precision, ADR hygiene, and governance.
- `references/scale-playbooks.md` - What "good" looks like at startup/growth/enterprise scale.
- `references/quality-gates.md` - Release-readiness and implementation-readiness gates to embed in spec artifacts.
- `references/skill-escalation.md` - Ownership boundaries and escalation map to adjacent skills.

## Core Components (Execution Utilities)

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

### 2. Templates (Scaffolding)

- **SpecTemplate.md** - Base specification structure (Spec Kit pattern) in `assets/`
- **PRDTemplate.md** - Product requirements template (BMAD pattern) in `assets/`
- **PlanTemplate.md** - Technical plan template in `assets/`
- **ConstitutionTemplate.md** - Project guardrails template in `assets/`

### 3. Storage (Default Profile)

Default path profile remains `~/Knowledge/Projects/{project-name}/specs/`. Callers may override output paths; quality and contracts stay the same regardless of location.

## Integration Contracts (Neighbor Skills)

- **`project-planning`** - Consumes PRD/plan/spec sections and traceability links; preserve requirement IDs, assumptions, risks, and dependency sections.
- **`software-architecture`** - Owns solution architecture decisions and implementation readiness for complex technical choices; this skill records unresolved architecture decisions and links out.
- **`ux-designer`** - Owns UX flow and interaction-level design; PRDs should include UX constraints and UX validation hooks, not full design systems.
- **`tech-documentation`** - Owns broader documentation orchestration/export workflows; this skill focuses on specification artifacts.
- **`version-control`** - Optional versioning discipline for artifact lifecycle and change tracking.

## Examples

**Example 1: Generate project specification**
```
User: "Create a spec for my task management app"
→ Invokes GenerateSpec workflow
→ Applies startup/growth/enterprise selection from scale playbook
→ Uses assets/SpecTemplate.md as scaffold
→ Produces spec with measurable goals, scoped requirements, and quality gates
```

**Example 2: Create PRD**
```
User: "Generate a PRD for the authentication feature"
→ Invokes GeneratePRD workflow
→ Uses assets/PRDTemplate.md plus domain standards for acceptance criteria and NFRs
→ Adds success metrics, risk assumptions, and rollout guardrails
→ Creates PRD.md with handoff-ready sections for planning and architecture
```

**Example 3: Generate technical plan**
```
User: "Create a technical plan from the spec"
→ Invokes GeneratePlan workflow
→ Reads existing spec.md
→ Routes unresolved architecture decisions to software-architecture
→ Produces phased implementation plan with ADR map, risk register, and gates
```

**Example 4: Create project constitution**
```
User: "Set up guardrails for this project"
→ Invokes GenerateConstitution workflow
→ Builds policy-grade guardrails (security, reliability, delivery, change control)
→ Creates CONSTITUTION.md with enforcement model and exception process
```

## Project-local specs

Projects may keep **architecture** and **UX design** documents in a `specs/` folder at the project root (e.g. `specs/architecture.md`, `specs/ux-design.md`). These are part of the specification ecosystem:

- **architecture.md** — Technical architecture decisions, system context, building blocks, and dependency direction (aligned with software-architecture create-architecture workflow).
- **ux-design.md** — Web UI layout, design system, user flows, wireframes, and validation checklist (aligned with ux-designer workflows).

When making layout, UX, or architectural changes, update these project-local specs so they stay in sync with the codebase and with the main project spec (`specs/spec.md`). Use a temporary change document (e.g. `specs/CHANGES-*.md`) to describe the overall impact of a set of modifications before or while implementing.
