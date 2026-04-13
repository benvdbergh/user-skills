---
name: release-versioning
description: Defines SemVer and commit-convention release governance, then applies repeatable changelog, release-notes, checklist, and automation patterns. Use when setting or enforcing versioning policy, preparing releases, mapping commits to version bumps, or implementing release automation with GitHub Releases, release-please, or semantic-release.
---

# Release Versioning

## Purpose

Use this skill to create or enforce a consistent release process across:
- Semantic Versioning policy
- commit conventions tied to version bump logic
- changelog and release note standards
- release checklists and automation patterns

## Apply Workflow

1. Confirm release model and stability:
   - single package or monorepo
   - stable (`1.x`) or pre-1.0 (`0.x`)
   - manual or automated release execution
2. Apply SemVer policy from `references/semver-policy.md`.
3. Apply commit conventions from `references/conventional-commits-policy.md`.
4. Produce release notes using `references/changelog-and-release-notes.md` and `assets/release-notes-template.md`.
5. Run release readiness using `assets/release-checklist.md`.
6. Choose and implement automation with `references/release-automation-patterns.md`.

## Bump Decision Rules

Use these defaults unless the repository policy overrides them:
- `MAJOR`: any breaking API change (`!` or `BREAKING CHANGE:` footer)
- `MINOR`: backward-compatible feature (`feat`)
- `PATCH`: backward-compatible bug fix (`fix`)
- `NO RELEASE` (default): docs/style/test/chore/build/ci/refactor without externally observable impact

If the repository uses pre-1.0 development (`0.y.z`):
- treat breaking changes as `MINOR` at most, unless the project policy explicitly maps them differently
- keep this rule documented in release policy to avoid accidental `1.0.0` signaling

## Required Outputs

When this skill is used for policy setup, produce:
- versioning policy document
- commit convention quick reference
- changelog and release note template
- release checklist
- automation recommendation (manual, release-please, semantic-release, or hybrid)

## Files in this Skill

- `references/semver-policy.md`
- `references/conventional-commits-policy.md`
- `references/changelog-and-release-notes.md`
- `references/release-automation-patterns.md`
- `assets/release-checklist.md`
- `assets/release-notes-template.md`
- `assets/commit-convention-quickref.md`
- `scripts/version_bump_simulator.py`

## Source Links

- https://semver.org/spec/v2.0.0.html
- https://www.conventionalcommits.org/en/v1.0.0/
- https://docs.github.com/repositories/releasing-projects-on-github/automatically-generated-release-notes
- https://docs.github.com/github/administering-a-repository/managing-releases-in-a-repository
- https://github.com/googleapis/release-please
- https://raw.githubusercontent.com/googleapis/release-please/main/docs/customizing.md
- https://semantic-release.gitbook.io/semantic-release
- https://semantic-release.gitbook.io/semantic-release/usage/configuration
