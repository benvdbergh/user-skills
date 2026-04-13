# Documentation Information Architecture

## Goal

Make documentation easy to find, with clear split between quick onboarding and deep reference.

## Placement model

Use this default split:
- `README.md`: first-stop onboarding and project orientation.
- `docs/`: versioned, reviewable long-form docs (architecture, operations, API guides).
- Wiki: collaborative long-form notes that benefit from lightweight editing workflows.

## Decision rules

Choose `README.md` for content that every new visitor needs in the first 5 minutes:
- Project value proposition
- Fast path to run/use
- Pointers to support, contribution, and security docs

Choose `docs/` when content should:
- Travel with code history and pull requests
- Be reviewed like code
- Stay available in local clones and release archives

Choose Wiki when content is:
- Collaboration-heavy and frequently edited outside normal PR flow
- Not required for release artifacts
- Better served by wiki navigation and editing experience

## Structure pattern for `docs/`

Recommended baseline:
- `docs/index.md` or `docs/README.md`: docs landing page
- `docs/getting-started.md`: setup and first task
- `docs/reference/`: API/CLI/config reference
- `docs/operations/`: runbooks and maintenance
- `docs/architecture/`: decisions and system context

## Navigation and linking rules

- Use relative links between repository files.
- Add a docs index page and link it from root `README.md`.
- Keep headings stable to avoid broken deep links.
- Prefer shallow folder depth unless domain complexity requires nesting.

## Audit checks

- README clearly states where deeper docs live.
- `docs/` has an index/landing page.
- Major doc categories are separated (getting started, reference, operations, architecture).
- Wiki usage is intentional, documented, and not duplicating canonical docs.

## Sources

- [GitHub Docs: About the repository README file](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub Docs: About wikis](https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis)
- [GitHub Docs: Best practices for repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories)
