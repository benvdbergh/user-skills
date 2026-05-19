# Graph query contract (MCP + HTTP)

Status: **R0.2 — STORY-2-6** (NFR-004 runway). Domain implementation: `SkillGraphService` (`src/domain/SkillGraphService.ts`). Adapters (MCP tools STORY-2-3, HTTP routes STORY-2-4) must call domain only — no duplicate graph logic.

## Operations

| Operation | Domain | MCP tool (planned) | HTTP (planned) |
|-----------|--------|-------------------|----------------|
| Filtered full graph | `getGraph(filters?)` | `get_skill_graph` | `GET /api/graph` |
| Local neighborhood | `neighbors(query)` | `graph_neighbors` | `GET /api/graph/neighbors` |

Both adapters validate input with `GraphFilterSchema` / `GraphNeighborsQuerySchema` (`src/domain/types.ts`), then return `SkillGraphResult` JSON (same shape for MCP `structuredContent` and HTTP body — NFR-011).

## Filter parameters (`GraphFilter`)

| Field | Type | Domain behavior | MCP tool input | HTTP query |
|-------|------|-----------------|----------------|------------|
| `nodeTypes` | `GraphNodeType[]` | After edge filter, keep only nodes whose `type` is listed | JSON array | Repeat `nodeTypes` or `nodeTypes=skill,mcp_tool` (comma-separated) |
| `relationshipTypes` | `string[]` | Drop edges whose `type` is not listed | JSON array | `relationshipTypes` (repeat or comma-separated) |
| `scope` | `string` | Edge matches if either endpoint node has this `scope`; node filter uses exact `scope` | string | `scope` |
| `project` | `string` | Edge matches if either endpoint has `environmentId` or `project` equal to value | string | `project` |
| `confidenceMin` | `number` | Drop edges with `confidence` &lt; min | number | `confidenceMin` |
| `confidenceMax` | `number` | Drop edges with `confidence` &gt; max | number | `confidenceMax` |
| `healthStatus` | `"ok"` \| `"warning"` \| `"error"` | Edge matches if either **skill** endpoint has catalog `health.status`; node filter same for skills | string | `healthStatus` |
| `limit` | `int` &gt; 0 | Max edges per page (default **500**) | number | `limit` |
| `cursor` | `string` | Opaque edge offset; numeric string interpreted as start index | string | `cursor` |

### Neighbors-only fields (`GraphNeighborsQuery`)

| Field | Type | Default | Max | MCP | HTTP |
|-------|------|---------|-----|-----|------|
| `nodeId` | `string` | — (required) | — | `nodeId` | `nodeId` |
| `depth` | `int` | **1** | **3** (hard cap in domain) | `depth` | `depth` |

All `GraphFilter` fields may be combined with `nodeId` / `depth` on neighborhood queries. Domain applies filters to the full graph build, then BFS-expands from `nodeId` for `depth` hops.

### Parity rules

1. **Names**: camelCase everywhere (query params and JSON keys).
2. **Unknown fields**: Ignored on read paths (forwards-compatible clients).
3. **Arrays**: MCP uses JSON arrays; HTTP accepts repeated keys (`nodeTypes=skill&nodeTypes=mcp_tool`) **or** a single comma-separated value (`nodeTypes=skill,mcp_tool`). Adapters normalize to `string[]` before Zod.
4. **Numbers**: HTTP query strings parsed with `Number()`; invalid values → `400` Problem Details (adapter), not domain.
5. **Response**: `SkillGraphResult` — `nodes`, `edges`, `highRiskRefactorSequences`, optional `nextCursor`, `mapVersion`, `mapUpdated`.

## Pagination strategy

Graph pagination is **edge-centric** (not node-centric):

1. Build full node set and apply filters to edges (and derived node subsets).
2. Slice `filteredEdges` with `[cursor, cursor + limit)` where `cursor` defaults to `0` when absent or invalid.
3. Return only nodes incident to the **current edge page** (endpoints of page edges), then apply node-level filters.
4. Set `nextCursor` to `String(cursor + limit)` when more filtered edges remain; omit when exhausted.

Defaults and limits:

| Constant | Value | Rationale |
|----------|-------|-----------|
| `DEFAULT_EDGE_LIMIT` | 500 | Keeps MCP payloads and dashboard first paint bounded (NFR-004) |
| Max recommended `limit` | 2000 | Adapter may clamp; domain does not enforce upper bound today |

**Client guidance**

