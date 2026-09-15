# Skill escalation boundaries — unit-testing

## Owns

- Unit tests and focused integration/API tests (fast feedback layers).
- TDD workflow, test doubles selection, test smell remediation, level demotion from E2E when appropriate.
- Component contract tests that do not require a full browser journey driver.

## Does not own

- Portfolio/product test strategy, gates, KPIs → `test-strategy`.
- Full browser E2E journeys, traces, Playwright config as suite system → `e2e-testing`.
- Load/chaos/property-based specialty packs → proposed dedicated skills.
- Implementing feature code beyond what tests require → `minimalist-coding` (pair: tests here, design there).
- CI workflow security/governance → `ci-cd-governance`.
- Specs/AC authorship → `specification`.
- Human/agent PR review process → `code-review-skill`.

## Escalate to

| Trigger | Skill |
|---------|--------|
| Suite shape / risk prioritization | `test-strategy` |
| Real browser multi-step journey | `e2e-testing` |
| Pipeline required checks / Actions | `ci-cd-governance` |
| Clean Architecture seams for testability | `minimalist-coding` |
| Unclear expected behavior | `specification` |
| Reviewing a PR’s overall quality | `code-review-skill` |

## Composition

Works beside `minimalist-coding` during implementation; feeds green checks into `ci-cd-governance` gates; defers journey automation to `e2e-testing`.
