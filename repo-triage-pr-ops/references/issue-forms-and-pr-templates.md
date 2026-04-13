# Issue Forms and PR Templates

Related: `../SKILL.md`, `triage-sla-and-label-taxonomy.md`

## When To Load

Load when setting up or revising intake quality for issues and pull requests.

## Core Practices

- Use YAML issue forms in `.github/ISSUE_TEMPLATE/*.yml`.
- Keep at least one required reproduction block for bugs.
- Add `config.yml` with `blank_issues_enabled: false` for contributors, while keeping maintainer fallback behavior.
- Route support/security through `contact_links` to avoid leaking sensitive details into public issues.
- Use one default PR template at `.github/pull_request_template.md`; use multiple templates only if contributors submit very different change types.

## Recommended Form Fields

### Bug Form

- Version/build commit
- Environment (OS/runtime/browser)
- Reproduction steps
- Expected vs actual behavior
- Logs or screenshots
- Confirmation of existing issue search

### Feature Request Form

- Problem statement
- Proposed solution
- Alternatives considered
- Scope impact
- Willingness to contribute

### Pull Request Template

- Linked issue
- Change summary
- Risk and rollback notes
- Test evidence
- Checklist for docs/changelog/security considerations

## Example Policy Snippet

- "No unstructured issue intake for non-maintainers."
- "Bug reports require reproducible steps and environment."
- "PRs without linked context and test evidence are returned for updates."

## No-Gos

- Accepting blank bug reports without reproduction details.
- Using issue forms for sensitive security reports instead of private channels.
- Overloading PR template with long prose; use concise checklists.

## Source Links

- [GitHub Docs: Syntax for issue forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- [GitHub Docs: Configuring issue templates for your repository](https://docs.github.com/articles/configuring-issue-templates-for-your-repository)
- [GitHub Docs: Creating a pull request template for your repository](https://docs.github.com/en/github/building-a-strong-community/creating-a-pull-request-template-for-your-repository)
