# CODEOWNERS Review Routing

Related: `../SKILL.md`, `triage-sla-and-label-taxonomy.md`

## When To Load

Load when configuring review routing, path ownership, and protected-branch policy.

## Core Practices

- Store `CODEOWNERS` in `.github/CODEOWNERS` unless there is a specific reason otherwise.
- Define broad default ownership first (`* @org/core-maintainers`) then override with more specific paths.
- Keep entries minimal and stable; own by team aliases where possible, not only individuals.
- Ensure owners have explicit write access and teams are visible.
- Enable branch protection or rulesets requiring code owner review for protected branches.

## Routing Heuristics

- Split ownership by subsystem boundaries (`/api/`, `/cli/`, `/docs/`, `/infra/`).
- Add dedicated owners for high-risk areas (auth, security-sensitive scripts, migrations).
- Add ownership for `.github/` and `CODEOWNERS` itself to protect governance drift.
- Use ordering intentionally: last matching rule wins.

## Review Policy Patterns

- Draft PRs: no automatic code owner requests until marked ready.
- Security or release-critical paths: require at least one owner approval plus all required checks.
- Cross-area PRs: request all relevant owning teams, but allow merge once required-owner rules pass.

## Example Skeleton

```text
# Default
* @org/core-maintainers

# Governance files
/.github/ @org/maintainers
/.github/CODEOWNERS @org/maintainers

# Product areas
/src/api/ @org/backend-maintainers
/src/web/ @org/frontend-maintainers
/docs/ @org/docs-maintainers
```

## No-Gos

- Missing owner for governance/config paths.
- Oversized and duplicated path lists that can be replaced by globs.
- Assigning owners that lack write access (rules silently fail to request).

## Source Links

- [GitHub Docs: About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Docs: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
