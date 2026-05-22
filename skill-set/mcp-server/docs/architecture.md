# Skill Lab — Architecture Decisions

Status: **Delivered** for **R0.4 — Validation, Source Prompts & AI Proposals** (EPIC-4). **R0.1–R0.3** (catalog, graph, health, read-only dashboard) were prerequisite. Milestone gate: `tests/e2e-r04.test.ts` (123 tests total in package).

## Milestone scope (R0.4)

| Story | Linear | Component | Spec trace |
|-------|--------|-----------|------------|
| STORY-4-1 | BEN-31 | `PromptSourceService`, `SkillReferenceSource`, prompt DTOs | FR-037, NFR-012, **AC-003** |
| STORY-4-7 | BEN-36 | `AgentSessionRunner`, Claude auth, session HTTP, `.generated/` paths | FR-024–025, NFR-010, OQ #5 ADR |
| STORY-4-2 | BEN-32 | `SkillValidationService`, lint/validate MCP + HTTP | US-012–014, FR-021–025 |
| STORY-4-3 | BEN-33 | MCP prompts from loader, `PromptActions` copy | FR-037, NFR-012 |
| STORY-4-4 | BEN-34 | `RelationshipSuggestionAdvisor`, relationship proposals | FR-027–028, **AC-006** |
| STORY-4-5 | BEN-35 | `SkillImprovementAdvisor`, `ChangeProposalService`, patch proposals | FR-026, FR-029–030, **AC-007** (preview) |
| STORY-4-6 | BEN-37 | Proposal workbench, agent session shell, validation UI | FR-039, FR-040, FR-032 (read) |

**R0.4 in scope:** Load lifecycle prompts from Git (**no duplicated registry**); structural lint + validation reports; MCP prompts; **Claude Code** agent sessions (subscription auth, headless/background); relationship and skill **patch proposals** ingested via MCP; workbench with diff preview; session shell (status, logs, attach) — **no apply**, **no embedded chat**, **no relationship-map writes**.

**Out of scope (R0.5 / R1.0):** `apply_approved_patch`, gated index/map regeneration writes, Git commit UI, relationship Accept → `skill-relationships.json`, dirty-tree overlap on apply.

**Exit criteria:** `skill-lab serve` → dashboard runs validation on a skill, starts an agent session (or stub in CI), receives patch/relationship proposals with citations, previews diff in workbench — all via HTTP/MCP domain services (**FR-038**, **AC-003**, **AC-006**, **AC-007** partial, **AC-008**). Milestone gate: `tests/e2e-r04.test.ts`.

## Prior milestone (R0.3 — delivered)

Read-only dashboard: catalog, skill detail, graph, health; environment switching; source links. Gate: `tests/e2e-r03.test.ts` (**AC-004**).

## System context (R0.4 target)

```text
┌─────────────┐     stdio      ┌────────────────────────────────────────────────────────┐
│ Cursor /    │◄──────────────►│ skill-set/mcp-server                                   │
│ Claude MCP  │                │  mcp/ (tools + prompts)    http/ (Hono + static web/)   │
└─────────────┘                │         \                  /                            │
                               │          domain/ + prompts/ + ai/ + git/               │
┌─────────────┐     HTTP       │  Catalog · Graph · Health · Validation · Proposals     │
│ Browser     │◄──────────────►│  PromptSourceService ──► skill-set/references/*.md     │
│ dashboard   │  localhost     │  AgentSessionRunner ──► claude CLI (-p / --bg)         │
│ web/        │                └──────────┬───────────────────────┬──────────────────────┘
└─────────────┘                          │ read FS (path guard)  │ spawn + MCP ingest
                                          ▼                       ▼
                               ┌──────────────────────┐   ┌─────────────────────────┐
                               │ skills repo (Git)    │   │ .generated/ (ephemeral)   │
                               │ SKILL.md, indexes    │   │ reports/, proposals/,   │
                               │ maps, references     │   │ agent-sessions/         │
                               └──────────────────────┘   └─────────────────────────┘
```

Humans use the dashboard over HTTP; agents use MCP (including **prompts** and **proposal tools**). Both adapters share domain services — **FR-038**. The browser never reads the skills filesystem — only `/api/*` (**FR-040**).

**Proposal lifecycle (R0.4):** `PromptBundle` → `AgentSessionRunner.start` → Claude session with skill-lab MCP → `propose_skill_patch` / relationship tools → `ChangeProposalService` → HTTP poll → workbench diff preview. Apply deferred to R1.0.

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

## Repository layout (R0.4 target)

```text
skill-set/mcp-server/
  src/
    config/
    domain/
      SkillCatalogService.ts
      SkillGraphService.ts
      SkillHealthService.ts
      SkillValidationService.ts     # BEN-32
      ChangeProposalService.ts      # BEN-35
      types.ts                      # + prompt, validation, proposal, session DTOs
    prompts/
      PromptSourceService.ts        # BEN-31
      SkillReferenceSource.ts
    ai/
      AgentSessionRunner.ts         # port (BEN-36)
      ClaudeAgentSessionRunner.ts
      StubAgentSessionRunner.ts     # tests / CI
      SkillImprovementAdvisor.ts    # BEN-35
      RelationshipSuggestionAdvisor.ts # BEN-34
    git/
      GitStatusService.ts           # BEN-37 read paths
      GitDiffService.ts
    repositories/
    mcp/
      tools.ts                      # + lint, validate, proposals
      prompts.ts                    # BEN-33
      resources.ts                  # + validation latest
    http/
      api.ts
      routes/
        validation.ts               # BEN-32
        proposals.ts                # BEN-34–35
        agentSessions.ts            # BEN-36
        git.ts                      # BEN-37 read
      problemDetails.ts
      queryParams.ts
    cli.ts
  web/
    package.json
    vite.config.ts                  # proxy /api → httpPort
    index.html
    src/
      main.tsx
      App.tsx                       # shell + router
      api/
        client.ts
        catalog.ts
        graph.ts
        health.ts
        validation.ts               # BEN-32
        proposals.ts                # BEN-34–35
        agent.ts                    # BEN-36
        git.ts                      # BEN-37
      components/
        SourceLink.tsx
        CitationChip.tsx            # BEN-31/32/37 — FR-042
        EnvironmentSwitcher.tsx
        Layout.tsx, Sidebar.tsx, TopBar.tsx
        SkillDetailPanel.tsx, SkillDetailContent.tsx
        ValidationScorecard.tsx     # BEN-32
        PromptActions.tsx             # BEN-33
        ProposalList.tsx            # BEN-37
        ProposalDetail.tsx
        ProposalDiffViewer.tsx
        ProposalToolbar.tsx
        RelationshipProposalCard.tsx  # BEN-34
        AgentSessionStrip.tsx         # BEN-37
        SettingsAiStrip.tsx           # BEN-36
      routes/
        CatalogPage.tsx, SkillDetailPage.tsx, GraphPage.tsx, HealthPage.tsx
        ProposalsPage.tsx             # BEN-37 workbench (enabled)
      hooks/
  schemas/
    lint-report.schema.json
    validation-report.schema.json
    patch-proposal.schema.json
    relationship-proposal.schema.json
    agent-session.schema.json
  docs/
    architecture.md
    graph-query-contract.md
    ui-api-compatibility.md         # + R0.4 endpoints
  tests/
    e2e-r01.test.ts … e2e-r03.test.ts
    e2e-r04.test.ts                 # R0.4 milestone gate
    prompt-source.test.ts
    validation.test.ts
    proposals.test.ts
    agent-session.test.ts
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

### Shell and navigation (STORY-3-1, STORY-3-8)

```text
┌──────────────┬────────────────────────────────────────┐
│ Sidebar      │ TopBar (breadcrumb, env context)       │
│ · brand      ├────────────────────────────────────────┤
│ · env switch │ Main workspace                         │
│ · nav        │  · route page (catalog / graph / …)    │
│ · health pip │  · optional skill detail panel (right) │
└──────────────┴────────────────────────────────────────┘
```

| Route | View | API |
|-------|------|-----|
| `/` | Catalog (default); `?skill=` opens side panel | `GET /api/environments`, `GET /api/skills` |
| `/skills/:environmentId/:skillName` | Skill detail (fullscreen / shareable) | `GET /api/skills/:environmentId/:skillName`, graph neighbors |
| `/graph` | Graph explorer | `GET /api/graph`, `GET /api/graph/neighbors` |
| `/health` | Health findings | `POST /api/health` |
| `/proposals` | R0.4 proposals sketch (disabled actions) | — |

Global **environment filter** via `?environmentId=` on any route: **FR-041**. Sidebar health pip reflects catalog row health counts and last health-scan summary when available.

**Skill detail (hybrid, STORY-3-10):** Catalog row sets `?skill={environmentId}/{skillName}` and opens a **side panel** without losing filters. Full-page route remains for deep links. Skill names may contain `/`; use `?skill=` for those — see `docs/ui-api-compatibility.md`.

### Catalog view (STORY-3-2)

- Fetch skills for selected environment (or all environments with env column).
- Client search across name, description, triggers; filter chips for scope, tier, health status (and project when present on summary).
- Columns: name, scope, environment, tier, trigger/workflow counts, health badge.
- Row click → `?skill=` side panel (filters preserved); “Full page” / direct URL → `/skills/...` route.
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

## R0.4 — Validation, Source Prompts & AI Proposals (EPIC-4)

Linear milestone: [R0.4](https://linear.app/ben-van-den-bergh/project/skill-lab-987d87409e04/overview#milestone-3fb872a1-eb37-474e-be38-38dde65ab96a). Backlog SSOT: Linear BEN-31–BEN-37 (`tracker-index.md`). Spec: `spec/skill-lab-mcp-control-plane.md` § Source Prompt and Reference Reuse Model.

### ADR: Agent sessions and proposal shapes

| Decision | Choice |
|----------|--------|
| Inference | **Claude Code** (`claude` CLI): headless `-p` or background `--bg`; subscription via `claude auth` — Skill Lab does **not** require `ANTHROPIC_API_KEY` |
| Orchestration | `AgentSessionRunner` spawns sessions with **skill-lab MCP**; proposals ingested via `propose_skill_patch` / `suggest_relationship_edges` / `detect_trigger_conflicts` |
| Skill proposals | `PatchProposal`: `fileChanges[]` + `patchToken` + `citations[]` + unified diff metadata — default scope `SKILL.md` / `references/skill-escalation.md` |
| Relationship proposals | `RelationshipProposal` / `TriggerConflictReport` — structured edges, **not** skill Git diff |
| MCP prompts | **Session input** from `PromptSourceService` — deliverables remain MCP tool outputs |
| Dashboard | **Session shell** (auth, runtime, status, log tail, attach) — **no** embedded chat |
| Generated paths | `{skillsRoot}/.generated/reports/{env}/{skill}/`, `agent-sessions/{id}/`, `proposals/` (or in-memory tokens in dev) |
| Tests | `StubAgentSessionRunner` returns fixture proposals without calling `claude` |

### PromptSourceService (BEN-31)

**Bounded context:** Governance / prompt sources — system of record = Git under `skillSetRoot` and per-skill trees.

| Source | Path pattern |
|--------|----------------|
| Skill-set lifecycle | `skill-set/SKILL.md`, `references/*.md`, `assets/*.md` |
| Target skill | `{skillRoot}/SKILL.md`, `references/`, `scripts/`, `assets/` metadata |

**API:** `loadPromptSource(ref)`, `buildPromptBundle(templateId, context)`, `resolveCitations(refs)`.

**Types (Zod in `domain/types.ts`):**

| Type | Fields (summary) |
|------|------------------|
| `PromptSourceRef` | `relativePath`, `sectionHeading?` |
| `LoadedPromptSection` | `ref`, `content`, `heading?` |
| `SourceCitation` | `sourcePath`, `heading?`, `quote?` |
| `PromptBundle` | `templateId`, `sections[]`, `sourceRefs[]`, `assembledPrompt` |

**Consumers:** `SkillValidationService`, `AgentSessionRunner` task builders, `mcp/prompts.ts`, advisors (citations only).

**No-go:** Hardcoded lifecycle rubrics in TypeScript or React; second prompt registry.

### SkillValidationService (BEN-32)

Distinct from **catalog health** (`SkillHealthService`).

| Operation | MCP tool | Behavior |
|-----------|----------|----------|
| Structural lint | `lint_skill` | Deterministic checks from `references/lint.md` rules (no LLM) |
| Content validate | `validate_skill` | Rubric from `validate.md` + `effectiveness-assessment.md`; optional agent session for deep pass |
| Persist report | — | `.generated/reports/{environmentId}/{skillName}/{reportId}.json` when `writesEnabled` + `persist: true` |

**Types:** `LintReport`, `ValidationReport`, `ValidationDimensionScore`, `ValidationFinding`.

**HTTP:**

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/validation/:environmentId/:skillName` | POST | Run lint and/or validate (`mode`: `lint` \| `validate` \| `both`) |
| `/api/validation/:environmentId/:skillName/latest` | GET | Latest persisted report |
| `/api/validation/:environmentId/:skillName/compare` | GET | `?beforeId=&afterId=` — dimension deltas (**US-014**) |

**Resource:** `skill-lab://validation/{environmentId}/{skillName}/latest`

### MCP prompts (BEN-33)

Registered in `mcp/prompts.ts`; bodies from `PromptSourceService` only.

| Prompt name | Source refs (typical) |
|-------------|----------------------|
| `skill-lab/improve-skill-description` | `optimize.md`, `authoring-guide.md` |
| `skill-lab/create-skill-escalation` | `authoring-guide.md`, skill `SKILL.md` |
| `skill-lab/validate-skill-effectiveness` | `validate.md`, `effectiveness-assessment.md` |
| `skill-lab/suggest-relationships` | `synthesize.md`, relationship map context |
| `skill-lab/analyze-trigger-conflicts` | catalog triggers + `lint.md` |
| `skill-lab/synthesize-new-skill` | `synthesize.md`, `authoring-guide.md` |

**UI:** `PromptActions.tsx` on skill detail — **Copy prompt** only; no in-browser agent execution.

### AgentSessionRunner (BEN-36)

**Port** (`src/ai/AgentSessionRunner.ts`):

```ts
checkAuth(): Promise<AgentAuthStatus>
start(request: AgentTaskRequest): Promise<AgentSession>
getStatus(sessionId: string): Promise<AgentSessionStatus>
cancel?(sessionId: string): Promise<void>
```

| Field | Values |
|-------|--------|
| `runtime` | `claude-headless` \| `claude-background` \| `stub` (tests) |
| `kind` | `improve-skill`, `create-escalation`, `validate-skill`, `suggest-relationships`, `analyze-trigger-conflicts`, `skill-patch`, … |
| `target` | `environmentId`, `skillName`, optional `promptTemplateId` |

**Artifacts:** `.generated/agent-sessions/{id}/manifest.json`, `log.txt` (secrets redacted — **NFR-010**).

**HTTP:**

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/agent/auth` | GET | Proxy `claude auth status` |
| `/api/agent-sessions` | POST | Start session |
| `/api/agent-sessions/:id` | GET | Status, `proposalIds`, log tail |
| `/api/agent-sessions/:id` | DELETE | Cancel (`claude stop` when applicable) |

### ChangeProposalService + advisors (BEN-34, BEN-35)

**ChangeProposalService:** in-memory map + optional `.generated/proposals/{patchToken}.json`; issues tokens; serves GET by token.

| Advisor | Session kind | MCP ingest | Output |
|---------|--------------|------------|--------|
| `RelationshipSuggestionAdvisor` | `suggest-relationships` | `suggest_relationship_edges` | `RelationshipProposal[]` |
| `RelationshipSuggestionAdvisor` | `analyze-trigger-conflicts` | `detect_trigger_conflicts` | `TriggerConflictReport` |
| `SkillImprovementAdvisor` | `improve-skill`, `create-escalation`, `skill-patch` | `propose_skill_patch` | `PatchProposal` |

**Validation rules:**

- Relationship edges require `evidence.quote` + `evidence.sourceFile`; reject otherwise.
- Patch proposals require non-empty `fileChanges[]` unless `kind: prompt-export`.
- **No** writes to `skill-relationships.json` or skill files in R0.4.

**HTTP:**

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/proposals/skill-patch` | POST | Start or return `PatchProposal` (may delegate to agent session) |
| `/api/proposals/relationships` | POST | Relationship + trigger conflict proposals |
| `/api/proposals/:patchToken` | GET | Fetch stored proposal |
| `/api/git/status` | GET | Repo status for workbench context |
| `/api/git/diff` | GET | `?patchToken=` unified diff preview (**FR-032**) |

### Proposal workbench UI (BEN-37)

| Route | View |
|-------|------|
| `/proposals` | List + detail; tabs **Patches** \| **Relationships** |
| `/proposals?patch={token}` | Deep link to patch detail + diff pane |

**Components:** two-column layout — `ProposalList` | `ProposalDetail` + `ProposalDiffViewer`; `AgentSessionStrip` for active session; Apply disabled (`title="R1.0"`); Export/Ignore via `sessionStorage` until server persistence.

**Skill detail actions:** Improve description, Draft escalation → start session → toast → navigate `?patch=`. **Health:** Suggest fix → same flow.

### Shared DTOs (R0.4 additions)

All Zod-validated; JSON Schema mirrors under `schemas/`; MCP `structuredContent` === HTTP JSON (**NFR-011**).

| DTO | Use |
|-----|-----|
| `PatchProposal`, `ProposedFileChange`, `PatchToken` | Workbench, `propose_skill_patch` |
| `RelationshipProposal`, `SuggestedEdge`, `EvidenceQuote` | Graph proposals tab |
| `TriggerConflict`, `TriggerConflictReport` | Overlap analysis |
| `AgentSession`, `AgentAuthStatus`, `AgentTaskRequest` | Session shell |
| `LintReport`, `ValidationReport` | Skill detail validation section |

### MCP tools (R0.4 additions)

| Tool | Writes? |
|------|---------|
| `lint_skill` | No |
| `validate_skill` | Optional report file when gated |
| `suggest_relationship_edges` | No |
| `detect_trigger_conflicts` | No |
| `propose_skill_patch` | No (stores proposal token only) |

### Process bootstrap (R0.4)

```text
cli.ts
  mcp    → … + PromptSourceService + Validation + ChangeProposal + register prompts
  http   → createApi({ catalog, graph, health, validation, proposals, agent, git })
  serve  → same + static web/
```

`loadConfig` unchanged; `writesEnabled` gates report persistence and future apply.

### NFR gates (R0.4)

| NFR | Target |
|-----|--------|
| NFR-012 | All lifecycle rubrics loaded via `PromptSourceService`; AC-003 E2E asserts no duplicate registry strings in `src/` |
| NFR-010 | Agent logs redact env secrets; auth status never returns tokens |
| NFR-007 | Apply tools absent/disabled; proposal routes do not mutate Git skill files |
| NFR-002 | Lint path stays &lt;5s; validate-without-LLM ditto |

### Story dependency chain (implementation order)

```text
BEN-31 (PromptSourceService)
  ├── BEN-36 (AgentSessionRunner + auth)
  ├── BEN-32 (Validation)
  └── BEN-33 (MCP prompts)
BEN-36 + BEN-31
  ├── BEN-34 (Relationship proposals)
  └── BEN-35 (Skill patch proposals)
BEN-34 + BEN-35 + BEN-36 + BEN-32 + BEN-33 → BEN-37 (Workbench + session shell)
```

## R0.5+ (out of scope for R0.4)

- Gated writes, `apply_approved_patch`, Git review UI, relationship Accept → map file (EPIC-5 / R1.0).
