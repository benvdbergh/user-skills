# Skill escalation — code-review-skill (vendor)

Upstream skill: `code-review-excellence` in folder `code-review-skill`.  
Catalog: `skill-set/catalog/third-party-skills.json`.

## Owns

- PR and code-change review process, severity labels, review checklists, and language/framework-specific review guides under upstream `reference/`.
- Security, performance, and architecture **review lenses** as documented in upstream SKILL.md (not implementation of fixes).

## Does not own

- **Implementing** fixes or feature work → `minimalist-coding`.
- **System/product architecture** decisions and ADRs → `software-architecture`; portfolio/EA → `enterprise-architecture`.
- **CI/CD pipeline** design or branch protection → `ci-cd-governance`.
- **Repository** triage labels, templates, maintainer SLAs → `repo-triage-pr-ops`.
- **Security program** baseline (Dependabot, scanning policy) → `repo-security-compliance`.
- **Authoring** long-form review reports as primary deliverable → `tech-documentation`.

## Escalation paths

| Situation | Route to |
|-----------|----------|
| User wants standards applied while writing code | `minimalist-coding` |
| Review surfaces structural/design issues needing ADR or arc42 | `software-architecture` |
| Review is security-program or repo-policy scope | `repo-security-compliance`, `repo-triage-pr-ops` |
| Review output should become published doc | `tech-documentation` |
| Skill install, index, or ecosystem boundaries | `skill-set` |

## Relationship map hints

- Complements `repo-triage-pr-ops` (process) with review substance.
- Overlaps `software-architecture` on architecture reviews—prefer architecture skill for design authority, code-review for PR-level critique.
- Complements `minimalist-coding` (how to write) with how to **review** what was written.

## Notes for relationship analysis

Evidence for `skill-set/maps/skill-relationships.json` is maintained here so upstream pulls do not overwrite boundaries.
