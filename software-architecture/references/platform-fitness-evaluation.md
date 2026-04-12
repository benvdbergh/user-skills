# Platform and Product Fitness Evaluation

**Goal:** Assess whether a system, platform, or product is **fit for its business problem**—not whether it is maximally sophisticated. Prefer **evidence-backed** judgments and explicit **risk of irreversible constraints**.

**When to load this reference**

- User asks for a **platform scorecard**, **architecture fitness review**, **product readiness assessment**, or **buy vs build / vendor evaluation** with technical depth.
- For **deep dives on API design, data models, SemVer vs HTTP versioning, and contract-first practices**, use **`SKILL.md`** *Functional architecture topic map* and **`references/functional-*.md`** topic files.
- User wants **non-functional quality gates** beyond PRD/UX alignment (operability, security-by-design, delivery maturity, data/events posture).
- After **ResearchTopology** or **create-architecture**, to stress-test a candidate design against “day-2” reality (operations, migration, governance).

**Your role:** Facilitate structured scoring, cite **observable signals** (metrics, artifacts, demos), separate **today vs trajectory vs hard constraints**, and avoid wish-casting—use an **evidence confidence** label per major claim.

**Agent execution:** See **`SKILL.md`** → *Agent workflows* → *Platform / product fitness evaluation*.

---

## Guiding principle

**Fitness beats cleverness.** Reward designs that stay **as simple as the problem allows** while meeting NFRs, integration reality, and evolution needs. Escalate complexity only when constraints (scale, tenancy, compliance, edge deployment) demand it.

This aligns with lean architecture and with cloud/architecture review lenses that emphasize **outcomes and operability**, not checklist theater.

---

## How this maps to widely used industry frames

Use these maps to **borrow vocabulary and practices** without treating any single framework as law.

