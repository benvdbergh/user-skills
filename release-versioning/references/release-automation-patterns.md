# Release Automation Patterns

## Decision Guide

Choose by release complexity and governance need:

- Manual + GitHub UI/CLI:
  - best for low-frequency releases and strict manual controls
- release-please:
  - best for release PR workflow with explicit review before tagging
- semantic-release:
  - best for fully automated CI releases after merge
- Hybrid:
  - release-please for version/changelog proposal + semantic-release or custom publish in later step

## Pattern A: Manual with Guardrails

Flow:
1. classify merged commits by convention
2. choose next version
3. update changelog
4. tag and create GitHub release
5. publish artifacts

Useful commands:
- `gh release create TAG --generate-notes`
- `gh release edit TAG`

Reference: https://docs.github.com/github/administering-a-repository/managing-releases-in-a-repository

## Pattern B: release-please

Characteristics:
- creates/updates release PR from commit history
- updates changelog and version files
- tagging and GitHub release happen when release PR is merged
- good for teams that require explicit release approval

Key features:
- manifest mode for monorepo/component releases
- `Release-As:` footer support for explicit version
- customizable labels, title patterns, and changelog behavior

References:
- https://github.com/googleapis/release-please
- https://raw.githubusercontent.com/googleapis/release-please/main/docs/customizing.md
- https://raw.githubusercontent.com/googleapis/release-please/main/docs/manifest-releaser.md

## Pattern C: semantic-release

Characteristics:
- runs in CI on release branches
- computes next version from commits
- generates notes and publishes automatically using plugins
- ideal for frequent releases and low manual overhead

Default plugin flow includes:
- commit analyzer
- release notes generator
- publish plugin(s)

References:
- https://semantic-release.gitbook.io/semantic-release
- https://semantic-release.gitbook.io/semantic-release/usage/configuration

## Policy Controls for Any Pattern

1. Protected release branches.
2. Enforced commit convention in CI.
3. Dry-run mode in staging before first production release.
4. Signed or controlled tag creation path.
5. Rollback and hotfix path documented.

## Minimal Adoption Path

1. Start with Conventional Commits + SemVer policy.
2. Add generated GitHub release notes.
3. Introduce release-please (reviewable release PR).
4. Move to semantic-release where full automation is acceptable.
