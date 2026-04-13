# Conventional Commits Policy

## Standard

This policy follows Conventional Commits 1.0.0.

Reference: https://www.conventionalcommits.org/en/v1.0.0/

Message format:

`<type>[optional scope][!]: <description>`

Optional body and footer blocks follow after blank lines.

## Required Types and Release Impact

| Type | Meaning | Default Release Impact |
| --- | --- | --- |
| `feat` | New backward-compatible functionality | MINOR |
| `fix` | Backward-compatible bug fix | PATCH |
| `perf` | Observable performance improvement | PATCH |
| `refactor` | Internal restructure | none (unless breaking or user-impacting) |
| `docs` | Documentation only | none |
| `test` | Test only | none |
| `chore` | Maintenance | none |
| `build` | Build/dependency tooling | none by default |
| `ci` | CI pipeline config | none |

## Breaking Changes

Breaking changes must be signaled by at least one of:
- `!` marker in header, for example `feat(api)!: remove v1 endpoint`
- footer entry `BREAKING CHANGE: <details>`

Release impact:
- `MAJOR` (or repository-defined pre-1.0 mapping)

## Scope Guidance

Use stable scopes aligned to owned components:
- `api`
- `ui`
- `auth`
- `db`
- `deps`
- `docs`

Avoid ambiguous scopes such as `misc` or `stuff`.

## Footer Conventions

Supported trailer examples:
- `BREAKING CHANGE: ...`
- `Refs: #123`
- `Co-authored-by: Name <email>`
- `Release-As: 2.5.0` (for release-please explicit bump override)

Release-As reference:
- https://raw.githubusercontent.com/googleapis/release-please/main/README.md

## Commit Hygiene Rules

1. One user-visible intention per squashed merge commit.
2. Description is imperative and concise.
3. Breaking-change footer includes migration guidance.
4. Merge strategy should preserve release clarity (squash merge recommended for linear history).

## Validation Recommendations

- enforce format with commitlint in CI
- reject non-conforming commit headers on protected branches
- add quick reference in contributor docs
