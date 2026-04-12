# Artifact discovery

Run **before** creating or sharding epics/stories. Goal: list specifications, architecture, and constraints already in the workspace.

## Inputs

1. **Manifest** — `.project-planning.yaml` at project root (`source_globs`). See [frontmatter-schema.md](frontmatter-schema.md).
2. **User-provided paths** — Any PRD/spec/arch paths the user names in chat.
3. **Repository search** — Use workspace search (e.g. ripgrep) when manifest globs are incomplete.

## Suggested patterns to search

| Intent | Typical paths / names |
|--------|------------------------|
| Product requirements | `PRD.md`, `**/PRD*.md`, `docs/spec*.md`, `product/*.md` |
| Architecture | `Architecture.md`, `docs/architecture*`, `arc42/**`, `**/C4*` |
| Decisions | `docs/adr/**`, `adr/**`, `decisions/**`, `**/ADR-*.md` |
| Constitution / guardrails | `CONSTITUTION.md`, `constitution.md`, `.specify/**` |
| API contracts | `openapi.yaml`, `**/api/*.yaml` |
| README overview | `README.md` (scope and goals sections) |

## Process

1. Resolve project root (`--root`, `--config`, or legacy `--project`).
2. Run `ScanSources.ts` to expand `source_globs` from the manifest.
3. Build a **source inventory** table: path, inferred type, one-line relevance.
4. Read the highest-signal documents first (PRD, architecture index, recent ADRs).
5. Only then run [ShardFromSources.md](ShardFromSources.md) or ad-hoc epic/story creation.

## CLI

```bash
bun run $PAI_DIR/skills/project-planning/scripts/ScanSources.ts --root <path>
# or
bun run .../ScanSources.ts --project <legacy-name>
```
