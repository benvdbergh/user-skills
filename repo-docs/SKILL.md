---
name: repo-docs
description: Improves repository discoverability and documentation quality across README, repository metadata, docs information architecture, community health files, and freshness signals. Use when auditing or upgrading an OSS repository's outward presentation and contributor-facing docs.
---

# repo-docs

## Purpose

Maintain a repository's public quality bar so new users can discover, trust, and contribute quickly.

## Scope

This skill covers:
- README quality and structure
- Repository metadata discoverability (description, topics, social preview)
- Documentation information architecture (root docs vs `docs/` vs wiki)
- Community health baseline presence checks
- Documentation freshness and staleness indicators

This skill does not deeply design security/release pipelines. It can hand off to specialized skills for those areas.

## Topic Map

- README standards: `references/readme-standards.md`
- Metadata discoverability: `references/repo-metadata-discoverability.md`
- Docs IA decisions: `references/docs-information-architecture.md`
- Community baseline: `references/community-health-docs-baseline.md`
- Starter README: `assets/README-template.md`
- Audit checklist: `assets/docs-audit-checklist.md`
- Optional local audit script: `scripts/repo_docs_audit.py`

## Workflow

1. Baseline
   - Run `python scripts/repo_docs_audit.py --help`.
   - Run a local audit:
     - `python scripts/repo_docs_audit.py --repo .`
   - Copy findings into the checklist in `assets/docs-audit-checklist.md`.

2. Improve discoverability
   - Tighten repository description (clear problem + audience + status).
   - Add focused topics (<=20, lowercase, hyphenated).
   - Add/update social preview image for link unfurls.
   - Apply guidance in `references/repo-metadata-discoverability.md`.

3. Fix README and IA
   - Upgrade README using `assets/README-template.md`.
   - Decide doc split: quick-start in README, deep docs in `docs/`, collaboration-heavy long-form in wiki when needed.
   - Apply guidance in `references/readme-standards.md` and `references/docs-information-architecture.md`.

4. Raise contributor readiness
   - Ensure baseline community files exist in supported locations.
   - Add issue/PR templates and support channels.
   - Apply guidance in `references/community-health-docs-baseline.md`.

5. Freshness guardrails
   - Add explicit "Last reviewed" dates to major docs.
   - Set review cadence and stale thresholds (for example 90-180 days by doc type).
   - Use repository activity signals to prioritize stale areas.

## Definition of Done Metrics

Use this skill's output as complete when:
- README contains: value proposition, quick start, install/run, contribution path, help/support, maintenance signal.
- Repository metadata has a clear description, relevant topics, and social preview.
- Documentation IA is explicit (where onboarding vs reference vs governance content lives).
- Community baseline files are present in supported locations:
  - `README`, `LICENSE`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `SUPPORT`
- Audit script exits cleanly for required checks or has explicit accepted exceptions.
- Key docs include review timestamps and have no high-priority stale flags.

## Cross-Skill Handoff

Hand off when deeper treatment is needed:
- Security policy depth and disclosure process -> `documentation-governance` or `software-architecture`
- Release process and automation hardening -> `software-architecture`
- Diagram-heavy docs IA redesign -> `diagram`

## Notes

- Keep recommendations practical and incremental.
- Prefer links to canonical sources over local policy prose.
- Use ASCII only in templates and automation outputs.
