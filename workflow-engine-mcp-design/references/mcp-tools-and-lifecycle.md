# MCP tools and lifecycle (@agent-workflow/engine)

## Server identity

Published stdio server package: **`@agent-workflow/engine`** (bin `workflows-engine-mcp`). Server name in MCP metadata: `@agent-workflow/engine-mcp-stdio`.

**Before relying on tools in a session:** confirm the host has registered the server and lists **`workflow_start`**, **`workflow_status`**, **`workflow_resume`**. If any are missing, stop and fix MCP config first.

## Operator configuration (typical)

```json
{
  "mcpServers": {
    "workflow-engine": {
      "command": "npx",
      "args": ["-y", "-p", "@agent-workflow/engine@alpha", "workflows-engine-mcp"]
    }
  }
}
```

Pin a concrete version instead of `@alpha` when reproducibility matters. Development alternative: run `node` against `packages/engine/src/mcp-stdio-server.mjs` in a clone (absolute path in host config).

## Tool contracts (transport layer)

Source of truth in engine: `packages/engine/src/adapters/mcp/contracts.mjs` (Zod). Shapes below match that module.

### `workflow_start`

**Input**

| Field | Required | Notes |
|--------|----------|--------|
| `definition` | Yes | Parsed JSON **object** for the entire workflow document (not a file path string). |
| `input` | Yes | Object matching the workflow’s expected start input (may be empty object `{}` if allowed). |
| `execution_id` | No | Stable string id; omit to let the engine assign one. |

**Structured result**

| Field | Notes |
|--------|--------|
| `execution_id` | Canonical id for follow-up calls. |
| `status` | One of: `completed`, `failed`, `interrupted`. |
| `node_id` | Present when paused at an `interrupt` (typical when `status` is `interrupted`). |
| `final_state` / `result` / `error` | Populated depending on terminal outcome. |

Runs validation then execution. A graph may run to completion, fail, or **pause at an `interrupt` node** with `interrupted`.

### `workflow_status`

**Input:** `{ "execution_id": "<id>" }` (required, non-empty string).

**Structured result**

| Field | Notes |
|--------|--------|
| `execution_id` | Echo. |
| `phase` | One of: `running`, `completed`, `failed`, `interrupted`. |
| `current_node_id` | Optional cursor. |
| `last_error` | Optional last failure message. |

### `workflow_resume`

**Input**

| Field | Required | Notes |
|--------|----------|--------|
| `execution_id` | Yes | Must match the interrupted run. |
| `definition` | Yes | **The same parsed object** as used in `workflow_start` for that logical workflow (byte-identical preferred). |
| `resume_payload` | Yes | Object satisfying the `interrupt` node’s `resume_schema`. |

**Structured result:** same shape family as `workflow_start` (`status`, optional `node_id`, `final_state`, `result`, `error`).

## Lifecycle playbook for agents

1. **Author** workflow JSON (see `references/poc-feature-surface.md` and `assets/workflow-definition-poc.json`).
2. **Validate** locally if possible (`references/schema-and-validation.md`).
3. **`workflow_start`** with `definition` + `input`; capture `execution_id` and `status`.
4. If **`interrupted`**: inspect `node_id`, present human prompt text from the definition if needed, collect payload, then **`workflow_resume`** with same `definition`, `execution_id`, and `resume_payload`.
5. Poll **`workflow_status`** when the host needs phase or cursor without advancing execution.
6. On **`failed`**, use `error` / `last_error` and troubleshooting reference.

## What is *not* in the MCP surface (POC)

- **No `workflow_cancel` / `workflow_stop` tool** — cannot request cancellation through MCP. Stopping the server process abandons in-memory executions.
- **No persistence guarantee** — default stdio entrypoint uses an **in-memory** store; restart loses executions.
- **Interrupt ≠ generic cancel** — `interrupt` is a **graph node** that raises a protocol interrupt; resume is the supported continuation path.

## Security / posture (POC)

Local stdio, no auth in adapter, single-process memory. Do not treat as multi-tenant or durable execution fabric without additional product hardening.
