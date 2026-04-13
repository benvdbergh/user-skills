# Community Health Docs Baseline

## Goal

Establish minimum contributor-facing files so users know how to contribute, get help, and report security issues.

## Baseline files

Required for most OSS repositories:
- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`

Recommended for scale:
- Issue templates (`.github/ISSUE_TEMPLATE/`)
- Pull request template (`.github/PULL_REQUEST_TEMPLATE.md` or equivalent supported location)
- `GOVERNANCE.md` for multi-maintainer projects

## Supported locations and precedence

GitHub recognizes key community files in:
- `.github/`
- repository root
- `docs/`

When multiple files exist, GitHub uses precedence rules (for example `CONTRIBUTING.md`: `.github/` then root then `docs/`).

## Default community health files (org/account level)

Use a public `.github` repository to provide defaults across repositories that do not define their own files.

Use this for:
- Shared `CODE_OF_CONDUCT.md`
- Shared `CONTRIBUTING.md`
- Shared issue/PR templates
- Shared `SECURITY.md` and `SUPPORT.md`

## Practical enforcement checks

- All baseline files exist in supported locations.
- README links to contribution, security, and support docs.
- Issue and PR templates are present on default branch.
- Security policy includes reporting channel and supported versions.
- Support policy routes users to the right channel (issues vs discussions vs chat).

## Sources

- [GitHub Docs: Creating a default community health file](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [GitHub Docs: Setting guidelines for repository contributors](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)
- [GitHub Docs: Adding a code of conduct to your project](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-code-of-conduct-to-your-project)
- [GitHub Docs: Adding support resources to your project](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-support-resources-to-your-project)
- [GitHub Docs: Adding a security policy to your repository](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)
- [GitHub Docs: About issue and pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)
- [Open Source Guides: Building Welcoming Communities](https://opensource.guide/building-community/)
