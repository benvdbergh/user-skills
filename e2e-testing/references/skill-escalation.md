# Skill escalation boundaries — e2e-testing

## Owns

- Browser/end-to-end journey tests (Playwright preferred; Cypress when repo-standard).
- E2E fixture/auth patterns, locator strategy, flake triage for UI tests, traces/reports.
- Smoke vs full suite split recommendations for CI *execution* (not workflow governance).

## Does not own

- Whether E2E is warranted / pyramid policy → `test-strategy`.
- Unit and API/integration test implementation → `unit-testing`.
- Performance/load (k6 etc.) → proposed `performance-testing`.
- GitHub Actions permissions, reusable workflows, required-check policy → `ci-cd-governance`.
- Product acceptance criteria authorship → `specification`.
- UX design of flows under test → `ux-designer` / `ui-ux-pro-max`.
- Production feature implementation → `minimalist-coding`.
- PR review rubric → `code-review-skill`.

## Escalate to

| Trigger | Skill |
|---------|--------|
| “Should this be E2E at all?” / suite shape | `test-strategy` |
| Logic/API coverage instead of browser | `unit-testing` |
| Pipeline YAML / branch protection | `ci-cd-governance` |
| Ambiguous product behavior | `specification` |
| Accessibility design system issues | `ux-designer` / `ui-styling` |
| Fix application bug found by E2E | `minimalist-coding` |
| Embed upstream Playwright CLI skill pack | `skill-set` + vendor workflow |

## Composition

`test-strategy` selects journeys; this skill automates them; `ci-cd-governance` makes them merge gates without over-privileging workflows.
