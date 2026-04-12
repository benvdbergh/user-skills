# The Documentation Framework (arc42)

## arc42 Section Overview

| Section | Purpose | Typical Content | Modeling Approach |
|---------|---------|-----------------|-------------------|
| 1. Introduction & Goals | Business context, key drivers | Stakeholders, quality goals, business objectives | Business Model L1 |
| 2. Constraints | Limitations and boundaries | Technical, organizational, regulatory constraints | Tables, simple diagrams |
| 3. Context & Scope | System boundaries | Business context, technical context | C4 Context (L1), Business Model L2 |
| 4. Solution Strategy | High-level approach | Technology decisions, top-level decomposition | Mixed: narrative + high-level diagrams |
| 5. Building Block View | Static structure | System decomposition at multiple levels | C4 L1-L4 (Context→Container→Component→Code) |
| 6. Runtime View | Dynamic behavior | Important scenarios, processes, interactions | BPMN-lite, Sequence diagrams |
| 7. Deployment View | Infrastructure mapping | Hardware, networks, deployment topology | C4 Deployment diagrams, Infrastructure views |
| 8. Cross-cutting Concepts | Recurring patterns | Security, persistence, communication patterns | Concept diagrams, pattern illustrations |
| 9. Architecture Decisions | Key choices and rationale | ADRs (Architecture Decision Records) | Structured text (ADR template) |
| 10. Quality Requirements | Non-functional requirements | Performance, security, reliability targets | Quality tree, scenarios |
| 11. Risks & Technical Debt | Known issues | Risks, technical debt, improvement areas | Risk matrices, tables |
| 12. Glossary | Terminology | Domain terms, acronyms, definitions | Alphabetical list |

## Zoom Level Strategy

### Business/Strategy Domain (2 levels)

**Level B1: Portfolio/Organization**
- **Scope:** Complete product portfolio, market positioning
- **Elements:** Product lines, capabilities, strategic goals, market segments
- **Stakeholders:** C-suite, product management, business development
- **Example:** "Intralogistics automation portfolio serving e-commerce and manufacturing verticals"

**Level B2: Product**
- **Scope:** Individual product value proposition
- **Elements:** Product features, supported processes, key requirements, target customers
- **Stakeholders:** Product owners, sales, marketing
- **Example:** "AGV Fleet Controller enabling autonomous material transport in warehouses"

### Software Architecture Domain (4-5 levels - C4 Model)

> **Routing:** arc42 describes *what* belongs in documentation at each zoom level. For **workflows** that produce solution-level decisions, C4-style decomposition, and implementation readiness (PRD/UX/epics alignment), load **`software-architecture`** after you have the arc42 section map.

**Level S1: System Context**
- **Scope:** The system and its environment
- **Elements:** The system as a black box, external systems, users
- **Stakeholders:** Everyone
- **Example:** AGV Fleet Controller, WMS, AGVs, operators, charging infrastructure

**Level S2: Container**
- **Scope:** High-level technology choices
- **Elements:** Applications, databases, file systems, services
- **Stakeholders:** Technical leads, DevOps, enterprise architects
- **Example:** Task Manager service, Path Planning service, PostgreSQL database, MQTT broker

**Level S3: Component**
- **Scope:** Internal structure of containers
- **Elements:** Major structural components and their interactions
- **Stakeholders:** Software architects, senior developers
- **Example:** Within Task Manager: TaskQueue, PriorityScheduler, TaskExecutor, StateManager

**Level S4: Code/Interface (API)**
- **Scope:** Detailed implementation
- **Elements:** Classes, interfaces, API endpoints, data structures
- **Stakeholders:** Developers, integrators
- **Example:** REST API endpoints, message schemas, interface definitions

**Level S5: Implementation (optional)**
- **Scope:** Code-level details
- **Elements:** Methods, algorithms, data flows
- **Stakeholders:** Developers only
- **Example:** A* pathfinding algorithm implementation

## Related References

- See `references/ArchitectureProcess.md` for how to populate arc42 sections
- For **solution-level** decision records (single solution / product), load the **`software-architecture`** skill and use `assets/architecture-decision-template.md` for Section 9–style content
- See `references/ModelingApproaches.md` for C4 and BPMN-lite details
