---
name: software-architecture
description: >-
  Guides quality-focused software architecture and technical design. Use when
  designing architecture, reviewing structure, creating architecture decisions,
  checking implementation readiness, evaluating platform or product fitness
  (scorecard, NFR gates), designing or reviewing APIs and data models,
  versioning and compatibility, researching topology and patterns, or aligning
  PRD/UX/architecture/epics. Applies lean architecture wisdom and separation of
  concerns. For Clean Architecture / DDD / naming conventions, use the
  minimalist-coding skill.
license: MIT
metadata:
  author: PAI
  version: 2.3.1
  sources:
    - NeoLabHQ/context-engineering-kit (software-architecture)
    - bmad-code-org/BMAD-METHOD (architect agent, 3-solutioning)
---

# software-architecture

Guides software architecture and technical design using lean architecture principles. Combines workflow automation for architecture artifacts, topology research, implementation-readiness checks, optional platform/product fitness evaluation, and functional API/data/versioning guidance so the agent behaves like a senior architect: pragmatic, user-journey driven, and aligned with business value.

## When to Use This Skill

- User asks to **design or review** system/service/API architecture
- User wants to **create architecture** or **document technical decisions** (create-architecture workflow)
- User asks **implementation readiness** or whether PRD, UX, architecture, and epics/stories are aligned
- User wants to **research topology patterns** before committing to an architecture
- User asks about **technology selection**, **scalable patterns**, or **separation of concerns**
- User mentions **bounded contexts**, **use cases**, **domain vs infrastructure**
- User wants a **platform scorecard**, **fitness evaluation**, **architecture review** against delivery/operability/security, or **vendor/platform comparison** with NFR depth
- User asks about **API design**, **REST/resource modeling**, **OpenAPI**, **data modeling**, **schema migration**, **semantic versioning**, or **backward compatibility** between services

> **For Clean Architecture, DDD, naming conventions, and library-first coding rules**, load the `minimalist-coding` skill's `references/clean-architecture-and-ddd.md`.

> **For PRDs, technical plans, or constitutions**, load the `specification` skill when those artifacts are missing or need to be created before readiness checks.

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
| **EvaluatePlatformFitness** | "platform scorecard", "fitness evaluation", "architecture fitness", "evaluate platform", "NFR gates", "vendor technical due diligence" | `references/platform-fitness-evaluation.md` |
| **FunctionalArchitecture** | "functional architecture", combining APIs + data + versioning | `SKILL.md` (topic map below + agent workflow) |
| **FunctionalDomainData** | "bounded context", "data ownership", "aggregate", "schema migration", "expand-contract" | `references/functional-domain-data-modeling.md` |
| **FunctionalApiDesign** | "API design", "OpenAPI", "REST guidelines", "Problem Details", "API consistency", "Zalando", "AIP" | `references/functional-api-design-consistency.md` |
| **FunctionalVersioning** | "semantic versioning", "backward compatibility", "API versioning", "Pact", "deprecation", "sunset" | `references/functional-versioning-compatibility.md` |

## Functional architecture topic map

**Purpose:** Guidance for what the system *is* and *does* (domain, HTTP APIs, versioning)—the **functional** side of architecture. Complements NFR-focused **`references/platform-fitness-evaluation.md`**.

**Delegation:** Tactical DDD and Clean Architecture in code → **`minimalist-coding`** `references/clean-architecture-and-ddd.md` (see *When to Use This Skill* above).

| Topic reference | Load when |
|-----------------|-----------|
| **`references/functional-domain-data-modeling.md`** | Bounded contexts, aggregates, ownership, persistence evolution, expand–contract |
| **`references/functional-api-design-consistency.md`** | REST/resource design, OpenAPI, errors, pagination, org-wide API consistency |
| **`references/functional-versioning-compatibility.md`** | SemVer, HTTP API versions, deprecation, consumer-driven contracts |

**Cross-links**

- **Data model changes** affect **public API and event schemas** → coordinate `functional-api-design-consistency.md` and `functional-versioning-compatibility.md`.
- **New API versions** often imply a **schema/migration** story → `functional-domain-data-modeling.md` (expand–contract) and `functional-versioning-compatibility.md`.
- **Platform scorecards** that touch contracts → pair with **`references/platform-fitness-evaluation.md`**.

