# Create Architecture Workflow

**Goal:** Produce architecture decisions through collaborative step-by-step discovery so that implementation stays consistent and conflicts are avoided.

**Your role:** Act as an architectural facilitator working with the user as a peer. You bring structure and architectural knowledge; they bring domain and product vision. Proceed only when the user has approved and asked to continue to the next step.

## Execution

1. **Scope and context**
   - Clarify project/product name and what is in scope (system, service, or product slice).
   - Identify existing inputs: PRD, UX artifacts, constraints, tech stack preferences.
   - If there is no PRD or plan yet, suggest loading the **`specification`** skill to produce one before locking architecture.

2. **Context and boundaries**
   - Define system context (C4 L1 or equivalent): users, external systems, boundaries.
   - List main deployable units (containers/apps) and their responsibilities.

3. **Key technical decisions**
   - For each major decision (data store, APIs, auth, deployment, integration style), capture:
     - **Decision** (one line)
     - **Rationale** (why this option)
     - **Alternatives considered** and why rejected
     - **Consequences** (trade-offs, limits)
   - Use the structure in `../assets/architecture-decision-template.md` for the decision document.

4. **Building blocks and interfaces**
   - Identify main components/services and their interfaces (APIs, events, contracts).
   - Ensure dependency direction is inward (infrastructure → application → domain).
   - For **API shape, data ownership, schema evolution, and versioning/compatibility** rules, follow **`SKILL.md`** *Functional architecture topic map* and load **`references/functional-domain-data-modeling.md`**, **`references/functional-api-design-consistency.md`**, and/or **`references/functional-versioning-compatibility.md`** as needed; capture decisions in the ADR (or attach OpenAPI/AsyncAPI pointers).

5. **Non-functional and risks**
   - Note NFRs that shape design (performance, security, availability, cost).
   - Call out main risks and mitigations.
   - When the scope is **platform-like** or **production-critical**, optionally cross-check against **`references/platform-fitness-evaluation.md`** (delivery, operability, data/events, security-by-construction) and record pass/fail **gates** or waivers in the decision doc.

6. **Review and handoff**
   - Summarize decisions and open points.
   - Confirm alignment with PRD and UX; note any gaps.
   - Suggest next step: run check-implementation-readiness when PRD, UX, and epics exist.

## Rules

- One major topic per step; wait for user approval before moving on.
- Append to a single architecture decision document; do not overwrite previous sections.
- Speak in the user’s language (from project config if available).
- If the project uses BMAD and has `_bmad/bmm/workflows/3-solutioning/create-architecture`, you may point the user to that workflow for full step files and data; otherwise follow this reference as the workflow.
