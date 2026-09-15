# Prior art & citations — test-strategy

Load when justifying recommendations or extending worksheets.

## Canonical concepts

| Source | Use for |
|--------|---------|
| Martin Fowler — [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html) | Cost model; push tests down; GUI E2E as thin second line |
| Google Testing Blog — [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html) | Brittleness/cost of broad E2E; prefer smaller tests |
| Microsoft — [Unit testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices) | Naming, AAA, avoiding logic in tests (language-agnostic habits) |
| Playwright — [Best practices](https://playwright.dev/docs/best-practices) | User-visible behavior, isolation, locators (when strategy touches E2E) |

## Agent-skill corpora (MIT — reuse ideas; vendor only after sidecar review)

| Repo | Notes |
|------|-------|
| [petrkindlmann/qa-skills](https://github.com/petrkindlmann/qa-skills) | Rich `test-strategy` + 50 QA skills; ecosystem-coupled—prefer compile lean first-party skill |
| [jovd83/test-strategy-skill](https://github.com/jovd83/test-strategy-skill) | Auditable strategy.md + strategy.json; part of test-lifecycle chain |
| [nickperkins/testing-skill](https://github.com/nickperkins/testing-skill) | Pyramid flowchart; good complementary vendor candidate for “level selection” |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | `test-driven-development`, `code-review-and-quality` — strong engineering norms |

## Vocabulary (optional)

ISTQB CTFL-style level/type terms are fine for cross-team clarity; keep agent guidance practical and stack-specific rather than certification-heavy.
