# UI / API compatibility (R0.4)

Status: **EPIC-4** (BEN-31–BEN-37). Governs the Skill Lab dashboard (`web/`) and shared HTTP API (`/api/*`). System context, milestone scope, and service layout → [`docs/architecture.md`](architecture.md) (do not duplicate here).

## Versioning

| Topic | Policy |
|-------|--------|
| Base path | Unversioned `/api/*` through R0.4 |
| Breaking changes | Migration note in this doc; optional `/v1` prefix when the first breaking change ships |
| MCP parity | HTTP JSON bodies match MCP `structuredContent` shapes (NFR-011) — graph filters in `docs/graph-query-contract.md` |

## Client rules

1. **Ignore unknown fields** — UI and agents must tolerate extra JSON properties on all DTOs (forwards-compatible reads).
2. **No apply in R0.4** — Proposal ingest, validation runs, agent sessions, and `POST /api/health` are allowed; there is no patch apply or relationship-map write API. Do not call undocumented mutations.
3. **Query names** — Use camelCase query parameters exactly as documented in `graph-query-contract.md`.
4. **Errors** — Expect RFC 9457 `application/problem+json`; surface `title` / `detail` only (no stack traces).

### Error taxonomy (RFC 9457)

| Status | Problem `type` | Client `detail` |
|--------|----------------|-----------------|
| 400 | `…/validation-error` | Adapter/domain validation text (safe for clients) |
| 403 | `…/forbidden` | Fixed path-access message — **no** host absolute paths |
| 404 | `…/not-found` | Resource identifier when safe |
| 500 | `…/internal-error` | Fixed generic message only; full error logged server-side |

