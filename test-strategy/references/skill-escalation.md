# Skill escalation boundaries — test-strategy

## Owns

- Risk-based test strategy: level selection, pyramid health, entry/exit criteria, quality gates, KPIs.
- Deciding *whether* unit / integration / E2E / specialty lanes are warranted for a change or product.
- Tool *class* recommendations with rationale (not deep framework tutorials).

## Does not own

- Authoring unit/integration test code → `unit-testing` (and `minimalist-coding` for production code under test).
- Authoring browser E2E suites, locators, traces → `e2e-testing`.
- Load/stress/soak scripts and performance budgets → proposed `performance-testing` (or DevOps until added).
- Chaos/fault-injection experiments → proposed `chaos-engineering` (or Architect/SRE until added).
- CI/CD workflow YAML, required checks, permissions → `ci-cd-governance`.
- Acceptance criteria and PRDs → `specification`; backlog shards → `project-planning`.
- Architecture fitness / NFR scorecards as design authority → `software-architecture`.
- PR critique process → `code-review-skill` (vendor).

## Escalate to

| Trigger | Skill |
|---------|--------|
| Write or refactor unit/integration tests | `unit-testing` |
| Write Playwright/Cypress journey tests | `e2e-testing` |
| Wire gates into GitHub Actions / branch protection | `ci-cd-governance` |
| Missing measurable requirements / DoD | `specification` |
| NFR or topology decisions blocking testability | `software-architecture` |
| Implement production fix while testing | `minimalist-coding` |
| Review PR for quality/security lenses | `code-review-skill` |
| Skill catalog / vendor embed | `skill-set` |

## Composition

`specification` and `project-planning` define *what* ships; this skill defines *how confidence is earned*; `unit-testing` / `e2e-testing` implement suites; `ci-cd-governance` enforces gates in the pipeline.
