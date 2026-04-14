# Scale Playbooks for Specification Work

Choose one primary scale profile before drafting, then adapt as needed.

## Startup Scale (0-2 teams, low compliance, high uncertainty)

**Primary goal:** speed to validated learning.

- Keep scope thin and tightly aligned to one outcome metric.
- Prefer a single milestone plan with clear kill/iterate criteria.
- Keep architecture notes lightweight but track irreversible decisions.
- Minimum artifacts: concise spec, slim PRD, short plan, pragmatic constitution.

## Growth Scale (3-10 teams, rising integration complexity)

**Primary goal:** coordination and reliability without heavy bureaucracy.

- Use requirement IDs and traceability sections consistently.
- Add integration dependencies and ownership matrix.
- Add explicit NFR thresholds for reliability/performance/security.
- Require phased rollout with observability and rollback expectations.

## Enterprise Scale (10+ teams, regulated or high criticality domains)

**Primary goal:** governed delivery with cross-team interoperability.

- Require formal risk register, compliance implications, and auditability notes.
- Require architecture decision mapping (accepted, pending, deferred).
- Require quality gates at stage boundaries (spec ready, build ready, release ready).
- Include exception management path (who can approve a temporary policy waiver).

## Routing Guidance

When scale is unclear:

1. default to Growth scale,
2. ask one clarifying question on team size/risk/compliance,
3. adjust rigor upward or downward.

## Handoff Impact by Scale

- Startup: handoff to `project-planning` can be lightweight and iterative.
- Growth: handoff to `project-planning` should preserve dependency and risk detail.
- Enterprise: handoff should include governance evidence and decision traceability for `software-architecture` and planning workflows.
