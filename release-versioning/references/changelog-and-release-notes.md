# Changelog and Release Notes Standard

## Objective

Provide consistent, user-focused release communication that is machine-parsable and human-readable.

## Changelog Standard

Recommended sections per release:
- Breaking Changes
- Features
- Fixes
- Performance
- Security
- Deprecations
- Internal/Other

Rules:
1. Include version and release date.
2. Link PR/issue references where available.
3. Include migration notes for breaking changes.
4. Keep internal-only noise minimal.
5. Never edit historical release contents after publication; add a follow-up release entry instead.

## GitHub Release Notes

For GitHub-hosted projects:
- use generated notes as baseline
- customize categories with `.github/release.yml`
- review generated entries before publish

References:
- https://docs.github.com/repositories/releasing-projects-on-github/automatically-generated-release-notes
- https://docs.github.com/github/administering-a-repository/managing-releases-in-a-repository

## Entry Quality Rules

Each entry should answer:
- what changed
- why it matters
- action needed by consumers (if any)

Style:
- start with impact, not implementation detail
- keep lines short and specific
- include explicit migration steps when behavior or API changed

## Example Structure

```md
## v2.4.0 - 2026-04-13

### Breaking Changes
- api: remove deprecated `POST /v1/import`; migrate to `POST /v2/import`.

### Features
- ui: add release timeline view for deployments.

### Fixes
- auth: fix token refresh race in high-latency sessions.
```

## Automation Notes

- semantic-release can generate release notes via plugins.
- release-please can generate changelog content and release PR notes.
- both still require human review for migration clarity and stakeholder context.

References:
- https://semantic-release.gitbook.io/semantic-release
- https://github.com/googleapis/release-please
