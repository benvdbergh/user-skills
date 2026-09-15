---
name: e2e-testing
description: Designs and implements resilient end-to-end tests focused on critical user journeys, preferring Playwright with accessible locators, isolation, web-first assertions, traces, and CI sharding. Use when the user asks for E2E tests, Playwright or Cypress suites, browser journey coverage, flake reduction, visual/a11y checks in E2E, or demoting misplaced E2E to lower layers. Does not own unit-test authoring, load testing, or CI governance policy.
---

# E2E Testing

## Purpose
This skill keeps end-to-end coverage **thin, journey-shaped, and trustworthy**: real browser/runtime confidence for paths that cannot be proven cheaper lower in the pyramid—without ice-cream-cone suites.

## When to Use
Use this skill when a user asks to:
- add or refactor Playwright (default) or Cypress E2E tests
- choose which flows deserve E2E vs unit/integration
- fix flaky browser tests (waits, isolation, selectors)
- set up auth storage state, fixtures, page objects/helpers
- configure traces, HTML reports, sharding for CI
- add targeted accessibility (axe) or visual checks on journeys

Do **not** use as the primary skill for pure API contract tests, unit tests, k6 load tests, or GitHub Actions policy—escalate those.

## Core Outcomes
- Journey tests named as user goals (“user can complete checkout”).
- Locators prefer role/label/text/test-id over brittle CSS/XPath.
- Isolated tests (own storage/cookies/data); shared auth via storage state when appropriate.
- Deterministic waits via web-first assertions—no arbitrary sleeps.
- Failures debuggable via trace viewer on retry; CI cost controlled via smoke vs full + shards.

## Operating Procedure
1. **Confirm E2E is justified.**
   - Requires real UI/runtime, multi-step state, or cross-page behavior **and** is not already covered adequately at API/integration.
   - Prefer **one happy-path journey** per flow; edge/validation cases stay at lower levels ([Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html); Google Testing Blog guidance on limiting E2E).
2. **Adapt to the repo.**
   - Detect existing Playwright/Cypress config, `e2e/` / `tests/` layout, scripts, and CI jobs.
   - Mirror conventions; only bootstrap Playwright when none exists and the user wants browser E2E.
3. **Map the journey.**
   - Preconditions, actors, steps, observable outcomes, data seed needs, environments (local/preview/staging).
4. **Implement resiliently (Playwright-first).**
   - `getByRole` / `getByLabel` / `getByText` / `getByTestId` over structural selectors ([Playwright best practices](https://playwright.dev/docs/best-practices)).
   - `await expect(...).toBeVisible()` (web-first)—never `expect(await locator.isVisible()).toBe(true)` without waiting semantics.
   - Isolate: `beforeEach` setup or project dependency with **storageState**; avoid test order coupling.
   - Mock only **third-party** dependencies you do not control (`page.route`); keep first-party paths real unless strategy says otherwise.
5. **Stabilize and observe.**
   - On failure: local `--debug` / UI mode; on CI: trace on first retry, HTML report—not video-only archaeology.
   - Quarantine only with ticket + owner; delete or demote tests that never catch real bugs.
6. **Wire CI proportionally.**
   - PR: smoke shard (Chromium); merge/nightly: fuller browsers/devices as risk warrants.
   - Install only needed browsers on CI; use Linux runners; shard when wall-clock hurts (`--shard=k/n`).
   - Hand pipeline policy (permissions, required checks) to `ci-cd-governance`.

## Playwright Patterns (default)

### Locator priority
1. Role + accessible name  
2. Label / placeholder / text  
3. `data-testid` (explicit test contract)  
4. CSS/XPath only as last resort  

### Auth
- Prefer setup project that writes `storageState` once; reuse across tests.
- Avoid full UI login in every test unless login itself is the journey under test.

### Assertions
- Assert **user-visible** outcomes (URL, heading, toast, order ID)—not internal class names or Redux state.
- Soft assertions only when collecting multiple independent UI checks in one journey.

### Anti-patterns (reject)
- E2E for pure API/validation permutations already covered in integration tests.
- `page.waitForTimeout(...)` as synchronization.
- Coupled tests that depend on prior test side effects.
- Asserting third-party site content.
- Record-playback dumps committed without cleanup/abstraction.

## Cypress note
If the repo is Cypress-first, keep Cypress but apply the same journey/isolation/selector principles (accessible queries, intercept third parties, screenshots/videos judiciously). Prefer not introducing a second E2E framework without explicit user decision.

## Guardrails
- Default to **fewer** E2E tests with higher signal; demote downward when possible (`test-strategy`, `unit-testing`).
- Never commit secrets; use env/CI secrets for credentials.
- Do not hit production with mutating E2E unless the user explicitly owns that risk and environment.
- Flaky = broken: fix, demote, or delete—do not grow flake debt.
- Visual snapshots require stable OS/browser in CI; treat as optional specialty lane.

## Required Deliverables
- Journey list covered (and explicitly deferred to lower layers).
- Spec files + helpers/fixtures following repo conventions.
- How to run locally and in CI (commands).
- Trace/report guidance for failures.
- Notes for `ci-cd-governance` if new required checks are introduced.

## Reference Files
- [Skill escalation](references/skill-escalation.md)
- [Prior art & citations](references/prior-art.md)
- [Flake triage checklist](references/flake-triage.md)

## Primary Source Links
- https://playwright.dev/docs/best-practices
- https://playwright.dev/docs/auth
- https://playwright.dev/docs/trace-viewer
- https://playwright.dev/docs/test-sharding
- https://playwright.dev/agent-cli/skills
- https://martinfowler.com/bliki/TestPyramid.html
- https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html
- https://docs.cypress.io/guides/references/best-practices
- https://github.com/nickperkins/testing-skill (MIT; journey vs feature framing)