`PathAccessError`, `QueryParamError`, and `ProposalValidationError` map to 4xx in the global HTTP handler; unhandled errors return 500 without echoing `err.message` (NFR-009 / FR-040). See [Problem Details](#problem-details-rfc-9457) below.

## Logic placement

| Layer | Allowed |
|-------|---------|
| `src/domain/` | Catalog, graph, health, validation, proposals; path guard; DTO validation |
| `src/http/`, `src/mcp/` | Adapters only — call domain services |
| `web/src/api/` | Thin `fetch` wrappers (`catalog`, `graph`, `health`, `validation`, `prompts`, `agent`, `proposals`, `git`) |
| `web/src/lib/` | Presentation helpers (sort, filter, layout, link formatting, session origin) — **no** catalog/graph/health/validation/proposal business rules |
| `web/src/routes/`, `web/src/components/` | React UI state, formatting, navigation |

The dashboard **must not** parse `SKILL.md`, relationship maps, health/validation rules, or run graph BFS. It only consumes `/api/*`.

## Problem Details (RFC 9457)

Content-Type: `application/problem+json`. Shape mirrors `web/src/api/client.ts` (`ProblemDetail`).

| `type` URI | HTTP | `title` | Typical use |
|------------|------|---------|-------------|
| `https://skill-lab.dev/problems/validation-error` | 400 | Validation failed | Bad query/body (Zod), missing required query params |
| `https://skill-lab.dev/problems/not-found` | 404 | Not found | Unknown skill, proposal token, session, empty validation latest |
| `https://skill-lab.dev/problems/forbidden` | 403 | Forbidden | Path guard (`PathAccessError`) |
| `https://skill-lab.dev/problems/internal-error` | 500 | Internal server error | Unhandled adapter errors; `detail` must not expose absolute host paths (FR-040) |

Optional fields: `detail` (human-readable), `instance` (request path). Implemented in `src/http/problemDetails.ts`.

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

Until then, keep `web/` colocated under `skill-set/mcp-server/web/` per [`architecture.md`](architecture.md).

## HTTP surface

Routes register only when the matching service is wired in `createApi` (full stack: `serve` / `http` with agent + validation factories). Shapes are validated with Zod in `src/domain/types.ts` and mirrored under `schemas/`.

### R0.3 (dashboard)

| Route | Method | Response wrapper | UI consumer |
|-------|--------|------------------|-------------|
| `/api/environments` | GET | `{ environments }` | Catalog, EnvironmentSwitcher |
| `/api/skills` | GET | `{ skills }` | Catalog (`?environmentId=`) |
| `/api/skills/:environmentId/:skillName` | GET | `{ skill }` | Skill detail |
| `/api/graph` | GET | `{ graph }` | Graph (global) |
| `/api/graph/skill-relationship-counts` | GET | `{ counts }` | Catalog relationship column |
| `/api/graph/neighbors` | GET | `{ graph }` | Graph (local), Skill detail |
| `/api/health/latest` | GET | `{ report }` | Health (cached; 404 if none) |
| `/api/health` | POST | `{ report }` | Health (run scan) |
| non-`/api` GET | GET | static / SPA | `web/dist` when `staticDir` set |

### R0.4 additions

| Route | Method | Response wrapper | Notes |
|-------|--------|------------------|-------|
| `/api/validation/:environmentId/:skillName` | POST | `{ lint?, validation? }` | Body: `{ mode?, persist?, deep? }`; empty body OK |
| `/api/validation/.../latest` | GET | `{ lint?, validation? }` | 404 if no persisted pointers |
| `/api/validation/.../compare` | GET | `{ compare }` | Query: `beforeId`, `afterId` (required) |
| `/api/prompts/:promptId` | GET | `{ prompt, skillSetRoot }` | Query: `environmentId`, `skillName` when template requires skill context |
| `/api/agent/auth` | GET | `{ auth }` | No secrets in body (NFR-010) |
| `/api/agent-sessions` | POST | `{ session }` | 201; body: `AgentTaskRequest`; Claude runtimes require auth at runner |
| `/api/agent-sessions/:id` | GET | `{ status }` | Log tail, `proposalIds` |
| `/api/agent-sessions/:id` | DELETE | `{ status }` | Cancel; terminal `cancelled` |
| `/api/proposals` | GET | `{ tokens }` | Query: `limit` (optional, default **50**, max **200**), `sessionId` (optional); newest first, bounded (BEN-73) |
| `/api/proposals/:patchToken` | GET | stored proposal | Patch or relationship payload |
| `/api/proposals/skill-patch` | POST | `{ proposal }` | 201; advisor-backed patch flow |
| `/api/proposals/relationships` | POST | `{ proposal }` or `{ report }` | `action`: `suggest-edges` \| `detect-conflicts` |
| `/api/git/diff` | GET | `{ diff }` | Query: `patchToken` (required) |

## Dashboard routing

| Route | View |
|-------|------|
| `/` | Catalog; `?skill=` side panel |
| `/skills/:environmentId/:skillName` | Full-page detail |
| `/graph` | Graph explorer |
| `/health` | Health findings |
| `/proposals` | Workbench; `?patch=` deep link |

Global `?environmentId=` (FR-041). Catalog skill selection:

| Mechanism | Format | Notes |
|-----------|--------|--------|
| Catalog side panel | `?skill={environmentId}/{skillName}` | **Preferred** when `skillName` contains `/` (parsed on first `/` only) |
| Full-page detail | `/skills/:environmentId/:skillName` | Shareable URL; `skillName` is a **single** path segment (slashes not supported) |
| Environment filter | `?environmentId=` | Preserved across catalog, panel, detail, and proposals |

The UI must not construct filesystem paths from user input; only display `sourcePath` values returned by the API.

### Proposals workbench list sync (BEN-73)

- `fetchProposalTokens` in `web/src/api/proposals.ts` builds `GET /api/proposals` with optional `sessionId` and `limit`.
- When `AgentSessionContext` has an active `sessionId`, `ProposalsPage` passes it so the server returns session-scoped tokens only; `ProposalList` receives the same `sessionId` for empty-state copy.
- Merge server tokens with browser `sessionStorage` (`proposalStorage.ts`); local-only tokens may still appear after merge (US-032).
- Do not assume an unbounded token list; default server cap is 50.

## Web quality gate

From `skill-set/mcp-server/`:

```bash
npm run web:typecheck   # tsc --noEmit in web/
npm run web:build       # vite build → web/dist
```

`npm test` runs server `tsc`, `web:typecheck`, then Vitest (including `tests/e2e-r04.test.ts` web build smoke).

## Related docs

- [`docs/architecture.md`](architecture.md) — milestones, services, MCP tools, composition root
- [`docs/graph-query-contract.md`](graph-query-contract.md) — graph filters and pagination
- [`spec/skill-lab-mcp-control-plane.md`](../spec/skill-lab-mcp-control-plane.md) — product requirements and quality gates
