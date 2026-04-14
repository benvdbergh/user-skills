# Framework Selection by Scale

Related: `../SKILL.md`, `industry-standards.md`, `integration-boundaries.md`

Pick the lightest framework that preserves decision quality.

## Selection Matrix

| Product scale | Recommended roadmap shape | Prioritization | Runway treatment | Review cadence |
|---|---|---|---|---|
| Single team / early product | Now-Next-Later with quarterly theme check | RICE + qualitative strategy fit | Lightweight enabler lane; monthly debt checkpoint | Bi-weekly to monthly |
| Multi-team product | Quarterly roadmap with release slices | WSJF at cross-team level, RICE inside teams | Explicit enabler slices and dependency map | Monthly with quarterly reset |
| Program / ART-like delivery | PI + 2 forecast horizons | WSJF with Cost of Delay assumptions documented | Architectural runway as first-class capacity allocation | PI cadence (8-12 weeks) |
| Portfolio / multi-product | Portfolio roadmap + product roadmaps | Strategic scoring + WSJF for candidate initiatives | Shared platform runway and capability runway | Quarterly with semi-annual strategy refresh |

## Heuristics

- Use **RICE** when comparing discovery-heavy product bets.
- Use **WSJF** when alignment across many teams and constrained release windows matters.
- Use **Now-Next-Later** when date certainty is low but strategic direction must stay clear.
- Use **PI/portfolio horizons** when governance and cross-team dependencies dominate.
