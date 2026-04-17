# Value Proposition Canvas (Osterwalder / Strategyzer family)

**When to load:** Designing or refactoring fit between **customer needs** and an **offer**; workshop-style elicitation; mapping pains and gains to product behaviors.

**Primary sources (external):** Strategyzer’s Value Proposition Canvas and *Value Proposition Design* (Osterwalder et al.). Official hub: [Strategyzer — Value Proposition Canvas](https://www.strategyzer.com/canvas/value-proposition-canvas).

## Core idea

Split the canvas into:

1. **Customer Profile**
   - **Jobs to be done** — tasks customers are trying to perform (functional, social, emotional; some descriptions add contextual jobs)
   - **Pains** — obstacles, risks, frustrations, undesired costs
   - **Gains** — outcomes customers want (required, expected, desired, unexpected)

2. **Value Map**
   - **Products & services** — offer components relevant to those jobs
   - **Pain relievers** — how the offer addresses specific pains
   - **Gain creators** — how the offer produces specific gains

**Fit** means traceability: pains ↔ pain relievers, gains ↔ gain creators, jobs ↔ services that make progress on those jobs.

## Agent practices

- **One canvas per segment** (or explicitly mark “multi-segment” risks).
- Prefer **observable pains/gains** (“integration tests take two weeks”) over vague ones (“hard to use”).
- Every pain reliever/gain creator should link to a **mechanism** (what changes in the world).

## Example mapping (illustrative)

| Customer pain | Pain reliever (offer behavior) |
|---------------|----------------------------------|
| Fragmented tools cause handoff errors | Single orchestration layer for task state |
| Long commissioning cycles | Modular rollout without replacing core stack |

## No-gos

- Listing features without mapping to **jobs/pains/gains**
- Claiming “fit” without naming **evidence** (see `organizational-inputs-and-assumptions.md`)

## Pairs with

- `jobs-to-be-done.md` — sharper job definition
- `bain-elements-of-value.md` — classify which gains are table stakes vs differentiated
- `hbr-business-markets-value-propositions.md` — proof for B2B claims

## Further reading

- Strategyzer library: [Value Proposition Canvas — best practices](https://www.strategyzer.com/library/value-proposition-canvas-best-practices) (tactics for testing and facilitation)
