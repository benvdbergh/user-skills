---
name: test-strategy
description: Designs risk-based test strategies across unit, integration, E2E, and specialized lanes (API, performance, accessibility, chaos) with pyramid health, entry/exit criteria, quality gates, and measurable KPIs. Use when the user asks for a test strategy, QA strategy, testing approach, test pyramid rebalance, release quality gates, or where to put coverage for a feature or system. Does not own writing individual unit/E2E scripts or CI workflow YAML.
---

# Test Strategy

## Purpose
This skill produces a practical, risk-based test strategy so teams know **what** to test, **at which level**, **with which gates**, and **how done looks**—before multiplying brittle suite mass.

## When to Use
Use this skill when a user asks to:
- design or refresh a test / QA strategy for a product, service, or major change
- diagnose an inverted pyramid (ice-cream cone) or missing integration middle
- map features to risk and choose automation depth
- define entry/exit criteria and PR/merge/deploy/nightly quality gates
- pick tool classes (unit runner, E2E, load) with rationale—not tool evangelism
- set measurable quality KPIs (escape rate, flakiness, CI duration, pyramid ratio)

Escalate to `unit-testing` / `e2e-testing` (or proposed performance/chaos skills) once strategy decisions are made and implementation begins.

## Core Outcomes
- Risk-ordered coverage plan (critical journeys and failure modes first).
- Explicit level map: unit / integration (incl. contract) / E2E / optional specialty lanes.
- Target pyramid ratios and a rebalance plan if current shape is unhealthy.
- Entry/exit criteria and enforceable quality gates.
- KPI set with targets and review cadence.
- Clear ownership handoffs to coding, E2E, CI/CD, and architecture skills.

## Operating Procedure
1. **Discover context.**
   - Product type, critical user journeys, release cadence, compliance constraints.
   - Current suite shape: counts (or estimates) per level, CI wall-clock, known flake rate, recent production escapes.
   - Team capacity and existing frameworks already in the repo.
2. **Inventory risk.**
   - Score Impact × Likelihood for major features / change surfaces (1–5 each).
   - Band CRITICAL / HIGH / MEDIUM / LOW; allocate depth accordingly.
3. **Choose levels and types (not tools first).**
   - Default: many fast unit, moderate integration/API/contract, few journey E2E.
   - Add performance, accessibility, visual, security, or chaos lanes only where risk justifies cost.
4. **Diagnose pyramid health.**
   - Healthy: ~70–80% unit, ~15–20% integration, ~5–10% E2E (tune to product).
   - Ice-cream cone → freeze E2E growth, demote logic tests downward, require unit on business-logic PRs.
   - Hourglass → invest in integration/contract infrastructure.
5. **Define gates and exit criteria.**
   - PR / merge / deploy / nightly gates with pass/fail thresholds (not click-through theater).
   - Per-level entry/exit; release exit includes smoke + monitoring bake window.
6. **Instrument KPIs.**
   - Escape rate, flakiness, pyramid ratio, CI duration, MTTR for P0/P1—trend over absolutes.
7. **Deliver artifacts.**
   - `test-strategy.md` (human) and optional machine-readable summary (JSON/YAML) when the user wants automation handoff.
   - Explicit escalations: what `unit-testing`, `e2e-testing`, `ci-cd-governance`, and architecture own next.

## Strategy Skeleton (adapt depth to team maturity)
1. Scope & objectives (in/out of scope; 3–5 measurable goals).
2. Risk matrix (features → bands → required depth).
3. Levels & types table (what / owner / framework class / frequency).
4. Pyramid current vs target + rebalance actions.
5. Environments & test data (local / CI / staging / prod smoke).
6. Tool rationale (weighted fit—not a shopping list).
7. Entry/exit criteria per level + release.
8. Quality gates (PR, merge, deploy, nightly).
9. KPIs & review cadence.
10. Phased rollout (foundation → coverage → gates → optimize).
11. Revision triggers (incident, new domain, quarterly).

### Maturity calibration
| Maturity | Emphasis |
|----------|----------|
| Startup | Unit + handful of critical E2E; skip heavy metrics until CI is reliable |
| Growing | Full pyramid targets, flake thresholds, PR gates, risk matrix |
| Established | SLA-backed gates, contract/chaos/perf lanes, formal quarterly review |

## Guardrails
- Prefer **pushing tests down** the pyramid; E2E must justify real UI/runtime necessity ([Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)).
- Prefer **risk over coverage vanity**; reject blanket 100% line-coverage goals.
- Do not invent tooling mandates that ignore the repo’s existing stack—adapt first.
- Do not write large suites under this skill; produce strategy and hand off implementation.
- Flaky tests must be fixed or quarantined with root-cause notes—never silently ignored.
- High-level failure ⇒ add/fix a lower-level test that keeps the bug dead (Fowler second-line defense).
- Strategy is a living document; require named owner and review triggers.

## Required Deliverables
- Risk-banded feature/journey list with intended test depth.
- Level map and target pyramid ratios (or justified deviation).
- Gate definitions with concrete thresholds.
- KPI table (metric, definition, target, cadence).
- Escalation notes to implementation skills and `ci-cd-governance` for pipeline wiring.

## Reference Files
- [Skill escalation](references/skill-escalation.md)
- [Prior art & citations](references/prior-art.md)
- [Risk and pyramid worksheets](references/worksheets.md)

## Primary Source Links
- https://martinfowler.com/bliki/TestPyramid.html
- https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html
- https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices
- https://playwright.dev/docs/best-practices
- https://github.com/petrkindlmann/qa-skills (MIT; inspiration for multi-lane strategy structure—do not vendor wholesale without sidecar review)
- https://github.com/jovd83/test-strategy-skill (MIT; structured strategy.md + strategy.json patterns)
- https://github.com/nickperkins/testing-skill (MIT; pyramid decision flowchart)
