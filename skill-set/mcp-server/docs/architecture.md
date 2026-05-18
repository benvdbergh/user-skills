# Skill Lab — Gate 2 Architecture Decisions

Status: **Build Ready** for R0.1 foundation (EPIC-1).

## System context

```text
┌─────────────┐     stdio      ┌──────────────────────┐
│ Cursor /    │◄──────────────►│ skill-set/mcp-server │
│ Claude MCP  │                │  (TypeScript)        │
└─────────────┘                └──────────┬───────────┘
                                          │ read-only FS
                                          ▼
                               ┌──────────────────────┐
                               │ skills repo (Git)    │
                               │ skill-index.json     │
                               │ SKILL.md, catalogs   │
                               └──────────────────────┘
```

Humans use the dashboard (R0.3) over HTTP; agents use MCP. Both share **domain services** (`SkillCatalogService`, etc.) — **FR-038**.

## Technology choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Node 20+, TypeScript | Spec default; one stack for MCP + future HTTP/UI |
| MCP SDK | `@modelcontextprotocol/sdk` | Official SDK, stdio transport |
| HTTP (R0.2+) | Hono | Lightweight, same process as MCP bootstrap |
| DTO validation | Zod | Runtime checks + JSON-schema export path |
| Frontmatter | `gray-matter` | Matches YAML `SKILL.md` parsing needs |
| Tests | Vitest | Fast unit + fixture tests |
| UI location | `mcp-server/web/` (later) | Spec recommendation; split only if UI complexity grows |

## Repository layout

Matches `spec/skill-lab-mcp-control-plane.md` § Proposed Repository Layout.

## Configuration

File: `skill-lab.config.json` or `skill-lab.config.local.json` in package root.

| Field | Purpose |
|-------|---------|
| `skillsRoot` | User skills repository root (parent of `skill-set/`) |
| `skillSetRelativePath` | Default `skill-set` |
| `environmentMapRelativePath` | Default `skill-set/catalog/environment-skill-index-map.json` |
| `writesEnabled` | Default `false` (NFR-007) |
| `environmentOverrides` | Per-env path overrides (Open Question #3) |

Env override: `SKILL_LAB_SKILLS_ROOT`.

**Path safety (NFR-009):** All reads go through `assertPathUnderRoots()` against `[skillsRoot, skillSetRoot]`.

## Shared DTOs

Zod schemas in `src/domain/types.ts`; JSON Schema mirrors in `schemas/`:

- `skill-summary.schema.json`
- `skill-detail.schema.json`
- `health-finding.schema.json`

MCP tools return `structuredContent` matching these shapes (**NFR-011**).

## HTTP API (R0.2)

REST under `/api/*`; Problem Details (RFC 9457) for errors; same DTOs as MCP. Version prefix deferred until first breaking change.

## Write confirmation (EPIC-5 / STORY-5-2)

Design for gated writes:

1. `writesEnabled: false` in config — write tools absent or return `403` with stable error type.
2. Two-step apply: `propose_*` returns `patchToken`; `apply_approved_patch` requires `confirmation: { token, acknowledged: true }`.
3. HTTP: header `X-Skill-Lab-Confirm: <token>` on POST apply routes.
4. Every write returns change summary + paths touched for Git diff review (**NFR-008**).

## Open questions (recorded)

| # | Decision for MVP |
|---|------------------|
| 1 Local vs remote | Local-only; bind HTTP to localhost in R0.2 |
| 2 Report storage | `skill-set/mcp-server/.generated/reports/` (gitignored) |
| 4 Multi-repo | Single `skillsRoot`; inventories via environment map |
| 6 Write tools | Present in schema but disabled until `writesEnabled` |

## Dependency direction

```text
mcp/, http/  →  domain/  →  repositories/  →  config/
```

No domain imports from MCP or HTTP adapters.
