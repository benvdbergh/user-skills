# README Standards

## Why README quality matters

GitHub states the README is often the first thing visitors see and recommends one for every repository.

## Minimum content standard

A strong README should answer:
- What the project does
- Why it is useful
- How to get started quickly
- Where to get help
- Who maintains and contributes
- How to contribute safely (security + contribution paths)

Recommended sections:
- Project title and one-line value proposition
- Status badge block (build, release, docs if available)
- Quick start (copy/paste runnable steps)
- Install and usage examples
- Configuration and prerequisites
- Contributing path (`CONTRIBUTING.md`)
- Security reporting pointer (`SECURITY.md`)
- License pointer (`LICENSE`)
- Support channels (`SUPPORT.md` or discussion links)

## Placement and behavior rules

- GitHub surfaces README from `.github/`, then root, then `docs/`.
- Keep README focused on onboarding; move long-form detail to `docs/` or wiki.
- Use relative links for internal docs so clones and branches resolve correctly.
- Keep rendered README below GitHub's truncation threshold (500 KiB).
- Link to `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `SUPPORT.md` when present.

## Practical quality rubric (quick scoring)

Score each 0/1:
- Clear one-sentence value proposition in first screen.
- "Get started in <=5 minutes" path exists.
- Internal links are relative and valid.
- Contributing, security, and license are linked.
- Maintainer/support path is explicit.

`4-5`: healthy, `2-3`: improvement needed, `0-1`: major rewrite needed.

## Sources

- [GitHub Docs: About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub Docs: Best practices for repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories)
- [Open Source Guides: Starting an Open Source Project](https://opensource.guide/starting-a-project/)
