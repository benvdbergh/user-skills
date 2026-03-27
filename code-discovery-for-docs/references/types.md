# code-discovery-for-docs — Types & Contracts

This reference defines the **shared contracts** used by `code-discovery-for-docs` and other skills that consume its outputs. Types are expressed in a JSON-oriented style but are conceptual; callers may represent them in other serializations as long as fields and semantics are preserved.

---

## 1. CodeAccessContract

`CodeAccessContract` describes the **capabilities** that an adapter must provide so that `code-discovery-for-docs` can explore codebases in a vault-agnostic manner.

This is an **abstract interface**, not a concrete tool list.

### 1.1. Capabilities

```json
{
  "id": "string",              // Adapter identifier (e.g. "local-git", "repo-mcp:foo")
  "description": "string",
  "supports_diff": true,
  "supports_symbol_index": false,
  "root_paths": ["string"]     // Optional; callers may also pass explicit roots per request
}
```

The adapter MUST support these logical operations (regardless of implementation detail):

```ts
list_paths(scope, patterns?, exclude?) -> PathList
read_file(path) -> FileContent
search(pattern, scope, language_hint?) -> SearchResultSet
symbol_index(scope, kinds?) -> SymbolIndex (optional)
diff(base, head, scope?) -> DiffResult (optional)
```

- **Scope**:
  - A minimal scope object SHOULD include: `root` (path or repo id), optional `subpath`, and optional `language_hints`.
- **Patterns/exclude**:
  - Glob-like patterns and ignore rules SHOULD be supported where the underlying tools allow.

### 1.2. PathList

```json
{
  "paths": [
    {
      "path": "string",
      "kind": "file | directory | symlink",
      "language": "string | null",
      "size_bytes": 12345
    }
  ]
}
```

### 1.3. SearchResultSet

```json
{
  "query": "string",
  "scope": {
    "root": "string",
    "subpath": "string | null"
  },
  "matches": [
    {
      "path": "string",
      "line": 123,
      "column": 5,
      "preview": "string"
    }
  ]
}
```

### 1.4. SymbolIndex (optional)

```json
{
  "scope": {
    "root": "string",
    "subpath": "string | null"
  },
  "symbols": [
    {
      "name": "string",
      "kind": "function | class | method | type | interface | enum | constant | route | handler | other",
      "path": "string",
      "line": 123,
      "signature": "string | null",
      "container": "string | null"   // e.g. class or namespace
    }
  ]
}
```

### 1.5. DiffResult (optional)

```json
{
  "base": "string",   // e.g. commit ID or branch name
  "head": "string",
  "files": [
    {
      "path": "string",
      "change_type": "added | modified | deleted | renamed",
      "hunks": [
        {
          "base_start": 10,
          "base_lines": 5,
          "head_start": 10,
          "head_lines": 7,
          "summary": "string"      // short human-readable summary
        }
      ]
    }
  ]
}
```

Adapters may provide richer diff details; this is the minimum contract the skill relies on.

---

## 2. DiscoveryOutputContract

The **DiscoveryOutputContract** defines the artifacts that `code-discovery-for-docs` emits and that other skills may consume.

### 2.1. ArtifactRef

`ArtifactRef` is a **shared, generic pointer** to a concrete artifact (code, tests, docs, diagrams, configs, etc.). It is intentionally environment-agnostic.

```json
{
  "id": "string",                   // Stable within the discovery output
  "kind": "code | test | config | doc | diagram | data | other",
  "uri": "string",                  // Path, URL, or locator understood by the environment
  "label": "string",
  "environment_id": "string",       // e.g. "ai-vault", "user", "repo:payments-service"
  "description": "string | null",
  "tags": ["string"]
}
```

Other skills (e.g. `product-knowledge-catalog`, `documentation-governance`) SHOULD reuse `ArtifactRef` when referencing code, docs, or diagrams instead of inventing their own pointer types.

### 2.2. ModuleMap

Represents a **module-level view** of the codebase: packages, services, components, and their dependencies.

```json
{
  "id": "string",                   // Map identifier (e.g. "repo:payments-service")
  "generated_at": "2025-03-13T00:00:00Z",
  "scope": {
    "roots": ["string"],
    "languages": ["string"],
    "description": "string | null"
  },
  "modules": [
    {
      "id": "string",               // Stable module id (e.g. "payments.api.handlers")
      "name": "string",
      "kind": "service | package | library | component | layer | other",
      "primary_paths": ["string"],  // Key paths for this module
      "languages": ["string"],
      "description": "string | null",
      "dependencies": ["string"],   // Other module ids
      "dependents": ["string"],     // Reverse edges (optional)
      "artifact_refs": ["string"],  // ArtifactRef ids (code/tests/configs/docs)
      "tags": ["string"]
    }
  ],
  "artifact_refs": [ ArtifactRef ]
}
```

Notes:

- `artifact_refs` is the **authoritative list**; modules reference them by id.
- Downstream skills can slice this structure (e.g. per-layer view, service-only view) without losing IDs.

### 2.3. APIIndex

Represents **externally visible APIs** (HTTP, RPC, message-based, SDK, CLI, etc.).

```json
{
  "id": "string",                     // e.g. "repo:payments-service:api"
  "generated_at": "2025-03-13T00:00:00Z",
  "scope": {
    "roots": ["string"],
    "kinds": ["http", "grpc", "graphql", "sdk", "cli", "message"],
    "description": "string | null"
  },
  "apis": [
    {
      "id": "string",                 // Stable API id (e.g. "payments.http.POST_/v1/payments")
      "symbol_name": "string | null", // Handler or function name, if applicable
      "kind": "http | grpc | graphql | sdk | cli | message",
      "module_id": "string | null",   // Links to ModuleMap.modules.id
      "route": "string | null",       // Path, topic, or CLI command where applicable
      "http_method": "string | null",
      "request_type": "string | null",
      "response_type": "string | null",
      "visibility": "public | internal | experimental | deprecated",
      "stability": "stable | beta | experimental | unknown",
      "description": "string | null",
      "artifact_refs": ["string"],    // ArtifactRef ids (handlers, tests, docs)
      "tags": ["string"]
    }
  ],
  "artifact_refs": [ ArtifactRef ]
}
```

### 2.4. FeatureTrace

Connects **features/capabilities** to modules, APIs, and artifacts. This type is designed to be shared with `product-knowledge-catalog`.

```json
{
  "id": "string",                       // e.g. "repo:payments-service:feature-trace"
  "generated_at": "2025-03-13T00:00:00Z",
  "features": [
    {
      "feature_id": "string",           // Stable feature id (e.g. from product catalog)
      "name": "string",
      "description": "string | null",
      "source": {
        "kind": "story | epic | requirement | freeform",
        "artifact_ref_id": "string | null"   // Optional reference to a doc/story
      },
      "module_ids": ["string"],         // ModuleMap.modules.id
      "api_ids": ["string"],            // APIIndex.apis.id
      "artifact_ref_ids": ["string"],   // Additional code/tests/configs/docs
      "confidence_score": 0.8,
      "notes": "string | null"
    }
  ]
}
```

Downstream skills MAY:

- Enrich `features[*]` with additional fields.
- Use `feature_id` as the join key to their own feature/domain models.

### 2.5. ChangeImpactReport

Summarizes the **impact of a diff/PR** for documentation and governance.

```json
{
  "id": "string",                          // e.g. "repo:payments-service:pr-1234"
  "generated_at": "2025-03-13T00:00:00Z",
  "base": "string",
  "head": "string",
  "scope": {
    "roots": ["string"],
    "description": "string | null"
  },
  "changed_files": [
    {
      "path": "string",
      "change_type": "added | modified | deleted | renamed",
      "summary": "string | null"
    }
  ],
  "impacted_modules": [
    {
      "module_id": "string",
      "change_kind": "touched | major | structural | new",
      "reasons": ["string"]         // e.g. "new public API", "core logic changed"
    }
  ],
  "impacted_apis": [
    {
      "api_id": "string",
      "change_kind": "added | modified | removed",
      "reasons": ["string"]
    }
  ],
  "suspected_doc_impacts": [
    {
      "artifact_ref_id": "string | null",  // When a known doc is linked
      "doc_type": "architecture | runbook | api-reference | user-guide | other",
      "reason": "string",
      "severity": "low | medium | high"
    }
  ],
  "notes": "string | null"
}
```

`documentation-governance` can combine this report with its own policies and doc inventories to decide what must be updated before merge.

---

## 3. Ownership & Reuse Guidelines

- `code-discovery-for-docs` is the **source of truth** for:
  - `CodeAccessContract` (logical capabilities and minimal result structures).
  - `ModuleMap`, `APIIndex`, `ArtifactRef`, `FeatureTrace`, and `ChangeImpactReport`.
- `product-knowledge-catalog` SHOULD:
  - Reference `FeatureTrace` and `ArtifactRef` definitions when binding catalog entries to code and docs.
- `documentation-governance` SHOULD:
  - Reference `ArtifactRef`, `ModuleMap`, `APIIndex`, and `ChangeImpactReport` to express coverage and impact policies.

Other global or vault-local skills MAY:

- Use these types directly in their own references.
- Extend them with additional fields, as long as core fields remain compatible.

