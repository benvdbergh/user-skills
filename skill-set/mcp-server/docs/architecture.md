# Skill Lab — Architecture Decisions

Status: **Build Ready** for **R0.3 — Read-Only Skill Lab Dashboard** (EPIC-3). **R0.2** (graph, health, shared HTTP API) and **R0.1** (catalog, MCP) are delivered.

## Milestone scope (R0.3)

| Story | Linear | Component | Spec trace |
|-------|--------|-----------|------------|
| STORY-3-1 | BEN-25 | `web/` package scaffold, shell layout, dev proxy | FR-039–040, AC-004 |
| STORY-3-2 | BEN-26 | Catalog view — search, filters, health highlights | US-001–003, FR-039, FR-041 |
| STORY-3-3 | BEN-27 | Skill detail — metadata, workflows, relationships | US-004–006 |
| STORY-3-4 | BEN-28 | Graph view — global/local, filters, high-risk overlay | US-007–010, NFR-004 |
| STORY-3-5 | BEN-29 | Health findings view with source links | US-011, FR-042 |
| STORY-3-6 | BEN-30 | UI/API contract doc, shared `SourceLink`, split criteria | FR-040–042, risk: UI as SSOT |

**R0.3 in scope:** Read-only browser dashboard for **catalog**, **skill detail**, **graph**, and **health**; environment switching; source-path links on displayed facts. **Out of scope (placeholders only):** validation scorecards, AI proposals, gated writes (R0.4–R0.5).

**Exit criteria:** A developer runs `skill-lab serve` (or equivalent), opens the dashboard on localhost, and navigates catalog → detail → graph → health using **only** the HTTP API (**FR-040**, **AC-004**). Milestone gate: `tests/e2e-r03.test.ts`.

## System context

```text
┌─────────────┐     stdio      ┌──────────────────────────────────────────────┐
│ Cursor /    │◄──────────────►│ skill-set/mcp-server (TypeScript)            │
│ Claude MCP  │                │  mcp/          http/ (Hono)                  │
└─────────────┘                │       \        /                             │
                               │        domain/  (R0.1–R0.2 — delivered)      │
┌─────────────┐     HTTP       │  SkillCatalogService                         │
│ Browser     │◄──────────────►│  SkillGraphService                           │
│ dashboard   │  localhost     │  SkillHealthService                          │
│ web/ (R0.3) │  + static UI   └──────────┬───────────────────────────────────┘
└─────────────┘                          │ read-only FS (path guard)
                                          ▼
                               ┌──────────────────────┐
                               │ skills repo (Git)    │
                               │ skill-index.json     │
                               │ maps/skill-relationships.json │
                               │ SKILL.md, catalogs   │
                               └──────────────────────┘
```

Humans use the dashboard (**R0.3**) over HTTP; agents use MCP. Both adapters call the **same domain services** — **FR-038**. The browser **never** reads the skills filesystem; it only calls `/api/*` (**FR-040**).

## Technology choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Node 20+, TypeScript | Spec default; one stack for MCP + HTTP + UI tooling |
| MCP SDK | `@modelcontextprotocol/sdk` | Official SDK, stdio transport |
| HTTP | Hono | Lightweight; shared bootstrap with MCP package |
| DTO validation | Zod | Runtime checks + JSON Schema mirrors |
| Frontmatter | `gray-matter` | YAML `SKILL.md` parsing |
| Tests | Vitest | Unit, fixture, milestone E2E |
| UI location | `mcp-server/web/` | Colocated per spec; split to `skill-lab-ui/` only when criteria in STORY-3-6 are met |
| UI framework | **Vite + React 19 + TypeScript** | Matches team TS stack; fast dev proxy; component ecosystem for tables and graph |
| UI routing | React Router (data routes) | Shell nav: Catalog \| Graph \| Health \| Proposals (disabled placeholder) |
| Graph rendering | **@xyflow/react** | Local + filtered graphs; pan/zoom; node cap enforced via API filters (NFR-004) |
| API client | Thin `fetch` wrappers in `web/src/api/` | Typed against shared DTO shapes; no domain logic in React |

## Repository layout (R0.3 target)

