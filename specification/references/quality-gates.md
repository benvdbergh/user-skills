# Specification Quality Gates

Use these gates to decide readiness, not just completeness.

## Gate 1: Spec Ready

Criteria:

- Problem statement, goals, and success metrics are measurable.
- Functional and non-functional requirements are testable.
- Scope and out-of-scope boundaries are explicit.
- Risks, dependencies, and assumptions are documented.

Fail conditions:

- Placeholder language remains.
- NFRs are vague.
- No clear owner for unresolved decisions.

## Gate 2: Build Ready

Criteria:

- Implementation phases are defined with sequencing rationale.
- Architecture-impacting decisions are resolved or explicitly escalated.
- Testing strategy aligns with quality/risk level.
- Rollout and rollback strategy exists for high-impact changes.

Fail conditions:

- Plan has no dependency ordering.
- Architecture assumptions are implicit and undocumented.
- Testing strategy does not map to acceptance criteria.

## Gate 3: Release Ready (Policy Intent)

Criteria:

- Constitution constraints are reflected in implementation approach.
- Operational readiness requirements (observability, runbooks, ownership) are captured.
- Compliance/security checks are mapped when relevant.

Fail conditions:

- Guardrails exist but are unenforced.
- Exception process is undefined.
- No evidence path for governance in regulated contexts.

## Scale Calibration

- Startup: keep gates lightweight but still measurable.
- Growth: enforce all three gates with practical evidence.
- Enterprise: require auditable evidence per gate.
