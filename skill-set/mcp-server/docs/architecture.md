# Skill Lab — Architecture Decisions

Status: **Build Ready** for **R0.2 — Graph, Health & Shared HTTP API** (EPIC-2). R0.1 foundation (EPIC-1) delivered.

## Milestone scope (R0.2)

| Story | Component | Spec trace |
|-------|-----------|------------|
| STORY-2-1 | `SkillGraphService`, `RelationshipMapRepository`, graph DTOs | FR-011–015, US-007–010 |
| STORY-2-2 | `SkillHealthService`, health scan DTOs | FR-016–021, US-011, AC-005, NFR-002 |
| STORY-2-6 | Graph filter/query contract, benchmarks, path edge-case catalog | NFR-004, runway for R0.3 |
| STORY-2-3 | MCP graph/health tools + catalog resources | FR-035–036, US-022–023 |
| STORY-2-4 | Hono HTTP read API (localhost) | FR-038, HTTP API Draft, NFR-011 |

**Exit criteria:** Agents and HTTP clients can query graph and run catalog health using shared domain services; DTOs match Zod + `schemas/`; E2E suite `tests/e2e-r02.test.ts` passes.

## System context

```text
┌─────────────┐     stdio      ┌──────────────────────────────────────┐
│ Cursor /    │◄──────────────►│ skill-set/mcp-server (TypeScript)    │
│ Claude MCP  │                │  mcp/          http/ (Hono)          │
└─────────────┘                │       \        /                     │
                               │        domain/                       │
┌─────────────┐     HTTP       │  SkillCatalogService                 │
│ Dashboard   │◄──────────────►│  SkillGraphService    (R0.2)         │
│ (R0.3)      │  localhost     │  SkillHealthService   (R0.2)         │
└─────────────┘                └──────────┬───────────────────────────┘
                                          │ read-only FS (path guard)
                                          ▼
                               ┌──────────────────────┐
                               │ skills repo (Git)    │
                               │ skill-index.json     │
                               │ maps/skill-relationships.json │
                               │ SKILL.md, catalogs   │
                               └──────────────────────┘
```

Humans use the dashboard (R0.3) over HTTP; agents use MCP. Both adapters call the **same domain services** — **FR-038**. No file parsing in `mcp/` or `http/`.

## Technology choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Node 20+, TypeScript | Spec default; one stack for MCP + HTTP/UI |
| MCP SDK | `@modelcontextprotocol/sdk` | Official SDK, stdio transport |
| HTTP | Hono | Lightweight; shared bootstrap with MCP package |
| DTO validation | Zod | Runtime checks + JSON Schema mirrors |
| Frontmatter | `gray-matter` | YAML `SKILL.md` parsing |
| Tests | Vitest | Unit, fixture, milestone E2E |
| UI location | `mcp-server/web/` (R0.3+) | Colocate until UI complexity grows |

## Repository layout (R0.2 target)