```text
skill-set/mcp-server/
  src/                              # backend (R0.1–R0.2 delivered)
    config/
    domain/
      SkillCatalogService.ts
      SkillGraphService.ts
      SkillHealthService.ts
      types.ts
    repositories/
    mcp/
    http/
      api.ts                        # + static fallback for web/dist (R0.3)
      problemDetails.ts
      queryParams.ts
    cli.ts                          # + serve command (R0.3)
  web/                              # R0.3 — STORY-3-1
    package.json
    vite.config.ts                  # proxy /api → httpPort
    index.html
    src/
      main.tsx
      App.tsx                       # shell + router
      api/
        client.ts                   # base URL, error → Problem Details
        catalog.ts
        graph.ts
        health.ts
      components/
        SourceLink.tsx              # STORY-3-6 — FR-042
        EnvironmentSwitcher.tsx     # FR-041
        Layout.tsx
      routes/
        CatalogPage.tsx             # STORY-3-2
        SkillDetailPage.tsx         # STORY-3-3
        GraphPage.tsx               # STORY-3-4
        HealthPage.tsx              # STORY-3-5
        ProposalsPlaceholder.tsx
      hooks/                        # presentation-only (filters, pagination UI state)
  schemas/                          # unchanged; UI consumes same JSON shapes
  docs/
    architecture.md
    graph-query-contract.md
    ui-api-compatibility.md         # STORY-3-6 — versioning + client rules
  tests/
    e2e-r01.test.ts
    e2e-r02.test.ts
    e2e-r03.test.ts                 # R0.3 milestone gate
```

## Configuration

File: `skill-lab.config.json` or `skill-lab.config.local.json` in package root.

| Field | Purpose |
|-------|---------|
| `skillsRoot` | User skills repository root (parent of `skill-set/`) |
| `skillSetRelativePath` | Default `skill-set` |
| `environmentMapRelativePath` | Default `skill-set/catalog/environment-skill-index-map.json` |
| `relationshipMapRelativePath` | Default `skill-set/maps/skill-relationships.json` |
| `writesEnabled` | Default `false` (NFR-007) |
| `environmentOverrides` | Per-env path overrides |
| `httpHost` | Default `127.0.0.1` (local-only R0.3) |
| `httpPort` | Default `3847` |

Env overrides: `SKILL_LAB_SKILLS_ROOT`, `SKILL_LAB_HTTP_PORT`.

**Path safety (NFR-009):** All reads through `assertPathUnderRoots()` against `[skillsRoot, skillSetRoot]`. The UI receives **repo-relative or absolute paths only via API fields** (`sourcePath`, etc.); it does not construct paths from user input beyond navigation params (`environmentId`, `skillName`).

## Domain services (delivered — R0.2 foundation)

R0.3 adds **no new domain services**. The dashboard consumes existing services through HTTP only.

### SkillGraphService

- **Input:** `RelationshipMapRepository`, `SkillCatalogService`.
- **Source:** `skill-set/maps/skill-relationships.json` (FR-011).
- **Nodes (FR-012):** `skill`, `mcp_tool`, `environment`, `workflow`, `reference`, `script`.
- **Filters (FR-014):** `nodeTypes[]`, `relationshipTypes[]`, `scope`, `project`, `confidenceMin`/`confidenceMax`, `healthStatus`.
- **High-risk overlay (FR-015):** `highRiskRefactorSequences[]` in graph payload — rendered as side panel in Graph view (STORY-3-4).
- **Local graph:** `graph_neighbors(centerNodeId, depth)` — default `depth=1`, cap `depth≤3`.
- **Pagination:** `limit` + `cursor` on `getGraph()`; default `limit=500` edges.

### SkillHealthService

- **Checks (FR-016–020):** index mismatches, unknown endpoints, stale generated timestamps, non-resolvable env paths, missing escalation files, broken refs.
- **Output:** `CatalogHealthReport` with `HealthFinding.sourcePath` for every finding.

Contract detail: `docs/graph-query-contract.md`.

## Shared DTOs (UI consumes via HTTP)

Zod in `src/domain/types.ts`; JSON Schema in `schemas/`. MCP `structuredContent` and HTTP JSON use the **same objects** (NFR-011). The UI types its client against these shapes; **no UI-specific response envelopes**.

