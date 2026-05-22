# Skill Lab — Architecture

Status: **R0.4 — Validation, Source Prompts & AI Proposals** (EPIC-4) is **implemented** on top of **R0.1–R0.3** (catalog, graph, health, read-only dashboard). Milestone gate: `tests/e2e-r04.test.ts`. Linear backlog: stories BEN-31–BEN-37; post-review hardening BEN-62–BEN-76 (`tracker-index.md`).

**Contract SSOT:** HTTP shapes and client rules → `docs/ui-api-compatibility.md`. Graph filters → `docs/graph-query-contract.md`. Product requirements → `spec/skill-lab-mcp-control-plane.md`.

## Milestone scope (R0.4)

| Story | Linear | Primary artifacts |
|-------|--------|-------------------|
| STORY-4-1 | BEN-31 | `PromptSourceService`, `SkillReferenceSource`, `templateSources.ts` |
| STORY-4-7 | BEN-36 | `AgentSessionRunner`, `RoutingAgentSessionRunner`, `ClaudeAgentSessionRunner`, `StubAgentSessionRunner` |
| STORY-4-2 | BEN-32 | `SkillValidationService`, validation HTTP/MCP |
| STORY-4-3 | BEN-33 | `mcp/prompts.ts`, `PromptActions` |
| STORY-4-4 | BEN-34 | `RelationshipSuggestionAdvisor` |
| STORY-4-5 | BEN-35 | `SkillImprovementAdvisor`, `ChangeProposalService`, `proposalValidation.ts` |
| STORY-4-6 | BEN-37 | Proposals workbench, `AgentSessionContext`, validation UI |

**In scope:** Lifecycle prompts from Git only (**NFR-012**, **AC-003**); structural lint + validation reports; MCP prompts; Claude Code agent sessions (subscription auth, headless/background); patch and relationship **proposals** via MCP ingest; workbench diff preview; session shell (status, logs, attach) — **no apply**, **no embedded chat**, **no relationship-map writes**.

**Out of scope (R0.5 / R1.0):** `apply_approved_patch`, gated index/map writes, Git commit UI, relationship Accept → `skill-relationships.json`, dirty-tree overlap on apply.

## System context

```text
┌─────────────┐     stdio      ┌────────────────────────────────────────────────────────┐
│ Cursor /    │◄──────────────►│ skill-set/mcp-server                                   │
│ Claude MCP  │                │  mcp/ (tools + prompts)    http/ (Hono + static web/)   │
└─────────────┘                │         \                  /                            │
                               │    domain/ · prompts/ · ai/ · git/ · repositories/    │
┌─────────────┐     HTTP       │  Catalog · Graph · Health · Validation · Proposals     │
│ Browser     │◄──────────────►│  PromptSourceService ──► skill-set/references/*.md     │
│ web/        │  127.0.0.1     │  AgentSessionRunner ──► claude CLI (-p / --bg)         │
└─────────────┘                └──────────┬───────────────────────┬──────────────────────┘
                                          │ read FS (path guard)  │ spawn + MCP ingest
                                          ▼                       ▼
                               ┌──────────────────────┐   ┌─────────────────────────┐
                               │ skills repo (Git)    │   │ .generated/ (ephemeral)   │
                               │ SKILL.md, indexes    │   │ reports/, proposals/,    │
                               │ maps, references     │   │ agent-sessions/         │
                               └──────────────────────┘   └─────────────────────────┘
```

Humans use the dashboard over HTTP; agents use MCP (tools, **prompts**, proposal ingest). Both adapters call the **same domain services** (**FR-038**, **NFR-011**). The browser never reads the skills filesystem — only `/api/*` (**FR-040**).

### Proposal lifecycle

```text
PromptBundle (PromptSourceService)
  → AgentSessionRunner.start (stub | claude-headless | claude-background)
  → Claude session with skill-lab MCP
  → propose_skill_patch / suggest_relationship_edges / detect_trigger_conflicts
  → ChangeProposalService (memory + optional .generated/proposals/)
  → HTTP poll + workbench diff (GitDiffService)
  → Apply deferred to R1.0
```

### Composition root (FR-038)

Service wiring must be **identical** for MCP and HTTP:

| Factory | Returns | Used by |
|---------|---------|---------|
| `createAgentServices` | `agent`, `proposals`, `prompts` | `cli.ts` (`serve` / `http`), **target:** `mcp/server.ts` |
| `createValidationServices` | `validation` (+ optional `agent` for deep validate) | HTTP routes, **target:** MCP `validate_skill` |
| Catalog/graph/health | Existing constructors | Both transports |

`RoutingAgentSessionRunner` selects `StubAgentSessionRunner` vs `ClaudeAgentSessionRunner` from `runtime` on the request (and from persisted session metadata on status/cancel). Tests and CI use stub only.

**Contract SSOT:** Zod in `src/domain/types.ts` → JSON Schema in `schemas/` → MCP tool `inputSchema` derived from the same Zod (not hand-maintained duplicates).

## Technology choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Node 20+, TypeScript | One stack for MCP + HTTP + UI tooling |
| MCP SDK | `@modelcontextprotocol/sdk` | Official SDK, stdio transport |
| HTTP | Hono | Lightweight; shared bootstrap with MCP |
| DTO validation | Zod | Runtime checks + JSON Schema mirrors |
| Frontmatter | `gray-matter` | YAML `SKILL.md` parsing |
| Tests | Vitest | Unit, fixture, milestone E2E |
| UI | `web/` — Vite + React 19 + React Router | Colocated; proxy `/api` in dev |
| Graph | `@xyflow/react` | Pan/zoom; caps via API filters (NFR-004) |

## Repository layout

```text
skill-set/mcp-server/
  src/
    config/
    domain/
      SkillCatalogService.ts, SkillGraphService.ts, SkillHealthService.ts
      SkillValidationService.ts, ChangeProposalService.ts, proposalValidation.ts
      types.ts
    prompts/
      PromptSourceService.ts, SkillReferenceSource.ts, templateSources.ts
    ai/
      AgentSessionRunner.ts          # port
      RoutingAgentSessionRunner.ts   # stub vs claude dispatch
      ClaudeAgentSessionRunner.ts, StubAgentSessionRunner.ts
      SkillImprovementAdvisor.ts, RelationshipSuggestionAdvisor.ts
    git/ GitStatusService.ts, GitDiffService.ts
    repositories/
    mcp/ tools.ts, prompts.ts, proposalTools.ts, resources.ts, server.ts
    http/
      api.ts, problemDetails.ts, queryParams.ts
      createAgentServices.ts, createValidationServices.ts
      routes/ validation.ts, proposals.ts, agentSessions.ts, prompts.ts
    cli.ts
  web/src/
    api/, routes/, components/, context/AgentSessionContext.tsx, hooks/
  schemas/   # lint, validation, patch, relationship, agent-session
  docs/      # architecture.md, ui-api-compatibility.md, graph-query-contract.md
  tests/     # e2e-r01 … e2e-r04, prompt-source, validation, proposals, agent-session
```

## Configuration

File: `skill-lab.config.json` or `skill-lab.config.local.json`.

| Field | Purpose |
|-------|---------|
| `skillsRoot` | User skills repository root |
| `skillSetRelativePath` | Default `skill-set` |
| `environmentMapRelativePath` | Default `skill-set/catalog/environment-skill-index-map.json` |
| `relationshipMapRelativePath` | Default `skill-set/maps/skill-relationships.json` |
| `writesEnabled` | Default `false` — gates report persistence and all writes (NFR-007) |
| `httpHost` / `httpPort` | Default `127.0.0.1` / `3847` |

Env: `SKILL_LAB_SKILLS_ROOT`, `SKILL_LAB_HTTP_PORT`.

**Path safety (NFR-009):** Every filesystem read under `skillsRoot` / `skillSetRoot` uses `assertPathUnderRoots()` (prompts, validation reports, proposal ingest, skill file reads). HTTP `detail` must not leak absolute host paths on 500 (**FR-040**).

## Domain services

### R0.1–R0.3 (foundation)

**SkillCatalogService** — environments, skill summaries/detail from indexes and `SKILL.md`.

**SkillGraphService** — `skill-relationships.json`; filters, pagination, local neighbors; high-risk overlay. Contract: `docs/graph-query-contract.md`.

**SkillHealthService** — catalog/index integrity checks; `HealthFinding` with `sourcePath`. **Target:** optional remediation fields on findings (`primaryAction`, `agentKind`) so the UI does not encode category→action policy (**FR-040**).

