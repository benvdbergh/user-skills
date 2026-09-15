# Worksheets — test-strategy

## Risk scoring

Score each feature/journey: **Impact (1–5) × Likelihood (1–5)**.

| Band | Score | Depth |
|------|-------|-------|
| CRITICAL | 15–25 | Unit + integration/contract + E2E journey + monitoring; consider perf/security |
| HIGH | 10–14 | Unit + integration + selective E2E |
| MEDIUM | 5–9 | Unit + happy-path integration; E2E only if UI-critical |
| LOW | 1–4 | Light unit or manual/exploratory; skip heavy automation |

## Pyramid snapshot

| Level | Current count | % | Target % | Notes |
|-------|---------------|---|----------|-------|
| Unit | | | 70–80 | |
| Integration / API / contract | | | 15–20 | |
| E2E | | | 5–10 | |
| CI duration (PR) | | | <15 min typical | |
| Flake rate | | | <2% | |

## Gate checklist (minimum)

- [ ] PR: unit + lint/SAST; coverage not regressing on touched risk code
- [ ] Merge: smoke E2E or preview checks green
- [ ] Deploy: staging critical journeys + rollback plan
- [ ] Nightly: fuller E2E / visual / perf as justified
