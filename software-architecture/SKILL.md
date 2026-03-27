---
name: software-architecture
description: >-
  Guides quality-focused software architecture and technical design. Use when
  designing architecture, reviewing structure, creating architecture decisions,
  checking implementation readiness, researching topology and patterns, or
  aligning PRD/UX/architecture/epics. Applies lean architecture wisdom and
  separation of concerns. For Clean Architecture / DDD / naming conventions,
  use the minimalist-coding skill.
license: MIT
metadata:
  author: PAI
  version: 2.0.0
  sources:
    - NeoLabHQ/context-engineering-kit (software-architecture)
    - bmad-code-org/BMAD-METHOD (architect agent, 3-solutioning)
---

# software-architecture

Guides software architecture and technical design using lean architecture principles. Combines workflow automation for architecture artifacts, topology research, and implementation-readiness checks so the agent behaves like a senior architect: pragmatic, user-journey driven, and aligned with business value.

## When to Use This Skill

- User asks to **design or review** system/service/API architecture
- User wants to **create architecture** or **document technical decisions** (create-architecture workflow)
- User asks **implementation readiness** or whether PRD, UX, architecture, and epics/stories are aligned
- User wants to **research topology patterns** before committing to an architecture
- User asks about **technology selection**, **scalable patterns**, or **separation of concerns**
- User mentions **bounded contexts**, **use cases**, **domain vs infrastructure**

> **For Clean Architecture, DDD, naming conventions, and library-first coding rules**, load the `minimalist-coding` skill's `references/clean-architecture-and-ddd.md`.

## Principles (Architect Persona)

- **Lean architecture**: Draw on distributed systems, cloud patterns, scalability trade-offs, and what actually ships. User journeys drive technical decisions; prefer boring technology for stability.
- **Simple solutions that scale when needed.** Developer productivity is architecture. Connect every decision to business value and user impact.
- **Collaborative facilitation**: Work as a peer with the user — structured thinking and architectural knowledge on one side, domain expertise and product vision on the other. Make decisions that prevent implementation conflicts.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ResearchTopology** | "new architecture", "topology research", "pattern selection", "best way to build", "which pattern" | `references/ResearchTopology.md` |
| **create-architecture** | "create architecture", "create technical architecture", "document technical decisions", "solution design" | `references/create-architecture.md` |
| **check-implementation-readiness** | "implementation readiness", "are we ready to build", "align PRD UX architecture epics" | `references/check-implementation-readiness.md` |

## Examples

**Example 1: Topology research**
```
User: "What's the best way to build a real-time notification system?"
→ Route to ResearchTopology workflow
→ Load references/ResearchTopology.md
→ Research patterns (event-driven, SSE, WebSocket, polling trade-offs)
→ Evaluate against constraints (scale, latency, infra)
Result: Pattern recommendation with trade-off rationale
```

**Example 2: Create architecture**
```
User: "Let's create the technical architecture for the new checkout service"
→ Route to create-architecture workflow
→ Load references/create-architecture.md
→ Guided step-by-step discovery; produce architecture decision document
→ Use assets/architecture-decision-template.md as starting structure
Result: Architecture decisions documented and ready to keep implementation on track
```

**Example 3: Implementation readiness**
```
User: "Are we ready to start building? Check PRD, UX, and architecture."
→ Route to check-implementation-readiness workflow
→ Load references/check-implementation-readiness.md
→ Verify PRD, UX, architecture, epics/stories alignment
Result: Clear go/no-go and list of gaps to close
```

## References and Assets

- **references/ResearchTopology.md** — Research-driven topology and pattern selection workflow.
- **references/create-architecture.md** — Guided workflow to create architecture decisions.
- **references/check-implementation-readiness.md** — Checklist to ensure PRD, UX, architecture, and epics/stories are aligned before implementation.
- **references/prior-art.md** — Prior art and pattern catalogue reference.
- **assets/architecture-decision-template.md** — Template for architecture decision documents.

## Optional: Portfolio and Enterprise Architecture Levels

When the user asks about **portfolio**, **strategy-to-code**, **SAFe**, **ArchiMate**, **arc42**, **BPMN**, **enterprise modeling**, or **ontology-guided modeling**, use the `enterprise-architecture` skill instead. The `software-architecture` skill stays focused on **solution/product-level** software architecture and technical design.
