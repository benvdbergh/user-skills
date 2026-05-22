# R0.4 test gates (EPIC-4 / BEN-75)

## Milestone E2E (`e2e-r04.test.ts`)

End-to-end acceptance for R0.4 sign-off:

- NFR-012 / AC-003: prompts from Git via `PromptSourceService`
- FR-038: HTTP validation, agent sessions, proposals, prompts
- AC-006–007: relationship evidence and patch diff preview
- AC-008: `writesEnabled: false` — skill files unchanged after proposals
- MCP prompts register without hardcoded bodies
- Proposals nav enabled in Sidebar

Does **not** run `web:build` (see `web-build.test.ts`).

## Layout manifest (`e2e-r04-layout.test.ts`)

Filesystem presence for R0.4 modules — catches accidental deletes; not a behavior gate.

## CI quality runway (NFR-011, NFR-007, NFR-009, NFR-010)

| File | Gates |
|------|--------|
| `mcp-smoke.test.ts` | `lint_skill`, `propose_skill_patch` MCP executors; NFR-011 HTTP parity |
| `schema-contract.test.ts` | Zod ↔ `schemas/*.json` on fixture payloads |
| `security.test.ts` | Patch `../` rejection; `/api/agent/auth` no secrets; persist blocked when `writesEnabled: false` |

Depends on BEN-62 (green suite), BEN-66 (path guards), BEN-71 (patch path validation) for full pass.