### PromptSourceService (BEN-31)

System of record = Git under `skillSetRoot` and per-skill trees. Templates declared in `templateSources.ts` only — **no** duplicated rubrics in TypeScript/React.

**`PromptBundleContext` (required fields by template):**

| Context field | When required |
|---------------|---------------|
| `skillMdRelativePath` | Any template with `targetSkillRefs` (e.g. `improve-skill-description`, `create-skill-escalation`, `validate-skill-effectiveness`) |
| `environmentId`, `skillName` | Session/advisor targets |
| `triggerCatalogText` | `analyze-trigger-conflicts` |

Callers (HTTP `/api/prompts/:promptId`, MCP prompts, tests, `AgentSessionRunner` task builders) must pass the **same** context shape.

### SkillValidationService (BEN-32)

Distinct from catalog **health** scan.

| Operation | MCP | Behavior |
|-----------|-----|----------|
| Lint | `lint_skill` | Deterministic rules from `references/lint.md` |
| Validate | `validate_skill` | Rubric from `validate.md`; `deep: true` may delegate to agent session |
| Persist | — | When `writesEnabled` + `persist: true` |

**Report store** under `{skillsRoot}/.generated/reports/{environmentId}/{skillName}/`:

| Artifact | Purpose |
|----------|---------|
| `{reportId}.json` | Immutable history |
| `latest-lint.json` | Pointer to latest lint report |
| `latest-validation.json` | Pointer to latest validation report |

`getLatest` and `GET .../latest` return `{ lint?, validation? }` when each pointer exists — **not** a single overwritten `latest.json`.

### AgentSessionRunner (BEN-36)

| Method | Contract |
|--------|----------|
| `checkAuth()` | Subscription status; never return tokens (NFR-010) |
| `start(request)` | **HTTP must reject** Claude runtimes when unauthenticated (fail fast at adapter) |
| `getStatus(sessionId)` | Status, `proposalIds`, log tail |
| `cancel(sessionId)` | Session-scoped only (PID / session id in manifest) — **never** unscoped `claude stop`; terminal status `cancelled` must win over exit race |

**Artifacts:** `.generated/agent-sessions/{id}/manifest.json` (include `pid` when spawned), `log.txt` (redacted).

| `runtime` | Implementation |
|-----------|----------------|
| `stub` | `StubAgentSessionRunner` — fixtures, CI |
| `claude-headless` / `claude-background` | `ClaudeAgentSessionRunner` |

### ChangeProposalService + advisors (BEN-34, BEN-35)

In-memory map + optional `.generated/proposals/{patchToken}.json`. **Ingest** validates `relativePath` (no `..`, no absolute paths outside skill scope) before persist.

| Advisor | Output |
|---------|--------|
| `RelationshipSuggestionAdvisor` | `RelationshipProposal`, `TriggerConflictReport` |
| `SkillImprovementAdvisor` | `PatchProposal` via `propose_skill_patch` |

Relationship edges require `evidence.quote` + `evidence.sourceFile`. **No** writes to `skill-relationships.json` or skill files in R0.4.

**List API target:** `GET /api/proposals?limit=&sessionId=` — bounded list, not full directory scan at scale.

## MCP surface (R0.4)

| Tool | Domain |
|------|--------|
| `get_skill_graph`, `graph_neighbors`, `check_catalog_health` | R0.2 services |
| `lint_skill`, `validate_skill` | `SkillValidationService` |
| `suggest_relationship_edges`, `detect_trigger_conflicts` | Relationship advisor |
| `propose_skill_patch` | `ChangeProposalService` |

**Prompts** (`mcp/prompts.ts`): bodies from `PromptSourceService` only (e.g. `skill-lab/improve-skill-description`).

**Resources:** environments, graph, health, validation latest, etc.

## HTTP API (R0.4)

Base: `http://127.0.0.1:{httpPort}`. Unversioned `/api/*`. Errors: RFC 9457 Problem Details — safe `detail` for clients.

### R0.3 (dashboard)

