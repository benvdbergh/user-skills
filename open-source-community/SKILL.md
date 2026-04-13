---
name: open-source-community
description: Builds practical open source community operating guidance that improves contributor experience, governance transparency, maintainer role clarity, communication norms, recognition systems, and sustainability safeguards. Use when creating or revising community docs, maintainer policies, onboarding flows, governance files, or health checks for open source projects.
---

# Open Source Community

## Purpose

This skill helps an agent design or improve open source community operations with a maintainer-friendly, contributor-centered approach.

Primary outcomes:
- Better contributor onboarding and retention
- Clearer governance and decision-making visibility
- Defined maintainer responsibilities and escalation paths
- Predictable communication and moderation norms
- Explicit recognition practices
- Burnout and sustainability safeguards

## When To Use

Use this skill when the user asks to:
- improve community health for an open source project
- create or revise `GOVERNANCE.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT`, or maintainer docs
- define maintainer expectations, response-time SLAs, or decision models
- add recognition frameworks beyond code-only contributions
- introduce anti-burnout boundaries, succession plans, or sustainability practices
- run a community health review using practical checklists and metrics

## Workflow

1. Baseline current community signals:
   - Presence and quality of key files (`README`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `GOVERNANCE`, support channels).
   - Observed contributor friction points (onboarding, review delay, unclear scope, unclear escalation).
2. Identify priority gap by category:
   - contributor experience
   - governance transparency
   - maintainer role clarity
   - communication and moderation norms
   - recognition and sustainability
3. Apply templates from `assets/` with minimal adaptation first.
4. Add measurement hooks using the metrics starter in `assets/community-health-checklist.md` and optional script.
5. Publish changes publicly and document review cadence.

## Operating Principles

- Document processes in public channels when possible.
- Keep role definitions explicit: responsibilities, authority, and qualification path.
- Prefer consensus-seeking discussion with a documented tiebreaker.
- Respond early, even if full review happens later.
- Recognize all contribution types (code and non-code).
- Protect maintainer capacity with boundaries, automation, and succession planning.

## Reference Files

- `references/maintainer-best-practices.md`
- `references/governance-and-decision-models.md`
- `references/contributor-experience-and-onboarding.md`
- `references/recognition-and-sustainability.md`

## Assets

- `assets/maintainer-charter-template.md`
- `assets/community-health-checklist.md`
- `assets/contributor-pathway-template.md`

## Optional Script

- `scripts/community_metrics_snapshot.py`
  - Lightweight repository snapshot for selected community health indicators.
  - Intended for quick trend baselining, not full analytics.

## Sources

- https://opensource.guide/best-practices/
- https://opensource.guide/building-community
- https://opensource.guide/leadership-and-governance/
- https://opensource.guide/code-of-conduct/
- https://opensource.guide/metrics/
- https://guidebook.theopensourceway.org/growing-contributors/project-and-community-governance
- https://chaoss.community/kb/metrics-model-community-welcomingness/
- https://www.contributor-covenant.org/resources
- https://allcontributors.org/docs/en/overview/
- https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions
