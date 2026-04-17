# POC feature surface (workflow definitions)

Normative scope for what the engine and MCP adapter accept is **`docs/poc-scope.md`** in the Agent Workflow Protocol repository. This file is a **working summary** for agents; when in doubt, reconcile with that note and RFC-03 / RFC-04.

## Top-level document (required)

| Field | Notes |
|--------|--------|
| `document` | `schema`, `name`, `version` required; optional `description`. Bump `document.version` when the definition changes materially. |
| `state_schema` | JSON object (JSON Schema for workflow state); bundled schema requires **at least one** top-level property (`minProperties: 1`). Reducers: `overwrite` (default), `append`, `merge` only. **`custom` is not POC.** |
| `nodes` | Non-empty array. |
| `edges` | Directed edges `{ "source", "target" }`. Synthetic `__start__` allowed per RFC POC usage. The JSON Schema allows an **empty** `edges` array; a **runnable** graph still needs real edges (see **Graph topology** below). |

**`additionalProperties: false` on the workflow root** — do not add arbitrary top-level keys (e.g. `extensions`); JSON Schema validation rejects unknown top-level properties in the POC bundle.

**Optional:** `checkpointing` object may appear; persistence behavior is engine-specific and may be partial in early milestones.

## Node types supported in POC

| `type` | Role |
|--------|------|
| `start` | RFC POC summary: at most one per document. **`@agent-workflow/engine` MCP** (`runPocWorkflow` in `packages/engine/src/orchestrator/poc-runner.mjs`) requires **exactly one** `start` node. Optional `config.input_schema`. |
| `end` | Terminal; optional `output_schema` / `output_mapping` (jq string). Engine requires **exactly one** `end` node and **no outgoing edges** from its id. |
| `step` | Deterministic activity; `config` must include **`handler` or `code_ref`** (implementation profile). |
| `llm_call` | Model invocation shape; may be stubbed in demos. |
| `tool_call` | External tool; POC fixtures use MCP-shaped `config`: `server`, `tool`, optional `arguments` object. |
| `switch` | `config.cases[]` with jq `when` and `target` node id; optional `config.default`. **Traversal:** the walker routes **only** via `cases` / `default`; **static `edges` from the `switch` node id are ignored** (see file comment in `poc-runner.mjs`). If `cases` is non-empty and no `when` matches, **`config.default` is required** or the run fails. Prefer `cases` + `default` over relying on static edges for successors. |
| `interrupt` | Human-in-the-loop; `config.resume_schema` required; **`prompt` or `prompt_ref`** (POC schema) required per `anyOf`. Optional **`config.timeout`** (string) for interrupt-specific policy; **node-level** `timeout` / `retry` / `metadata` are also allowed like other nodes. Engine requires **exactly one outgoing edge** from the interrupt node id (the edge after resume is followed literally). |

## Explicitly unsupported node types (do not emit)

`parallel`, `agent_delegate`, `subworkflow`, `wait`, `set_state` — **reject** at JSON Schema validation (`oneOf` on `workflow_node`).

## Graph topology (MCP / `runPocWorkflow`)

These rules are enforced **after** JSON Schema validation when the engine walks the graph (same path as MCP `workflow_start` / `workflow_resume` via `createWorkflowApplicationPort`):

- Exactly **one** edge whose `source` is **`__start__`** (target is usually the unique `start` node’s successor per fixtures).
- Exactly **one** node with `type: "start"` and exactly **one** with `type: "end"`.
- Every node except `switch` and `end` must have **exactly one** outgoing edge listed in `edges` keyed by that node’s `id`. **`end`** must have **zero** outgoing edges. **`interrupt`** must have **exactly one** outgoing edge.
- **`switch`:** outgoing edge count from the switch id is **not** used for the above rule (see `assertPocGraphEdges` in `poc-runner.mjs`); routing is jq-driven from `config` only.

If any rule fails, execution returns `failed` with an orchestration error message (still after schema and reducer pre-checks).

## Expressions and state

- **`switch` `when`** and **`end` `output_mapping`** are **jq strings** (see `packages/engine/README.md` for jq root binding, `jq-wasm`, and default when `output_mapping` is omitted).
- After node outputs merge into state, this engine **validates** state with Ajv against `state_schema` (reducer annotations stripped for compilation).
- **`custom` reducer** and **unknown** `reducer` values on `state_schema.properties.*` are rejected by the engine **after** schema validation (`assertNoCustomReducers` / merge path in `linear-runner.mjs`), not only by JSON Schema (the bundled schema even notes that rejecting `custom` may need extra tooling).

## Execution history (conceptual)

POC commands/events subset includes scheduling, completion, failure, interrupt raise/resume, activity requested/completed/failed, state updates, execution completed/failed. Full taxonomies: RFC-04.

## Related assets in this skill

- **As-built JSON Schema:** `assets/workflow-definition-poc.json` (snapshot; refresh from `schemas/workflow-definition-poc.json` in the protocol repo when the bundle changes).
