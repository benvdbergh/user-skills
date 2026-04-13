# Commit Convention Quick Reference

## Header Format

`type(scope)!: short description`

Examples:
- `feat(api): add export endpoint`
- `fix(auth): handle expired refresh token`
- `feat(core)!: remove v1 parser`

## Types and Bump Mapping

- `feat` -> MINOR
- `fix` -> PATCH
- `perf` -> PATCH (if user-visible impact)
- `!` or `BREAKING CHANGE:` -> MAJOR
- `docs`, `test`, `chore`, `ci`, `build`, `style`, `refactor` -> none by default

## Footer Examples

- `BREAKING CHANGE: remove deprecated v1 payload fields`
- `Refs: #1234`
- `Release-As: 3.0.0`

## Quality Tips

- keep one releasable intent per merge commit
- use clear scopes tied to components
- explain migration path for every breaking change

Reference:
- https://www.conventionalcommits.org/en/v1.0.0/