| DTO | Dashboard use |
|-----|----------------|
| `Environment` | Environment switcher (**FR-041**) |
| `SkillSummary` | Catalog table; link to detail |
| `SkillDetail` | Detail page (**US-004–006**); `sourcePath`, refs, escalation |
| `SkillGraphNode`, `SkillGraphEdge`, `HighRiskRefactorSequence` | Graph + overlay |
| `GraphFilter`, `GraphNeighborsQuery` | Graph filter bar → query params |
| `CatalogHealthReport`, `HealthFinding` | Health page (**US-011**, **FR-042**) |

Errors: HTTP returns **RFC 9457** Problem Details; UI maps `type`/`title`/`detail` to inline error states (no stack traces).

## Graph query contract (MCP + HTTP parity)

Documented in `docs/graph-query-contract.md`. Dashboard **must** use the same query parameter names as HTTP (camelCase). Summary:

| UI action | HTTP |
|-----------|------|
| Full graph + filters | `GET /api/graph?...` |
| Local neighborhood | `GET /api/graph/neighbors?nodeId=&depth=` |
| Health scan | `POST /api/health` |

Client rules (STORY-3-6): ignore unknown JSON fields; do not send write verbs except `POST /api/health` in R0.3.

## Dashboard architecture (R0.3)

### Adapter boundary

```text
web/src/routes/*  →  web/src/api/*  →  HTTP /api/*  →  domain/
```

- **Allowed in React:** formatting, sorting UI state, client-side search over already-fetched lists (catalog), graph layout/selection, link URL building from `sourcePath`.
- **Forbidden in React:** parsing `SKILL.md`, reading relationship JSON, health rule evaluation, graph BFS, path guard logic.

### Shell and navigation (STORY-3-1)

| Route | View | API |
|-------|------|-----|
| `/` | Catalog (default) | `GET /api/environments`, `GET /api/skills` |
| `/skills/:environmentId/:skillName` | Skill detail | `GET /api/skills/:environmentId/:skillName`, graph neighbors for relationships |
| `/graph` | Graph explorer | `GET /api/graph`, `GET /api/graph/neighbors` |
| `/health` | Health findings | `POST /api/health` |
| `/proposals` | Placeholder (“R0.4”) | — |

Global **environment filter** (optional `environmentId` on catalog; required context on detail): **FR-041**.

### Catalog view (STORY-3-2)

- Fetch skills for selected environment (or all environments with env column).
- Client search across name, description, triggers; filter chips for scope, tier, health status (and project when present on summary).
- Columns: name, scope, environment, tier, trigger/workflow counts, health badge.
- Row click → skill detail route.
- Highlight rows with `health.status !== 'ok'` or high `health.findings`.

### Skill detail view (STORY-3-3)

- Sections: frontmatter, triggers, description length, workflows, references/scripts/assets with exists/missing badges.
- Escalation: `hasSkillEscalation` prominent callout (**US-005**).
- `missingReferences` list with **SourceLink** per path (**US-006**).
- Relationships: `GET /api/graph/neighbors?nodeId=skill:…&depth=1` (incoming/outgoing lists + link to Graph centered on node).

### Graph view (STORY-3-4)

- **Global mode:** `GET /api/graph` with filter bar (node type, relationship type, scope, confidence, health).
- **Local mode:** center on skill node from catalog/detail; `depth` 1–3.
- Edge styling: `confidence`, `mappingIsApproximate`.
- **High-risk panel:** render `highRiskRefactorSequences` from graph payload (**US-010**).
- Performance: default filters + edge `limit`; prompt user to narrow before rendering &gt;500 edges (NFR-004).

### Health view (STORY-3-5)

- Trigger scan on mount or button; show `summary` counts + sortable findings table.
- Each row: severity, category, message, **SourceLink**(`sourcePath`), optional `recommendation`.

### Source links (STORY-3-6, FR-042)

Shared `SourceLink` component:

| Input | Behavior |
|-------|----------|
| `sourcePath` from API | Display basename + full path tooltip |
| `href` | Configurable strategy in `ui-api-compatibility.md`: default `vscode://file/{absolutePath}` when path is absolute under `skillsRoot`; else repo-relative display only |

Graph nodes/edges: use `sourcePath` / `evidence.sourceFile` when present.

### Dev and production serving

