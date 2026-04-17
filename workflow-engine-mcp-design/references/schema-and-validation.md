# Schema, validation, and the as-built asset

## Bundled as-built schema (this skill)

Path: **`assets/workflow-definition-poc.json`**

- JSON Schema Draft **2020-12** entry schema for the POC profile (`$id` inside file).
- **Snapshot:** copied from the Agent Workflow Protocol repo file `schemas/workflow-definition-poc.json`. Refresh this asset when the upstream bundle changes so agents stay aligned with CI.

## Canonical validation approaches

### From a clone of the protocol repo

```bash
npm run validate-workflows
npm run engine:validate -- path/to/workflow.json
```

### Single-file AJV (no full install)

```bash
npx --yes ajv-cli@5 validate -s schemas/workflow-definition-poc.json -d path/to/workflow.json --spec=draft2020
```

Use the repo’s `schemas/workflow-definition-poc.json` or this skill’s **`assets/workflow-definition-poc.json`** as `-s` (they should match after refresh).

## Authoring rules agents must enforce

- **Canonical JSON** for interchange and MCP `definition` (YAML is fine for human editing; normalize before validate/send).
- **`document.schema`** should identify the protocol/profile version expected by consumers (bump with contract changes).
- **Trace companion files** (`*.trace.*.json` under `examples/`) are narrative fixtures — **not** validated by the workflow schema; do not confuse them with executable definitions.

## jq and schema limits

The JSON Schema enforces structure (including discriminated node `oneOf`). **jq subset and runtime state shape** for `switch.when` and `end.output_mapping` are **engine-documented**; schema alone may only check non-empty string presence.
