# UI / API compatibility (R0.3)

Status: **STORY-3-6** (BEN-30). Governs the Skill Lab dashboard (`web/`) and shared HTTP API (`/api/*`).

## Versioning

| Topic | Policy |
|-------|--------|
| Base path | Unversioned `/api/*` for R0.3 |
| Breaking changes | Require a migration note in this doc; introduce optional `/v1` prefix when the first breaking change ships |
| MCP parity | HTTP JSON bodies match MCP `structuredContent` shapes (NFR-011) — see `docs/graph-query-contract.md` |

## Client rules

1. **Ignore unknown fields** — UI and agents must tolerate extra JSON properties on all DTOs (forwards-compatible reads).
2. **No write verbs in R0.3** — Except `POST /api/health` (read-only scan). Do not call undocumented mutations.
3. **Query names** — Use camelCase query parameters exactly as documented in `graph-query-contract.md`.
4. **Errors** — Expect RFC 9457 `application/problem+json`; surface `title` / `detail` only (no stack traces).

## Logic placement

| Layer | Allowed |
|-------|---------|
| `src/domain/` | Catalog, graph, health rules; path guard; DTO validation |
| `src/http/`, `src/mcp/` | Adapters only — call domain services |
| `web/src/api/` | Thin `fetch` wrappers |
| `web/src/lib/` | Presentation helpers (sort, filter, layout, link formatting) — **no** catalog/graph/health business rules |
| `web/src/routes/`, `web/src/components/` | React UI state, formatting, navigation |

The dashboard **must not** parse `SKILL.md`, relationship maps, or health rules. It only consumes `/api/*`.

## Source links (FR-042)

Shared component: `web/src/components/SourceLink.tsx` (styles: `sl-source-link*` in `styles/primitives.css`)  
Helpers: `web/src/lib/sourceLink.ts`

| Input | Behavior |
|-------|----------|
| Absolute path (`C:\…`, `/…`, `\\…`) | Clickable IDE link |
| Repo-relative path | Basename + full path tooltip; not opened as `file://` (skills root unknown in browser) |

### IDE link strategy

Default scheme: `vscode://file/{absolutePath}` (POSIX slashes in URL).

Optional override at build time:

```bash
# web/.env.local
VITE_IDE_LINK_SCHEME=cursor   # yields cursor://file/...
```

Supported env: `VITE_IDE_LINK_SCHEME` (default `vscode`). Only applied when the path is absolute on disk.

Relative paths: display label + `title` / secondary `<code>` with full path; no fake `href`.

## Split to `skill-lab-ui/` criteria

Extract the UI into a separate package when **any** of:

1. **Release cadence** — Dashboard ships on a schedule independent of the MCP server.
2. **CI** — Distinct test/lint/deploy pipeline required for frontend-only changes.
3. **Size / stack** — `web/` exceeds ~15k LOC or adopts a second UI framework.
4. **Consumers** — A second host (e.g. remote deployment) needs the UI without the MCP package.

Until then, keep `web/` colocated under `skill-set/mcp-server/web/` per architecture.md.

## R0.3 HTTP surface (reference)

| Route | Method | UI consumer |
|-------|--------|-------------|
| `/api/environments` | GET | Catalog, EnvironmentSwitcher |
| `/api/skills` | GET | Catalog |
| `/api/skills/:environmentId/:skillName` | GET | Skill detail |
| `/api/graph` | GET | Graph (global) |
| `/api/graph/skill-relationship-counts` | GET | Catalog relationship column |
| `/api/graph/neighbors` | GET | Graph (local), Skill detail |
| `/api/health` | POST | Health |
| non-`/api` GET | GET | SPA static (`web/dist`) when `serve` / `staticDir` |

## Dashboard routing (skill names)

| Mechanism | Format | Notes |
|-----------|--------|--------|
| Catalog side panel | `?skill={environmentId}/{skillName}` | **Preferred** when `skillName` contains `/` (parsed on first `/` only) |
| Full-page detail | `/skills/:environmentId/:skillName` | Shareable URL; `skillName` is a **single** path segment (slashes not supported) |
| Environment filter | `?environmentId=` | Preserved across catalog, panel, and detail links |

The UI must not construct filesystem paths from user input; only display `sourcePath` values returned by the API.

## Related docs

- `docs/architecture.md` — system context, R0.3 stories
- `docs/graph-query-contract.md` — graph filters and pagination