| Mode | Command | Behavior |
|------|---------|----------|
| Dev | `npm run dev -- serve` (target) | Hono on `127.0.0.1:{httpPort}` + Vite dev server proxies `/api` |
| Dev (split) | `http` + `web` `npm run dev` | Two terminals; Vite proxy to API |
| Static | `web` build → `web/dist` | Hono serves `web/dist` + `/api/*` on same origin (avoids CORS) |

CLI additions (R0.3): `serve` — combined API + UI for local dashboard use (**AC-001**, **AC-004**).

## MCP surface (delivered — R0.2)

Unchanged for R0.3. Agents do not use the browser.

| Tool | Domain call |
|------|-------------|
| `get_skill_graph` | `SkillGraphService.getGraph(filters)` |
| `graph_neighbors` | `SkillGraphService.neighbors(...)` |
| `check_catalog_health` | `SkillHealthService.scan()` |

Resources: `skill-lab://environments`, `skill-lab://graph`, `skill-lab://health/latest`, etc.

## HTTP API (delivered — R0.2; consumed by R0.3 UI)

Base: `http://127.0.0.1:{httpPort}`. No `/v1` prefix until first breaking change (documented in `ui-api-compatibility.md`).

| Route | Method | Dashboard |
|-------|--------|-----------|
| `/api/environments` | GET | Environment switcher |
| `/api/skills` | GET | Catalog |
| `/api/skills/:environmentId/:skillName` | GET | Skill detail |
| `/api/graph` | GET | Graph view |
| `/api/graph/neighbors` | GET | Detail relationships, local graph |
| `/api/health` | POST | Health view |
| `/*` (non-API) | GET | SPA fallback → `web/dist/index.html` (R0.3) |

## Process bootstrap

```text
cli.ts
  mcp    → loadConfig → domain services → McpServer (stdio)
  http   → loadConfig → domain services → createApi → serve localhost
  serve  → loadConfig → domain services → createApi + static UI (R0.3)
  doctor → config + catalog counts
```

## Dependency direction

```text
web/  →  http/ (fetch only, no import from src/domain)
mcp/, http/  →  domain/  →  repositories/  →  config/
```

No `domain/` imports from `web/`, `mcp/`, or `http/`.

## Write confirmation (EPIC-5 — design only)

Unchanged; write tools not enabled in R0.3. Proposals nav is a disabled placeholder.

## NFR gates

| NFR | R0.2 (delivered) | R0.3 (target) |
|-----|------------------|---------------|
| NFR-002 | Health scan &lt;5s — `graph-perf.test.ts`, E2E | Reuse; Health view triggers same scan |
| NFR-003 | — | Catalog/detail first paint &lt;1s after API response (250 skills) — manual + optional perf hook |
| NFR-004 | Graph contract + benchmarks | Graph UI usable at 250 nodes / 1k edges via filters + local mode |
| NFR-009 | Path guard on repository reads | UI never bypasses API |
| NFR-011 | MCP === HTTP JSON shape | UI consumes HTTP JSON as-is |

## UI/API compatibility (STORY-3-6)

Artifact: `docs/ui-api-compatibility.md`

| Topic | Policy |
|-------|--------|
| Versioning | Unversioned `/api/*`; breaking changes require migration note + optional `/v1` |
| Client tolerance | Ignore unknown JSON properties |
| Logic placement | Presentation-only in `web/`; rules stay in `domain/` |
| Split criteria | Extract `skill-lab-ui/` when: separate release cadence, distinct CI, or `web/` &gt; ~15k LOC / second framework |

## Open questions (recorded)

| # | Decision for MVP |
|---|------------------|
| 1 Local vs remote | **Local-only** for R0.3; bind `127.0.0.1` |
| 2 Report storage | `.generated/reports/` — validation UI in R0.4 |
| 4 Multi-repo | Single `skillsRoot` |
| 6 Write tools | Absent/disabled until `writesEnabled` |

## R0.4+ (out of scope for R0.3)

- Validation scorecards, AI proposals, `PromptSourceService` (EPIC-4).
- Routes: `/api/validation/*`, `/api/proposals/*` — same domain pattern when added.
- Gated writes, Git review UI (EPIC-5).
- Populate **Proposals** nav when proposal endpoints exist.