| Concern cluster | Useful external lenses |
|----------------|------------------------|
| Operability, reliability, performance, cost, security | [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) (pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability) |
| Delivery and stability | [DORA](https://dora.dev/) software delivery metrics (throughput + stability; model evolved—see current definitions on dora.dev) |
| Production operations | [Google SRE](https://sre.google/sre-book/monitoring-distributed-systems/) (golden signals; SLO/error budgets in the SRE books) |
| “Cloud native” shape | [CNCF cloud native definition](https://github.com/cncf/toc/blob/main/DEFINITION.md) (loose coupling; secure, resilient, manageable, sustainable, observable; typical tech includes containers, declarative APIs, automation) |
| Secure SDLC maturity | [OWASP SAMM](https://owasp.org/www-project-samm/) (governance/design/implementation/verification/ops); [NIST SSDF SP 800-218](https://csrc.nist.gov/projects/ssdf) (prepare, protect software, produce well-secured software, respond to vulnerabilities) |
| Incremental modernization | [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html) (incremental replacement behind a façade) |
| API contract discipline | [Semantic Versioning](https://semver.org/) (compatibility expectations); [consumer-driven contracts](https://docs.pact.io/) (e.g. Pact—consumers define expectations, providers verify) |
| Resilience mechanics | *Release It!* stability patterns (e.g. circuit breaker, bulkhead—widely documented; see [Pragmatic Bookshelf](https://pragprog.com/titles/mnee2/release-it-second-edition/)) |

---

## Evaluation dimensions (topics and good practices)

For each dimension below, capture **what “good” looks like**, **artifacts**, **signals/metrics**, and **gate questions**. Adapt weighting to the product (e.g. edge-heavy vs central SaaS).

### 1. Productizable platform DNA

- **Topics:** modularity, composability, extension points, domain clarity, multi-tenancy.
- **Good practices:** clear **module boundaries** and **explicit contracts** (APIs/events) over ad hoc shared databases; **extension models** (plugins, hooks, policy) that survive upgrades; **ubiquitous language** and bounded contexts per **DDD** (delegate modeling detail to **`minimalist-coding`** / **`enterprise-architecture`** as needed).
- **Tenancy:** explicit **isolation** (data, credentials, noisy-neighbor controls), **tenant-aware** authz and observability, **quotas** where relevant.
- **Gates:** Are boundaries documented? Is there a supported extension path without forking core? Is tenancy strategy explicit?

### 2. Architectural fitness and evolution speed

- **Topics:** architectural runway, versioning, compatibility, migrations.
- **Good practices:** **semantic versioning** with a published **compatibility policy**; **deprecation** windows; **consumer-driven contract tests** or equivalent for critical integrations; **schema migration** strategy (expand/contract, backward-compatible phases); automation for repeatable upgrades.
- **Signals:** lead time for change, frequency of breaking changes, regression rates, upgrade downtime windows.
- **Gates:** Is backward compatibility testable? Are migrations automated and reversible enough for your RPO/RTO story?

### 3. Cloud-native execution (including non-cloud deployments)

- **Topics:** stateless app tiers, horizontal scale, resilience, elasticity, hybrid/edge.
- **Good practices (CNCF-aligned):** **containers** and **declarative** deployment where appropriate; **state externalized**; **autoscaling** hooks for compute and queues; resilience: **timeouts**, **retries with limits**, **circuit breakers**, **bulkheads**, **backpressure**, graceful degradation (*Release It!* patterns).
- **Hybrid/edge:** crisp split between **edge/runtime** and **central** services; deterministic rollout across footprints.
- **Gates:** Can you scale out a stateless tier? Are failure modes bounded (no cascade)?

### 4. Developer experience and delivery maturity

- **Topics:** CI/CD, release strategy, environments, testing, local dev.
- **Good practices:** pipelines with **build, test, SAST/DAST** (as appropriate), **signed artifacts** and **SBOM** where supply-chain risk matters; **blue/green**, **canary**, **feature flags** for controlled rollout; **IaC**; ephemeral environments; test pyramid with **contract** and **integration** tests; low **flaky** test tolerance.
- **Metrics:** [DORA](https://dora.dev/guides/dora-metrics-four-keys) style measures—check the **current** metric definitions on dora.dev (the research program has refined metrics over time).
- **Gates:** Is delivery automated end-to-end? Can a team deploy independently where required?

### 5. Data, events, and operational truth

- **Topics:** event-first integration, ownership, analytics, consistency.
- **Good practices:** **schema-governed** events (registry/versioning); **domain ownership** of data; idempotent consumers; clear stance on **consistency** (strong vs eventual), **sagas/workflows**, reconciliation jobs; lineage and quality checks for data products.
- **Gates:** Is there an event/API catalog? Who owns each dataset? Are outbox/inbox or equivalent patterns used where needed?

### 6. Operability and SRE readiness

- **Topics:** observability, runbooks, performance, availability, upgrades in production.
- **Good practices:** **structured logs**, **metrics**, **traces**, **correlation IDs**; monitor using **golden signals** (latency, traffic, errors, saturation per [Google SRE monitoring chapter](https://sre.google/sre-book/monitoring-distributed-systems/)); complement with **RED** (rate, errors, duration) for services and **USE** (utilization, saturation, errors) for resources; SLOs and error budgets where appropriate; load testing and **performance budgets**; DR targets (**RPO/RTO**) with tested failover; **rolling** upgrades and mixed-version compatibility if needed.
- **Signals:** incident rate, time to restore, toil, on-call load, runbook quality.
- **Gates:** Can on-call answer “what broke?” quickly? Are DR and capacity validated on evidence, not slides?

### 7. Security and compliance by construction

- **Topics:** identity, data protection, supply chain, secure SDLC, audit.
- **Good practices:** standards-based **OIDC/OAuth2**; fine-grained **authz** (RBAC/ABAC as fit); **secrets** management; encryption in transit/at rest; **SBOM**, signed builds, dependency and CVE **response SLAs**; **threat modeling** for sensitive flows; policy-as-code where it helps; immutable **audit** trails for admin actions.
- **Maturity framing:** [OWASP SAMM](https://owaspsamm.org/) and [NIST SSDF](https://csrc.nist.gov/projects/ssdf) for gap analysis vs “checklist complete.”
- **Gates:** Are security tests in CI? Is there a defined vulnerability response? Are tenant/admin actions auditable?

### 8. Technology ecosystem and talent

- **Topics:** hiring pool, learning curve, lock-in, partner ecosystem.
- **Good practices:** mainstream languages with **good tooling**; clear **golden paths** for new engineers; portability or **exit strategy** for critical vendor services; integrations/marketplaces where they reduce bespoke glue.
- **Gates:** Can you staff and onboard at the required rate? Is lock-in conscious and documented?

### 9. Governance, ownership, and economics

- **Topics:** platform-as-product, API standards, FinOps, reuse.
- **Good practices:** explicit **product owner**, roadmap, customers, and **SLOs** for internal platforms; **API standards** with reviews; **unit economics** (cost per tenant, order, transaction); guardrails against uncontrolled forks and snowflake deployments.
- **Signals:** adoption, reuse vs duplicate services, cost drift.
- **Gates:** Who is accountable? Are standards enforced or optional in name only?

### 10. Integration posture and boundary strategy

- **Topics:** northbound/southbound interfaces, protocol diversity, coexistence.
- **Good practices:** stable **integration contracts** for adjacent systems; intentional use of APIs, events, files/EDI; **backward compatibility** during ecosystem rollouts; **strangler**-friendly seams ([Martin Fowler](https://martinfowler.com/bliki/StranglerFigApplication.html)).
- **Gates:** Is the system a coupling magnet? Are integration styles governed?

### 11. Migration viability and transition risk

- **Topics:** incremental adoption, coexistence, cutover, concentration risk.
- **Good practices:** slice migration by **capability or geography**; **dual-write**/event bridge patterns only with a clear **exit** plan; cutover playbooks with verification and rollback; avoid single points of failure (one team, one vendor, one region, one DB) where the business requires resilience.
- **Gates:** Are quarterly increments realistic? Is rollback credible?

---

## Non-negotiable gates (customize)

Pick **8–12 pass/fail** items appropriate to your context. Examples:

- Upgrade path with **low/no downtime** for the critical path.
- **Contract versioning** and backward-compatibility discipline (with tests).
- **Automated delivery** with security scanning and **artifact provenance** (signing/SBOM as required).
- **Tenancy** model defined (or explicit waiver with risk acceptance).
- **Observability** baseline: logs/metrics/traces + correlation.
- **Event/API** governance for cross-team integration.
- **Modern identity** (OIDC/OAuth2) and tenant-aware authorization.
- **Modular boundaries** and a supported **extension** model.

Document **waivers** with owner and expiry.

---

## Scoring method (keep it honest)

For **each dimension** (or each sub-topic if needed), score **1–5** on:

1. **Capability maturity (today)** — demonstrated by artifacts and production behavior, not intent.
2. **Trajectory (12–24 months)** — realistic given funding and organizational capacity.
3. **Constraint risk** — how much is **hard to unwind** (core data model, tenancy, deep vendor coupling).

Add **evidence confidence** per dimension: **High / Medium / Low** (forces separation of known facts vs assumptions).

Optional: map scores to **RAG** (red/amber/green) for executive views; keep numeric detail in an appendix.

---

## Recommended output: platform scorecard

Produce a **single page per candidate** (system, vendor product, or architecture option):

1. **One-paragraph thesis:** what the option is optimized for.
2. **Top strengths (5)** with **evidence** (link, metric, artifact).
3. **Top risks (5)** with **evidence** and **constraint risk** callouts.
4. **Non-negotiables:** pass/fail table with waivers.
5. **Investment view:** what it takes to reach **target maturity** in ~18 months (rough T-shirt sizing is OK if labeled).
6. **Recommended role** in target landscape (e.g. system of record, execution layer, integration hub, edge runtime, **not recommended**).

---

## Further reading (stable URLs)

- DORA: https://dora.dev/
- AWS Well-Architected: https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
- Google SRE Book (monitoring chapter): https://sre.google/sre-book/monitoring-distributed-systems/
- CNCF cloud native definition: https://github.com/cncf/toc/blob/main/DEFINITION.md
- OWASP SAMM: https://owasp.org/www-project-samm/
- NIST SSDF: https://csrc.nist.gov/projects/ssdf
- Strangler Fig: https://martinfowler.com/bliki/StranglerFigApplication.html
- Pact (consumer-driven contracts): https://docs.pact.io/
