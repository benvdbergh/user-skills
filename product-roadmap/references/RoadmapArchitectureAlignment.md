# Workflow: RoadmapArchitectureAlignment

## Trigger

"Align roadmap with system design."

## Steps

1. Collect roadmap candidates (outcomes, features, release windows).
2. Pull architecture constraints and decisions from `software-architecture`.
3. Create alignment matrix:
   - outcome
   - feature hypothesis
   - architecture dependency/enabler
   - risk if delayed
4. Identify conflict classes:
   - sequence conflict
   - capacity conflict
   - architecture debt risk
5. Resolve by optioning:
   - move feature horizon
   - split feature into thinner slices
   - pull forward enabler
6. Produce revised roadmap with explicit trade-offs.

## Done Criteria

- No critical feature lacks required architectural runway.
- All major dependencies have owners and target horizons.
- Trade-offs and assumptions are documented.
