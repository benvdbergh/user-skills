---
name: workflow-engine-mcp-design
description: >-
  Guides design, validation, execution, and recovery for Agent Workflow Protocol
  POC workflows through the @agent-workflow/engine MCP adapter. Use when the
  user mentions workflow-engine MCP, workflows-engine-mcp, workflow_start,
  workflow_status, workflow_resume, POC workflow JSON, interrupt/resume,
  lighthouse-style routing, or JSON Schema workflow-definition-poc. Covers
  in-scope node types, bundled as-built schema, MCP lifecycle limits, and
  structured adapter errors.
license: MIT
metadata:
  version: 1.0.1
  prior_art_note: >-
    Aligns with common MCP practice: narrow tool surface, schema-first payloads,
    explicit error codes, and skills-as-orchestrators over tools-as-capabilities.
---

# workflow-engine-mcp-design

Orchestrates **definition authoring** and **MCP operations** for the POC workflow engine. The engine exposes exactly three tools; there is no separate “design API” — workflows are **JSON documents** validated against the POC schema, then passed to `workflow_start` / `workflow_resume`.

## Topic map (progressive disclosure)

| Topic | Read |
|--------|------|
| Allowed nodes, edges, state, jq | `references/poc-feature-surface.md` |
| MCP tools, args, results, lifecycle, limits | `references/mcp-tools-and-lifecycle.md` |
| As-built schema path + validation commands | `references/schema-and-validation.md` |
| Error codes and recovery | `references/troubleshooting.md` |
| Ownership and handoffs | `references/skill-escalation.md` |

## Agent workflow (happy path)

1. Confirm **MCP tools exist** on the host (`workflow_start`, `workflow_status`, `workflow_resume`). If not, fix server config before designing graphs.
2. Draft **`definition`** using only POC node types; wire **`edges`**; define **`state_schema`** with allowed reducers only.
3. Validate against **`assets/workflow-definition-poc.json`** (see `references/schema-and-validation.md`).
4. Call **`workflow_start`** with parsed `definition`, `input`, optional `execution_id`.
5. If **`status` is `interrupted`**, gather human input, then **`workflow_resume`** with the **same** `definition`, `execution_id`, and a `resume_payload` matching `resume_schema`.
6. Use **`workflow_status`** for read-only phase and cursor inspection.

## MCP Dependencies

- **Server:** `@agent-workflow/engine` MCP stdio adapter (`workflows-engine-mcp`).
- **Primary tools:** `workflow_start`, `workflow_status`, `workflow_resume`.
- **Usage:** start or resume executions with inline JSON definitions; read phase and errors; no other workflow CRUD tools exist in POC.

**Host verification:** this skill does not assume a specific MCP client. Agents must use the host’s tool discovery to confirm the three tools are registered and named exactly as above.

## Tool Usage Mapping

| Step | MCP tool | Purpose | Safety |
|------|----------|---------|--------|
| Validate connectivity | (host discovery) | Confirm tools listed | Safe |
| Run / continue graph | `workflow_start`, `workflow_resume` | Execute workflow; advance from interrupt | Safe in dev; confirm side effects of `tool_call` nodes with user if they invoke external systems |
| Inspect only | `workflow_status` | Read `phase`, `current_node_id`, `last_error` | Safe |

## Tool Safety Policy

- **Safe:** `workflow_status`; `workflow_start` / `workflow_resume` on definitions the user approved, with no unexpected `tool_call` side effects.
- **Requires confirmation:** definitions containing `tool_call` to production MCPs or mutating APIs; changing `execution_id` mid-flight; pinning or upgrading engine package version in shared environments.
- **Never allowed:** fabricating `execution_id` to probe other users’ data (irrelevant on single-user stdio POC, but forbidden as policy); ignoring structured `VALIDATION_ERROR` details and retrying blindly in loops.

## Workflow routing

| Need | Action |
|------|--------|
| Schema / POC scope | `references/poc-feature-surface.md` + `assets/workflow-definition-poc.json` |
| MCP call shapes | `references/mcp-tools-and-lifecycle.md` |
| AJV / CI validation | `references/schema-and-validation.md` |
| Errors / stuck runs | `references/troubleshooting.md` |
| Boundaries | `references/skill-escalation.md` |

## Examples

**Example A — Design-only**

User: “Add a switch after triage for billing vs general.”  
Agent: edit nodes/edges and `switch` jq cases per `references/poc-feature-surface.md`; validate with schema asset; do not call MCP until the user asks to run.

**Example B — Full interrupt loop**

User: “Run the lighthouse workflow and continue after human review.”  
Agent: `workflow_start` with canonical fixture-shaped definition + input; on `interrupted` at review node, present prompt; on user choice, `workflow_resume` with same definition and schema-shaped `resume_payload`; verify `completed`.

**Example C — Diagnose missing execution**

User: “Resume says not found.”  
Agent: read `references/troubleshooting.md` → treat `EXECUTION_NOT_FOUND` as id mismatch or server restart; re-start with new `execution_id` if store was cleared.
