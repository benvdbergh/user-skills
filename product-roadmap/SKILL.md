---
name: product-roadmap
description: >-
  Creates and evolves outcome-oriented product roadmaps across horizons, aligning product vision, architecture strategy, feature sequencing, release intent, and architectural runway. Use when creating a high-level roadmap, aligning roadmap and system design, deciding what to build next, placing features into releases, maintaining architectural runway, or replanning after strategy shifts.
license: MIT
metadata:
  author: PAI
  version: 1.0.0
---

# product-roadmap

Product roadmap and portfolio-planning skill for bigger-scale planning than sprint-level execution. It provides reusable frameworks and decision workflows for linking product vision to roadmap horizons, release slices, and architecture runway while keeping delivery adaptable.

## Scope and Positioning

- **Owns**
  - Vision-to-roadmap translation at product, program, and portfolio horizons.
  - Feature and enabler sequencing across releases.
  - Architectural runway planning and trade-off framing across horizons.
  - Roadmap re-positioning when strategy, market, or architecture assumptions change.
- **Does not own**
  - Story/task decomposition and backlog sharding (use `project-planning`).
  - Deep technical topology/system design decisions (use `software-architecture`).
  - SemVer/release automation/changelog governance (use `release-versioning`).
  - Git/version history management for PAI files (use `version-control`).

## Mandatory Behaviors

1. Start with a **clear product vision and outcomes** before feature commitments.
2. Keep roadmaps **outcome-first** and use features as hypotheses to reach outcomes.
3. Always show at least two planning layers: **product outcomes** and **architecture runway/enablers**.
4. Distinguish **commitments** from **forecasts/options** in each horizon.
5. Make dependency and risk impact explicit whenever sequencing or repositioning changes.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **VisionToRoadmap** | create high-level roadmap, roadmap from vision, portfolio roadmap | `references/VisionToRoadmap.md` |
| **RoadmapArchitectureAlignment** | align roadmap with architecture, align roadmap with system design | `references/RoadmapArchitectureAlignment.md` |
| **FeatureReleaseSequencing** | what to build next, what release should this feature be in, release planning | `references/FeatureReleaseSequencing.md` |
| **ArchitecturalRunwayPlanning** | maintain architectural runway, position features with runway constraints | `references/ArchitecturalRunwayPlanning.md` |
| **RoadmapRepositioning** | adjust roadmap, replan after strategy shift, estimate roadmap impact | `references/RoadmapRepositioning.md` |

## Topic Map (Load as Needed)

- `references/industry-standards.md` — standards and practices synthesized from SAFe, product roadmapping, and prioritization frameworks.
- `references/framework-selection-by-scale.md` — technique selection by scale and uncertainty profile.
- `references/skill-escalation.md` — composition boundaries with nearby planning and architecture skills.

## Core Framework Stack

Use these together, not as one-size-fits-all:

1. **North Star + Outcome Horizon** (vision, goals, metrics)
2. **Roadmap Shape** (Now-Next-Later, quarterly horizon, or PI/portfolio horizons)
3. **Prioritization Method** (WSJF, RICE, or strategic scoring)
4. **Runway Layer** (enablers/architecture debt/security/platform evolution)
5. **Commitment Policy** (committed vs forecasted items, with explicit confidence)

## Execution Loop

1. Define product intent: vision, outcomes, non-negotiables, constraints.
2. Select a roadmap shape and prioritization method for the current scale.
3. Sequence outcomes, features, and enablers into release horizons.
4. Add architectural runway items that must precede or accompany feature delivery.
5. Stress-test for capacity, dependencies, risk, and confidence.
6. Publish roadmap view with clear commitment levels and review cadence.
7. Reposition as evidence changes; log assumptions invalidated and impact.

## Outputs

When applicable, produce:

- A high-level roadmap with explicit horizons and confidence labels.
- Release-level feature/enabler slices and sequencing rationale.
- Architectural runway register (enabler intent, due-by horizon, risk if delayed).
- Repositioning impact note (scope, schedule confidence, dependency changes).

Use templates in:

- `assets/high-level-roadmap-template.md`
- `assets/release-slice-template.md`
- `assets/architectural-runway-register-template.md`
- `assets/roadmap-repositioning-impact-template.md`

## Integrations

- **`project-planning`**: consume roadmap outcomes and convert into epics/stories/tasks.
- **`software-architecture`**: validate architectural options, NFR implications, and topology constraints.
- **`release-versioning`**: convert approved release slices into release governance and version policies.
- **`research-analysis` / `deep-research`**: refresh strategy assumptions, market/competitive shifts, and signal quality.

## Examples

**Example 1: Vision to roadmap**
```
User: "Create a roadmap for our payments platform from our 2-year product vision."
→ Run VisionToRoadmap workflow.
→ Build outcome horizons and map candidate features + enablers.
→ Label commitments vs forecasts and attach success metrics.
Result: Outcome-oriented roadmap with explicit horizon confidence.
```

**Example 2: Feature placement and releases**
```
User: "Should unified checkout be in R2 or R3?"
→ Run FeatureReleaseSequencing workflow.
→ Score options (e.g., WSJF or RICE), validate dependencies and runway readiness.
→ Propose release placement with confidence and trade-offs.
Result: Release decision with rationale and fallback option.
```

**Example 3: Reposition after architecture shift**
```
User: "We are moving to event-driven architecture. Reposition the roadmap and estimate impact."
→ Run RoadmapRepositioning workflow.
→ Re-sequence enablers, mark impacted feature slices, update confidence bands.
→ Generate impact summary for timeline, risk, and dependency changes.
Result: Updated roadmap and impact statement for stakeholder alignment.
```
