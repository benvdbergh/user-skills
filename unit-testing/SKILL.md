---
name: unit-testing
description: Writes and reviews fast, isolated unit and focused integration tests using Arrange-Act-Assert, behavior-focused naming, appropriate test doubles, and pyramid placement. Use when the user asks for unit tests, Jest/Vitest/pytest/JUnit coverage, mocking strategy, test smells, TDD red-green-refactor, or moving misplaced E2E/UI assertions down. Does not own browser E2E suites, load/chaos testing, or CI governance.
---

# Unit Testing

## Purpose
This skill maximizes **fast, deterministic feedback** close to the code: pure unit tests by default, focused integration/API tests when real collaborators are required—without testing framework internals or duplicating E2E.

## When to Use
Use this skill when a user asks to:
- write or improve unit tests for functions, domain logic, or components
- apply TDD (red → green → refactor) for a change
- choose mocks/fakes/stubs vs real dependencies
- fix brittle tests coupled to implementation details
- add integration tests for HTTP/DB/queue boundaries
- review whether a test belongs at unit vs integration vs E2E

## Core Outcomes
- Tests name **behavior** and use Arrange-Act-Assert (or Given-When-Then).
- Unit tests avoid network, real DB, clock, and filesystem unless faked.
- Integration tests own real boundary behavior (API status/shape, persistence side effects).
- Coverage prioritizes risk and branches that can hide bugs—not 100% vanity.
- Failures from higher layers get a regression unit/integration test that keeps the bug dead.

## Operating Procedure
1. **Discover project norms.**
   - Runner (Vitest/Jest/pytest/JUnit/Go `testing`/etc.), folder layout, scripts, existing fixtures.
   - Mirror naming and assertion style; do not invent a parallel stack.
2. **Place the test (pyramid).**
   - Pure logic / rules / transforms → **unit**.
   - HTTP handler + DB + auth wiring → **integration** (still this skill’s scope).
   - Multi-page UI journey needing a real browser → escalate to `e2e-testing`.
3. **Design the example.**
   - Happy path + meaningful edges (null/empty/boundary) + failure modes that callers must handle.
   - Prefer DAMP over clever shared abstraction when it obscures the scenario.
4. **Implement.**
   - AAA structure; one logical behavior per test (multiple asserts OK if same behavior).
   - Double only what you must: prefer fakes/in-memory over heavy mocks; never mock the system under test.
   - Deterministic time/randomness via injection or fakes.
5. **Run and tighten.**
   - Ensure tests fail for the right reason (TDD) before green.
   - Remove tests that only assert framework/language behavior or private structure.
6. **Hand off.**
   - If strategy/gates unclear → `test-strategy`.
   - If CI job/required check needed → `ci-cd-governance`.

## Practices (language-agnostic)

### Good unit tests
- Input → output / state change / error for **domain rules**.
- Parsing, scoring, policy, validators, pure mappers.
- Component tests that assert **public contract** (props → rendered roles/text), not CSS trivia—unless the contract *is* the class API of a design-system primitive.

### Reject / rewrite
- Asserting “class exists”, fillable fields, ORM metadata, or config file contents.
- Hitting real third-party APIs in unit tests.
- Snapshot walls that freeze incidental markup without a contract story.
- Duplicating the same scenario at unit and E2E without extra UI risk.

### Integration tests (owned here when thin)
- Request → status/body/side effects with test DB or containers.
- Authz boundaries (401/403 vs success).
- Contract shape checks at the API boundary.
- Prefer demoting validation matrix here instead of E2E.

### TDD loop (when requested)
1. Write failing test for intended behavior.  
2. Minimal code to pass.  
3. Refactor with tests green.  
4. Commit logical chunks via `version-control` when the user wants VCS hygiene.

## Guardrails
- Follow Microsoft-style guidance: readable names, AAA, avoid logic in tests (loops/conditionals that can hide bugs)—see Primary Source Links.
- Do not weaken production design solely to enable mocking; prefer seams (interfaces, injection) already consistent with `minimalist-coding`.
- Do not own Playwright/Cypress journey authorship.
- Do not treat coverage % as the goal; treat **risk coverage** as the goal.
- Match the repo’s license and testing libs; do not add heavy frameworks without ask.

## Required Deliverables
- Tests added/updated with how to run them.
- Note on level placement (unit vs integration) and anything deferred to E2E.
- List of doubles used and why.
- Gaps still needing `test-strategy` or `e2e-testing`.

## Reference Files
- [Skill escalation](references/skill-escalation.md)
- [Prior art & citations](references/prior-art.md)
- [Test smell checklist](references/test-smells.md)

## Primary Source Links
- https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices
- https://martinfowler.com/bliki/TestPyramid.html
- https://martinfowler.com/articles/mocksArentStubs.html
- https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html
- https://github.com/addyosmani/agent-skills/tree/main/skills/test-driven-development (MIT)
- https://github.com/nickperkins/testing-skill (MIT)
- https://github.com/petrkindlmann/qa-skills/tree/main/skills/unit-testing (MIT; Jest/Vitest/pytest patterns inspiration)
