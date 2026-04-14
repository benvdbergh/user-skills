# Domain Standards for Specification Quality

Use this reference to enforce industry-grade specification quality beyond template completion.

## 1) Product and Requirement Quality Standards

- Define a **problem statement** and baseline before proposing solutions.
- Express each requirement as testable behavior with acceptance criteria.
- Include explicit **out-of-scope** boundaries to control creep.
- Attach a measurable success metric to every objective (leading and lagging indicators when possible).

## 2) NFR Precision Standards

NFRs must include quantifiable thresholds and context:

- **Performance:** target latency, throughput, concurrency, and measurement scope.
- **Reliability:** availability SLO/SLA target, recovery target, and error budget assumptions.
- **Security:** data classification, authN/authZ expectations, and key compliance requirements.
- **Operability:** observability expectations (logs/metrics/traces), alerting ownership, runbook expectations.

Reject wording without thresholds (for example: "fast", "secure", "scalable").

## 3) Decision Documentation Standards

- Capture key architecture/technology decisions using ADR-style structure:
  - context
  - decision
  - alternatives considered
  - consequences
  - status
- Maintain a short list of unresolved decisions with owner and due milestone.
- Separate facts, assumptions, and open questions.

## 4) Delivery and Risk Standards

- Include dependency map (external teams, systems, compliance, vendors).
- Include implementation phasing with incremental value delivery.
- Maintain a risk register with probability, impact, mitigation, and trigger conditions.
- Add rollout and rollback intent for high-impact changes.

## 5) Scale-Aware Calibration

Apply the right rigor for project scale (see `references/scale-playbooks.md`):

- Startup scale: optimize for speed and learning, but keep measurable outcomes.
- Growth scale: optimize for coordination and reliability as team count and integration points increase.
- Enterprise scale: optimize for governance, compliance, and cross-team interoperability.

## 6) Definition of "Spec Ready"

An artifact is spec-ready when:

1. business objective and target user are explicit,
2. requirements are testable and measurable,
3. NFRs have thresholds,
4. key risks/dependencies are documented,
5. unresolved decisions are tracked with owners,
6. quality gates are attached (see `references/quality-gates.md`).
