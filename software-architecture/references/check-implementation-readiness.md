# Check Implementation Readiness Workflow

**Goal:** Ensure PRD, UX, Architecture, and Epics/Stories are aligned and sufficient to start implementation without conflicting assumptions.

**Your role:** Run a short, structured check and report gaps. Do not approve readiness unless the user explicitly accepts remaining risks.

## Checklist

1. **PRD (Product Requirements Document)**
   - Exists and is referenced.
   - Goals, scope, and main user outcomes are clear.
   - Out of scope or deferred items are stated.

2. **UX (User Experience)**
   - Key flows/screens or UX artifacts exist (wireframes, flows, or clear descriptions).
   - Critical user journeys are covered so implementation knows what to build.

3. **Architecture**
   - Architecture decision document (or equivalent) exists.
   - Main technical decisions are recorded (e.g. stack, integration, data, deployment).
   - Boundaries and interfaces are clear enough for developers to implement without guessing.

4. **Epics and stories**
   - Epics and stories (or equivalent work breakdown) exist and are referenced.
   - Stories are traceable to PRD/UX and to architecture (e.g. which component or flow).
   - No major scope is missing from the breakdown.

5. **Alignment**
   - PRD goals are reflected in UX and in epics/stories.
   - Architecture supports the described flows and NFRs.
   - No contradictions between PRD, UX, architecture, and stories.

## Output

- **Ready:** All sections present and aligned; list any minor open points and recommend starting implementation.
- **Not ready:** List missing items and misalignments; suggest concrete next steps (e.g. complete architecture, add stories, fix contradictions).
- If the project uses BMAD and has the implementation-readiness workflow under `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness`, you may point the user there for the full step-by-step flow; otherwise this reference is the workflow.
