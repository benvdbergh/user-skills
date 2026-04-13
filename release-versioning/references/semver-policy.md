# SemVer Policy

## Standard

This policy follows Semantic Versioning 2.0.0.

- Format: `MAJOR.MINOR.PATCH`
- `MAJOR`: incompatible public API change
- `MINOR`: backward-compatible feature
- `PATCH`: backward-compatible bug fix
- Optional suffixes:
  - pre-release: `-alpha.1`, `-rc.1`
  - build metadata: `+build.20260413`

Reference: https://semver.org/spec/v2.0.0.html

## Policy Statements

1. Public API boundary is explicitly documented before enforcing SemVer.
2. Released artifacts are immutable. A fix after release must use a new version.
3. Every version bump must be traceable to merged commits or release PR entries.
4. `1.0.0` marks API stability expectation.
5. Deprecations require at least one `MINOR` release note cycle before removal in a `MAJOR` release.

## Pre-1.0 Policy (`0.y.z`)

Use this only while API is unstable:
- allow rapid iteration
- still classify changes consistently
- define whether breaking changes map to `MINOR` or force `1.0.0`

Recommended default:
- breaking changes in `0.y.z` bump `MINOR`
- bug fixes bump `PATCH`

## Branch and Tag Policy

- Tag format: `vX.Y.Z` (for example `v2.3.1`)
- Release branch: protected branch (`main` or equivalent)
- Pre-release channels:
  - `alpha` for internal validation
  - `beta` for public preview
  - `rc` for release candidate

## Bump Matrix

| Change Type | Backward Compatible | Example | Bump |
| --- | --- | --- | --- |
| Bug fix | Yes | Null handling fix | PATCH |
| Feature | Yes | New optional endpoint | MINOR |
| Breaking API | No | Removed field/endpoint | MAJOR |
| Security patch without API break | Yes | Dependency patch | PATCH |
| Deprecation marker only | Yes | Mark API deprecated | MINOR |

## Governance Checks

- Does the release include any breaking changes? If yes, ensure migration notes exist.
- Are changelog entries grouped by impact level?
- Is the release tag unique and not reused?
- Are dependency constraints reviewed for downstream break risk?