| Route | Method | Use |
|-------|--------|-----|
| `/api/environments` | GET | Environment switcher |
| `/api/skills` | GET | Catalog |
| `/api/skills/:environmentId/:skillName` | GET | Skill detail |
| `/api/graph` | GET | Graph explorer |
| `/api/graph/skill-relationship-counts` | GET | Catalog relationship column |
| `/api/graph/neighbors` | GET | Local graph, detail relationships |
| `/api/health/latest` | GET | Cached last scan |
| `/api/health` | POST | Run scan |
| non-`/api` GET | GET | SPA (`web/dist`) |

### R0.4 additions

| Route | Method | Use |
|-------|--------|-----|
| `/api/validation/:environmentId/:skillName` | POST | Lint / validate / both |
| `/api/validation/.../latest` | GET | Latest lint + validation pointers |
| `/api/validation/.../compare` | GET | Dimension deltas |
| `/api/prompts/:promptId` | GET | Prompt bundle for copy |
| `/api/agent/auth` | GET | Auth status (no secrets in body) |
| `/api/agent-sessions` | POST | Start session (auth gate) |
| `/api/agent-sessions/:id` | GET / DELETE | Status / cancel |
| `/api/proposals` | GET | List tokens (paginated) |
| `/api/proposals/:patchToken` | GET | Proposal detail |
| `/api/proposals/skill-patch` | POST | Patch proposal flow |
| `/api/proposals/relationships` | POST | Relationship / conflict proposals |
| `/api/git/diff` | GET | `?patchToken=` workbench preview |

Full client rules: `docs/ui-api-compatibility.md`.

## Dashboard (R0.3 shell + R0.4 features)

```text
web/src/routes/*  →  web/src/api/*  →  HTTP /api/*  →  domain/
```

**Allowed in React:** formatting, sort/filter UI state, graph layout, link URLs from API `sourcePath`, session shell UX.

**Forbidden in React:** parsing `SKILL.md`, relationship JSON, health/validation rules, graph BFS, path guards, remediation policy mapping (server-owned).

### Navigation

| Route | View |
|-------|------|
| `/` | Catalog; `?skill=` side panel |
| `/skills/:environmentId/:skillName` | Full-page detail |
| `/graph` | Graph explorer |
| `/health` | Health findings + agent CTAs from API fields |
| `/proposals` | **Enabled** workbench — Patches \| Relationships; `?patch=` deep link |

Global `?environmentId=` (**FR-041**). **AgentSessionProvider** (app root): single session state, `proposalListRevision` bump on terminal/ingest, `sessionReturnOrigin` set at `start()` for workbench “Return to skill” banner.

### Key UI flows

- **Skill detail:** `ValidationScorecard`, `PromptActions` (copy prompt), `AgentSkillActions` → start session → toast → `/proposals?patch=`
- **Proposals:** `ProposalList` | `ProposalDetail` + `ProposalDiffViewer`; `AgentSessionStrip`; Apply disabled (`R1.0`)
- **Settings:** `SettingsAiStrip` — auth + runtime preference

**Quality gate:** `web` runs `tsc --noEmit` in CI alongside `vite build`.

## Process bootstrap

```text
cli.ts
  mcp    → loadConfig → createAgentServices + createValidationServices → McpServer
  http   → loadConfig → same factories → createApi → serve localhost
  serve  → http + static web/dist
  doctor → config + catalog counts
```

`writesEnabled` gates `.generated` writes.

## Dependency direction

```text
web/  →  http/ (fetch only)
mcp/, http/  →  domain/, prompts/, ai/  →  repositories/  →  config/
```

No `domain/` imports from adapters or `web/`.

## NFR gates

| NFR | R0.4 expectation |
|-----|------------------|
| NFR-002 | Lint &lt;5s; health scan &lt;5s |
| NFR-004 | Graph filters + proposal list limits |
| NFR-007 | No apply; `writesEnabled` gates persistence |
| NFR-009 | Path guard on all FS reads |
| NFR-010 | Redacted logs; auth without tokens |
| NFR-011 | MCP structuredContent === HTTP JSON |
| NFR-012 | Prompts only via `PromptSourceService` |

## Story dependency chain

```text
BEN-31 → BEN-36, BEN-32, BEN-33
BEN-36 + BEN-31 → BEN-34, BEN-35
BEN-34 + BEN-35 + BEN-36 + BEN-32 + BEN-33 → BEN-37
```

## R0.5+ (out of scope)

Gated writes, `apply_approved_patch`, Git review UI, relationship Accept → map file (EPIC-5 / R1.0).
