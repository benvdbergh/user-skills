# When something breaks

## 1) Read structured errors first

Failed MCP tool responses use a stable pattern (see `packages/engine/src/adapters/mcp/errors.mjs`):

```json
{
  "isError": true,
  "content": [{ "type": "text", "text": "CODE: message" }],
  "structuredContent": {
    "error": {
      "code": "VALIDATION_ERROR | EXECUTION_NOT_FOUND | INVALID_RESUME_PAYLOAD | ENGINE_FAILURE | INTERNAL_ERROR",
      "message": "...",
      "details": {}
    }
  }
}
```

Some hosts flatten this to plain text; **parse `code` when available**.

| Code | Meaning | Agent actions |
|------|---------|----------------|
| `VALIDATION_ERROR` | Bad tool arguments (Zod) or definition rejected at start/resume. | Fix args: non-empty `execution_id` where required; `definition` must be object; `resume_payload` object. For definition issues, re-run JSON Schema validation; read `details.issues` if present. |
| `EXECUTION_NOT_FOUND` | Unknown `execution_id` (typo, new server process, or expired in-memory store). | Re-`workflow_start` with a new id; ensure server was not restarted between calls. |
| `INVALID_RESUME_PAYLOAD` | Resume object does not satisfy `resume_schema` or wrong phase. | Compare payload to `interrupt` node’s `resume_schema`; ensure execution is still `interrupted`. |
| `ENGINE_FAILURE` | Engine reported workflow failure (including some post-resume failures). | Inspect `message` / engine error text; fix graph, inputs, or stub profile. |
| `INTERNAL_ERROR` | Unexpected adapter failure. | Retry once; if persistent, treat as defect and capture logs / repro for maintainers. |

## 2) Validation vs execution failures

- **Schema / AJV errors before start:** definition does not match `workflow-definition-poc.json` (wrong `type`, missing `edges`, forbidden reducer, extra top-level keys).
- **Start succeeds but `failed`:** runtime walk error (handler missing, jq evaluation, interrupt protocol, etc.). Use `error` on result or `last_error` from `workflow_status`.

## 3) Resume discipline

- Pass the **same** `definition` object used at start (identity matters for POC port behavior).
- `resume_payload` must validate against the **`resume_schema`** of the interrupting node.
- Do not call `workflow_resume` for executions that are `completed` or `failed`.

## 4) “Stuck” or lost executions

- **Server restart:** in-memory executions disappear → `EXECUTION_NOT_FOUND`. Start again.
- **No cancel MCP:** cannot stop a run via tool; only process control or waiting for natural completion/failure/interrupt.

## 5) Version skew

If validation passes locally but MCP rejects definitions, compare **engine package version** with the schema snapshot in **`assets/workflow-definition-poc.json`**. Refresh the asset or pin the npm package version.

## 6) Where to look in the upstream repo

- Smoke runbook: `docs/architecture/mcp-stdio-host-smoke.md`
- POC scope: `docs/poc-scope.md`
- Adapter tests: `packages/engine/test/mcp-stdio-adapter.test.mjs`
