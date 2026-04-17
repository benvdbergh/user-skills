# workflow-engine-mcp-design escalation boundaries

## Owns

- POC workflow **definition** design: allowed node types, edges, `state_schema` reducers, jq usage for `switch` and `end` output mapping.
- Mapping those definitions to **MCP tool** usage: `workflow_start`, `workflow_status`, `workflow_resume` arguments and structured results or errors.
- Pointing agents to the **bundled as-built JSON Schema** (`assets/workflow-definition-poc.json`) and validation commands aligned with CI.
- **Troubleshooting** adapter error codes, resume discipline, and POC limitations (in-memory store, no cancel tool).

## Does Not Own

- Changing the engine, schema bundle, or RFC text (escalate to the workflows repository maintainers).
- General product roadmap, epic/story authoring, or release operations for `@agent-workflow/engine`.
- Designing **out-of-POC** node types (`parallel`, `agent_delegate`, `subworkflow`, `wait`, `set_state`) as if they were supported.
- **MCP host** configuration beyond documenting the standard operator pattern (Cursor, Claude Code, or other clients are host-specific).
- Implementing custom **activity adapters** for `step` / real `llm_call` backends (profile-specific).

## Escalation Paths

### Escalate to the Agent Workflow Protocol repository

When:

- Schema semantics, conformance vectors, or engine behavior need authoritative updates.
- A suspected **bug** in the engine or MCP adapter (not misuse of the contract).

Expected return:

- Issue, PR, or release note; updated schema/fixture alignment.

### Escalate to `specification` (global skill)

When:

- The user needs a full PRD, multi-system integration spec, or governance-grade document beyond workflow JSON and MCP calls.

### Escalate to `software-architecture` (global skill)

When:

- Workflow design is a slice of a larger system architecture, NFR analysis, or deployment topology.

### Escalate to `minimalist-coding` / implementation skills

When:

- The task shifts from **authoring workflow JSON** to **implementing** handlers, runners, or host-side automation in application code.
