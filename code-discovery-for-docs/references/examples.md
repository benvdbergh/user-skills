# code-discovery-for-docs — Example Workflows

These examples illustrate how `code-discovery-for-docs` can be composed with other skills and environment-specific adapters. They are **conceptual** and intentionally avoid hard-coded paths or tools.

---

## Example A — Codebase Survey for a New Architecture Doc

**Scenario**: A maintainer wants an architecture doc for a service `payments-service`.

1. Vault-local documentation skill receives:
   - Request: "Create an architecture doc for `payments-service`."
   - Repo root: `repo:payments-service` (environment-specific).
2. Vault-local skill calls `tech-documentation` (create workflow) and, during scoping, triggers `code-discovery-for-docs` in **Codebase Survey** mode with:
   - `scope.roots = ["repo:payments-service"]`
   - `scope.languages = ["typescript", "yaml"]`
3. `code-discovery-for-docs`:
   - Uses `CodeAccessContract.list_paths` and `search` to:
     - Identify domains (e.g. `api`, `domain`, `infra`).
     - Cluster modules (API handlers, domain services, infrastructure, shared libraries).
   - Emits a `ModuleMap` with:
     - Modules like `payments.api.handlers`, `payments.domain.core`, `payments.infra.db`.
     - `ArtifactRef`s pointing to representative source files and tests.
4. `tech-documentation`:
   - Uses the `ModuleMap` to scaffold sections:
     - "API Layer", "Domain Logic", "Infrastructure & Persistence".
   - Optionally passes a slice of the `ModuleMap` into `diagram` to render a component view.

---

## Example B — API Index for Reference Documentation

**Scenario**: A team needs an up-to-date API reference for an HTTP service.

1. User asks: "Generate an API reference section for our `orders-service`."
2. Vault-local doc skill calls `code-discovery-for-docs` in **API & Interface Indexing** mode with:
   - `scope.roots = ["repo:orders-service"]`
   - `scope.kinds = ["http"]`
3. `code-discovery-for-docs`:
   - Locates controllers/route definitions via `search` and/or `symbol_index`.
   - Extracts HTTP methods, routes, and request/response types.
   - Emits an `APIIndex`:
     - One entry per endpoint, each with an `id`, `route`, `http_method`, `request_type`, `response_type`, and `ArtifactRef`s for handlers and tests.
4. `tech-documentation`:
   - Uses the `APIIndex` to:
     - Generate tables and per-endpoint sections.
     - Provide links or inline code examples from `ArtifactRef`s.
   - Optionally calls `diagram` to render an endpoint-to-component diagram.

---

## Example C — Feature Trace for Product Knowledge

**Scenario**: The product team defines a feature `Smart Routing` in the catalog and wants code links.

1. `product-knowledge-catalog` creates a `Feature` with:
   - `feature_id = "feature:smart-routing"`
   - Associated stories, user journeys, and requirements.
2. It then calls `code-discovery-for-docs` in **Feature-Oriented Discovery** mode with:
   - `feature_id = "feature:smart-routing"`
   - Keywords and story references.
3. `code-discovery-for-docs`:
   - Uses `search` to find relevant identifiers, config flags, and tests.
   - Leverages an existing `ModuleMap` and `APIIndex` (or generates them if needed).
   - Emits a `FeatureTrace`:
     - Linking `feature:smart-routing` to:
       - `ModuleMap.modules[*].id` entries.
       - `APIIndex.apis[*].id` entries.
       - Additional `ArtifactRef`s (tests, configs, docs).
4. `product-knowledge-catalog`:
   - Stores the `FeatureTrace` relationships.
   - Enables downstream queries like "Which modules/APIs implement `Smart Routing`?" and "Which docs mention this feature?"

---

## Example D — Change Impact for a PR

**Scenario**: Governance needs to know if a PR requires documentation updates.

1. CI or a governance workflow calls `documentation-governance` for PR `#1234`.
2. `documentation-governance`:
   - Calls `code-discovery-for-docs` in **Diff / Change Impact** mode with:
     - `base = "main"`, `head = "feature/1234-smart-routing"`.
     - `scope.roots = ["repo:payments-service"]`.
3. `code-discovery-for-docs`:
   - Uses `CodeAccessContract.diff` to list changed files and hunks.
   - Maps changed files to modules and APIs via `ModuleMap` and `APIIndex`.
   - Emits a `ChangeImpactReport` that lists:
     - Impacted modules/APIs.
     - Change kinds (e.g. new endpoint, modified behavior).
     - Suspected documentation impacts (e.g. "API reference for /v1/payments", "Smart Routing feature description").
4. `documentation-governance`:
   - Combines `ChangeImpactReport` with:
     - Known docs (`ArtifactRef`s) and coverage policies.
     - `product-knowledge-catalog` data for features/capabilities.
   - Produces an `AssessmentResult` (policy-specific) that may:
     - Require doc updates before merge.
     - Suggest reviewers or doc owners.

---

## Example E — Architecture View Extraction for Diagrams

**Scenario**: An architect wants a **component diagram** derived from code.

1. User asks: "Draw a component diagram for the `billing` service based on code structure."
2. Vault-local skill:
   - Calls `code-discovery-for-docs` in **Codebase Survey** mode to get a `ModuleMap`.
   - Optionally calls the architecture view extraction workflow to:
     - Project modules into components/layers suitable for diagramming.
3. `code-discovery-for-docs`:
   - Emits a graph-like slice:
     - Nodes = modules/components with IDs and labels.
     - Edges = dependencies or flows, annotated with types (call, event, data).
   - Ensures node IDs line up with `ModuleMap.modules[*].id`.
4. Vault-local skill:
   - Calls `diagram` with the semantic slice, choosing a format (e.g. draw.io).
   - Embeds the resulting diagram into documentation or architecture views, while preserving IDs for future refresh.

