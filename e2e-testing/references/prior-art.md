# Prior art & citations — e2e-testing

| Source | License / notes | Use for |
|--------|-----------------|--------|
| [Playwright Best Practices](https://playwright.dev/docs/best-practices) | Vendor docs | Isolation, locators, web-first asserts, CI |
| [Playwright agent skills](https://playwright.dev/agent-cli/skills) | Vendor | Optional CLI skill install for agents |
| [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices) | Vendor docs | When repo is Cypress-first |
| Fowler [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html) | Public essay | Keep E2E thin |
| Google Testing Blog E2E essay | Public | Cost/brittleness arguments |
| [nickperkins/testing-skill](https://github.com/nickperkins/testing-skill) | MIT | Journey vs feature; demotion rules |
| [petrkindlmann/qa-skills](https://github.com/petrkindlmann/qa-skills) `playwright-automation` | MIT | Optional vendor later; heavy pack |
| [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill) | Check repo | Ad-hoc browser automation—not a suite strategy substitute |
| [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) e2e-testing | Check license | Inspiration only unless license clear |

**Author vs vendor:** Prefer first-party `e2e-testing` aligned to user-skills escalation. Vendor Playwright CLI skills as optional tooling sidecars; do not replace this skill with a /tmp script runner.