```text
skill-set/mcp-server/
  src/
    config/           loadConfig, pathGuard, pathModel
    domain/
      SkillCatalogService.ts        # R0.1
      SkillGraphService.ts          # R0.2 — STORY-2-1
      SkillHealthService.ts         # R0.2 — STORY-2-2
      SkillMdParser.ts
      types.ts                      # + graph/health DTOs
    repositories/
      FileSystemSkillRepository.ts
      SkillIndexRepository.ts
      EnvironmentMapRepository.ts
      RelationshipMapRepository.ts  # R0.2 — STORY-2-1
    mcp/
      server.ts
      tools.ts                      # catalog (R0.1) + graph/health (R0.2)
      resources.ts                  # R0.2 — STORY-2-3
    http/
      api.ts                        # Hono app factory — STORY-2-4
      routes/                       # thin handlers → domain
      problemDetails.ts             # RFC 9457 helpers
    git/  ai/  prompts/             # stubs / partial — later epics
  schemas/
    skill-summary.schema.json
    skill-detail.schema.json
    health-finding.schema.json
    skill-graph-node.schema.json    # R0.2
    skill-graph-edge.schema.json    # R0.2
    catalog-health-report.schema.json # R0.2
  docs/
    architecture.md
    graph-query-contract.md         # R0.2 — STORY-2-6
  tests/
    e2e-r01.test.ts
    e2e-r02.test.ts                 # R0.2 milestone gate
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
| `httpHost` | Default `127.0.0.1` (local-only R0.2) |
| `httpPort` | Default `3847` |

Env overrides: `SKILL_LAB_SKILLS_ROOT`, `SKILL_LAB_HTTP_PORT`.

**Path safety (NFR-009):** All reads through `assertPathUnderRoots()` against `[skillsRoot, skillSetRoot]`.

## Domain services (R0.2)

### SkillGraphService

- **Input:** `RelationshipMapRepository`, `SkillCatalogService` (for skill node ids and scope).
- **Source file:** `skill-set/maps/skill-relationships.json` (FR-011).
- **Nodes (FR-012):** `skill`, `mcp_tool`, `environment`, `workflow`, `reference`, `script` — stable ids: `{type}:{scope}:{name}` (e.g. `skill:user:skill-set`).
- **Edges (FR-013):** relationship map entries → `SkillGraphEdge` with `type`, `confidence`, `mappingIsApproximate`, `evidence`, `notes`.
- **Filters (FR-014):** `nodeTypes[]`, `relationshipTypes[]`, `scope`, `project`, `confidenceMin`/`confidenceMax`, `healthStatus` (joins catalog health on skill nodes).
- **High-risk overlay (FR-015):** expose `highRiskRefactorSequences[]` from map metadata as first-class panel data (not separate graph edges).
- **Local graph:** `graph_neighbors(centerNodeId, depth)` — default `depth=1`, hard cap `depth≤3` (STORY-2-6).
- **Pagination:** `limit` + `cursor` on `getGraph()` for large responses; default `limit=500` edges.

### SkillHealthService

- **Orchestrates** catalog, graph, environment, and index repos (read-only).
- **Checks (FR-016–020):** index count mismatches; unknown relationship endpoints; stale generated timestamps; non-resolvable env paths; missing `references/skill-escalation.md`; broken `SKILL.md` refs (delegates detail scan where needed).
- **Output:** `CatalogHealthReport` — `findings: HealthFinding[]`, `scannedAt`, `durationMs`, summary counts by severity.
- **Performance (NFR-002):** single pass where possible; target &lt;5s for 250 skills / 1k edges on dev laptop.

## Shared DTOs

Zod in `src/domain/types.ts`; JSON Schema mirrors in `schemas/`. MCP `structuredContent` and HTTP JSON bodies use the **same parsed objects** (NFR-011).

| DTO | Used by |
|-----|---------|
| `SkillSummary`, `SkillDetail` | catalog MCP/HTTP (R0.1) |
| `Environment` | environments list |
| `SkillGraphNode`, `SkillGraphEdge` | graph MCP/HTTP |
| `GraphFilter`, `GraphNeighborsQuery` | graph queries |
| `HealthFinding`, `CatalogHealthReport` | health MCP/HTTP |
| `HighRiskRefactorSequence` | graph overlay |

Errors: **RFC 9457** Problem Details (`application/problem+json`) from HTTP; MCP tools use `isError` + stable `error` codes for not-found/validation.

## Graph query contract (MCP + HTTP parity)

Documented in `docs/graph-query-contract.md` (STORY-2-6). Summary:

| Parameter | MCP tool | HTTP |
|-----------|----------|------|
| Full graph + filters | `get_skill_graph` | `GET /api/graph?...` |
| Local neighborhood | `graph_neighbors` | `GET /api/graph/neighbors?nodeId=&depth=` |
| Health scan | `check_catalog_health` | `POST /api/health` |

Query params mirror tool input fields (camelCase JSON). Unknown fields ignored on read paths (forwards-compatible).

## MCP surface (R0.2)

**Tools (add to R0.1 catalog tools):**

| Tool | Domain call | Writes? |
|------|-------------|---------|
| `get_skill_graph` | `SkillGraphService.getGraph(filters)` | No |
| `graph_neighbors` | `SkillGraphService.neighbors(...)` | No |
| `check_catalog_health` | `SkillHealthService.scan()` | No |

**Resources (STORY-2-3):**

```text
skill-lab://environments
skill-lab://skill-index/{environmentId}
skill-lab://relationships
skill-lab://graph
skill-lab://health/latest
```

Resources return JSON text; URIs are stable; content refreshed on read (no cache invalidation layer in R0.2).

## HTTP API (R0.2)

Base: `http://127.0.0.1:{httpPort}`. No `/v1` prefix until first breaking change.