- Paginate with `cursor` from prior `nextCursor` until absent.
- Do not assume stable ordering across map file changes between requests.
- For UI “load more”, request next page with same filter set and new `cursor`.
- High-risk sequences are **not** paginated; always returned in full from map metadata (FR-015).

## Local graph depth limits

| Rule | Value |
|------|-------|
| Default `depth` | 1 (immediate neighbors) |
| Minimum `depth` | 1 (values &lt; 1 treated as 1 in domain) |
| Maximum `depth` | **3** (`Math.min(depth, 3)` in `neighbors()`) |
| Algorithm | BFS on filtered full graph; includes center node; collects edges touched per hop |

**Why cap at 3:** At 250 nodes / 1k edges, depth 3 can approach full graph density on hub nodes. Dashboard and agents should prefer `depth=1` for exploration, `depth=2` for impact preview, and full `getGraph` + filters for global analysis.

**Performance note:** `neighbors()` currently builds the **full** filtered graph in memory, then extracts the local subgraph (documented runway — optimize only if benchmarks fail).

## Representative filter combinations (NFR-004)

| Use case | Example filters |
|----------|-----------------|
| Skill-only subgraph | `nodeTypes: ["skill"]` |
| High-confidence coupling | `relationshipTypes: ["may_call_or_wrap"]`, `confidenceMin: 0.8` |
| Project scope | `scope: "project"` or `project: "ai-vault"` |
| Health overlay | `healthStatus: "warning"` |
| Paged export | `limit: 100`, follow `nextCursor` |
| Local impact | `graph_neighbors` with `nodeId: "skill:user:demo-skill"`, `depth: 1` |

## Path resolution and security (graph-related)

Graph DTOs expose paths as **POSIX strings** (`sourcePath`, evidence `sourceFile`) even on Windows hosts. Resolution and guard behavior live in `pathModel.ts` and `pathGuard.ts`; repositories call `assertPathUnderRoots` before reads (NFR-009).

### `pathModel.ts`

| Function | Role |
|----------|------|
| `toPosixPath(p)` | Normalize `\` → `/` for stable DTOs and logs |
| `normalizePathInput(p)` | `path.normalize` + trim on user/config input |
| `resolvePathInfo(raw, baseDir?)` | Returns `normalized`, `posix`, `resolved`, `resolvable` (exists on disk) |

### `pathGuard.ts`

| Function | Role |
|----------|------|
| `assertPathUnderRoots(target, allowedRoots)` | Resolves `target`; allows if under any root (`skillsRoot`, `skillSetRoot`); else `PathAccessError` |
| `isPathUnderRoots(target, allowedRoots)` | Non-throwing boolean wrapper |

### Edge-case catalog

| Case | Expected behavior |
|------|-------------------|
| Windows backslashes in config/env paths | Normalized via `path.normalize`; DTOs use `toPosixPath` |
| Mixed `C:\foo` and `/foo/bar` in overrides | Resolved with `path.resolve` relative to package/skills roots |
| Path equals root (`rel === ""`) | Allowed (root itself is readable) |
| Path escapes via `..` | Rejected when resolved path is outside all roots |
| Symlinks / junctions | Resolved to real path before relative check; escape attempts still fail |
| Non-existent map or index file | Repository or `resolvePathInfo.resolvable === false`; health findings, not graph crash |
| `SKILL_LAB_SKILLS_ROOT` override | Replaces default skills root; graph map path still under `relationshipMapRelativePath` from config |
| Evidence `source_file` in relationship map | Opaque relative string in graph edge; not re-resolved through path guard in graph layer |
| Skill `sourcePath` from catalog | Already POSIX relative path from catalog service |

### Graph node IDs (stable references)

Format: `{type}:{scope}:{name}` — e.g. `skill:user:skill-set`, `mcp_tool:external:fixture-mcp-server`.

Use `nodeId` verbatim in `graph_neighbors`; do not pass filesystem paths as `nodeId`.

## Benchmarks

Baseline timings for **250 skill nodes / 1,000 edges** live in `tests/graph-perf.test.ts`:

- **Fixture approach:** In-memory synthetic `RelationshipMapFile` + stub catalog (no disk I/O for map body). Scales to NFR-004 regardless of live repo size.
- **Thresholds:** Generous dev-laptop gates (full graph &lt; 2s, filtered/neighbors &lt; 1s). Failures indicate regression, not production SLO.
- **Live repo:** Optional smoke when `SKILL_LAB_SKILLS_ROOT` is set; skipped when graph smaller than threshold targets.

See `docs/architecture.md` for system context and milestone traceability.