## Agent workflows

Execution steps for **EvaluatePlatformFitness** and **FunctionalArchitecture** live here; topic files under `references/functional-*.md` hold **examples, frameworks, no-gos, and links** only.

### Platform / product fitness evaluation

1. Clarify **evaluation goal** (build, buy, modernize, portfolio rationalization) and **non-negotiables**.
2. For each dimension in `references/platform-fitness-evaluation.md`, ask for **evidence** (repos, runbooks, dashboards, test reports, ADRs). Mark gaps as Low confidence.
3. Cross-check with **create-architecture** outputs or **ResearchTopology** recommendation for consistency.
4. If the scope is **enterprise portfolio / ArchiMate**, hand off to **`enterprise-architecture`** after the technical scorecard.

### Functional architecture (APIs, data, contracts)

1. **Clarify consumers** — internal only, partners, mobile, long-lived devices (affects versioning and field-add policies).
2. **Name ownership** — which context owns which writes; where the **system of record** is (`references/functional-domain-data-modeling.md`).
3. **Pick contract artifacts** — OpenAPI/AsyncAPI + schema registry for events if event-heavy (`references/functional-api-design-consistency.md`).
4. **Define compatibility rules** — package SemVer policy + HTTP API version channels + deprecation SLA (`references/functional-versioning-compatibility.md`).
5. **Add CI gates** — spec diff checks, breaking-change detection (stack-specific tools), contract tests for critical edges.
6. **Document no-gos** — short “don’t do this” list for the repo or platform (pull from no-go sections in each functional reference).

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

**Example 4: Platform / product fitness**
```
User: "Score this vendor platform for enterprise readiness."
→ Route to EvaluatePlatformFitness workflow
→ Load references/platform-fitness-evaluation.md; use assets/platform-scorecard-template.md
→ Score dimensions with evidence confidence; apply non-negotiable gates
Result: Scorecard with strengths, risks, investment view, recommended role
```

**Example 5: APIs, data, and versioning**
```
User: "We're splitting the monolith—how should we version APIs and evolve schemas safely?"
→ Route to FunctionalArchitecture workflow; follow *Agent workflows* → *Functional architecture* and *Functional architecture topic map* above
→ Load `references/functional-domain-data-modeling.md`, `references/functional-api-design-consistency.md`, and/or `references/functional-versioning-compatibility.md` as needed
→ Align on resource design (AIPs), OpenAPI as contract, expand–contract migrations, SemVer vs HTTP API versioning
Result: Concrete compatibility rules, no-gos, and CI/review gates
```

## References and Assets

- **references/ResearchTopology.md** — Research-driven topology and pattern selection workflow.
- **references/create-architecture.md** — Guided workflow to create architecture decisions.
- **references/check-implementation-readiness.md** — Checklist to ensure PRD, UX, architecture, and epics/stories are aligned before implementation.
- **references/platform-fitness-evaluation.md** — Platform/product fitness dimensions, quality gates, scoring, and links to DORA, Well-Architected, SRE, CNCF, SAMM/SSDF, strangler and contract patterns.
- **references/functional-domain-data-modeling.md** — Bounded context, ownership, expand–contract, data no-gos, examples.
- **references/functional-api-design-consistency.md** — REST/AIPs, OpenAPI, errors, consistency, API no-gos, examples.
- **references/functional-versioning-compatibility.md** — SemVer, HTTP API versioning, Pact, deprecation, versioning no-gos, examples.
- **references/prior-art.md** — Prior art and pattern catalogue reference.
- **assets/architecture-decision-template.md** — Template for architecture decision documents.
- **assets/platform-scorecard-template.md** — Output template for fitness evaluations and vendor due diligence.

## Optional: Portfolio and Enterprise Architecture Levels

When the user asks about **portfolio**, **strategy-to-code**, **SAFe**, **ArchiMate**, **BPMN**, **enterprise modeling**, or **ontology-guided modeling**, use the **`enterprise-architecture`** skill instead.