| Route | Method | Domain |
|-------|--------|--------|
| `/api/environments` | GET | `SkillCatalogService.listEnvironments()` |
| `/api/skills` | GET | `listSkills` — query: `environmentId` |
| `/api/skills/:environmentId/:skillName` | GET | `getSkillDetail` |
| `/api/graph` | GET | `getGraph` — filter query params |
| `/api/graph/neighbors` | GET | `neighbors` — `nodeId`, `depth` |
| `/api/health` | POST | `scan()` — empty body OK |

CLI: `skill-lab http` (or `npm run dev -- http`) starts Hono only; `skill-lab mcp` unchanged (stdio). Optional future: combined `serve` for dev.

**Adapter rules:** `http/routes/*` validates query/body with Zod → calls domain → maps domain errors to Problem Details. **No** duplicate parsing of `SKILL.md` or relationship JSON in HTTP layer.

## Process bootstrap

```text
cli.ts
  mcp  → loadConfig → domain services → McpServer + tools + resources
  http → loadConfig → domain services → createApi(services) → serve localhost
  doctor → config + catalog counts (existing)
```

## Dependency direction

```text
mcp/, http/  →  domain/  →  repositories/  →  config/
```

No domain imports from MCP or HTTP. `SkillHealthService` may depend on `SkillCatalogService` and `SkillGraphService`; graph does not depend on health.

## Write confirmation (EPIC-5 — design only)

Unchanged from Gate 2; write tools not enabled in R0.2:

1. `writesEnabled: false` — write tools absent or `403` with stable type.
2. Two-step apply: `propose_*` → `patchToken`; `apply_approved_patch` requires confirmation.
3. HTTP: `X-Skill-Lab-Confirm` on POST apply routes.
4. Every write returns change summary + paths for Git review (NFR-008).

## NFR gates (R0.2)

| NFR | Gate |
|-----|------|
| NFR-002 | Health scan &lt;5s — benchmark in `tests/graph-perf.test.ts` + E2E smoke |
| NFR-004 | Graph filter + local depth + pagination documented; 250 node fixture benchmark |
| NFR-009 | Path guard on all repository reads |
| NFR-011 | MCP `structuredContent` === HTTP JSON shape for same operation |

## Open questions (recorded)

| # | Decision for MVP |
|---|------------------|
| 1 Local vs remote | Local-only; HTTP binds `127.0.0.1` in R0.2 |
| 2 Report storage | `skill-set/mcp-server/.generated/reports/` (gitignored) — validation in R0.4 |
| 4 Multi-repo | Single `skillsRoot`; inventories via environment map |
| 6 Write tools | Absent/disabled until `writesEnabled` |

## R0.3+ (out of scope for R0.2)

- Browser UI (`web/`), validation/AI proposals (EPIC-3–4), gated writes (EPIC-5).
- Routes: `/api/validation/*`, `/api/proposals/*`, `/api/git/*` — same domain pattern when added.
