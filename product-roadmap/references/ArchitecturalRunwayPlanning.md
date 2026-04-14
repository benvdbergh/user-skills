# Workflow: ArchitecturalRunwayPlanning

## Trigger

"How do we maintain architectural runway across releases?"

## Steps

1. Identify upcoming outcome/feature horizons.
2. For each horizon, identify required runway items:
   - platform enablers
   - architectural debt retirement
   - security/reliability foundations
3. Classify runway item urgency:
   - required before feature
   - required in parallel
   - deferrable with risk
4. Reserve explicit capacity for runway items in each release.
5. Add runway checkpoints to roadmap review cadence.
6. Track runway burn-down using `assets/architectural-runway-register-template.md`.

## Done Criteria

- Each release has explicit runway allocation.
- Risks of delayed runway are visible and owned.
- Feature promises are not detached from technical reality.
