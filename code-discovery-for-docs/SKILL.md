---
name: code-discovery-for-docs
description: >-
  Global, vault-agnostic code discovery orchestrator that builds module maps,
  API indices, feature traces, architecture-relevant views, and change-impact
  summaries to support documentation and architecture work. Use when the user
  asks where code for a concept lives, needs a module/API map for docs or
  diagrams, wants to trace features to code artifacts, or requests
  documentation-aware change impact for a branch or PR.
license: MIT
metadata:
  scope: user-global
  tier: core
  version: 1.0.0
---

# code-discovery-for-docs

Global, reusable **code discovery skill** for systematic codebase exploration in support of documentation, architecture, and governance. It produces structured discovery artifacts (e.g. `ModuleMap`, `APIIndex`, `ArtifactRef`, `FeatureTrace`, `ChangeImpactReport`) that can be consumed by other global skills and vault-local adapters.

This skill is **vault-agnostic**: it defines contracts and orchestration patterns but does not hard-code repository paths, languages, or tool choices. Concrete wiring to MCP servers, shells, or IDE APIs is provided by the host environment or vault-level skills.

---

## Overview & Positioning

- **Purpose**: Provide a **consistent, structured way** to discover and summarize codebases for:
  - Technical documentation and architecture docs.
  - Product and feature catalogs.
  - Documentation governance and coverage checks.
- **Outputs**: Structured artifacts such as:
  - `ModuleMap` — modules, packages, services, and their relationships.
  - `APIIndex` — public APIs, routes, RPCs, and interfaces.
  - `ArtifactRef` — stable references to code, tests, configs, and docs.
  - `FeatureTrace` — traces from features/capabilities to underlying code.
  - `ChangeImpactReport` — code + docs impact surface for diffs/PRs.
- **Callers**: Typically invoked by:
  - Global skills: `tech-documentation`, `product-knowledge-catalog`, `documentation-governance`, `diagram`.
  - Vault-local skills: environment-specific documentation/architecture orchestrators.

### When to use `code-discovery-for-docs`

Activate this skill whenever the user or a calling skill:

- Asks **"where is X implemented?"** in a documentation or architecture context.
- Wants to **build or refresh a module map** for a service, repo, or subsystem.
- Needs an **API index** for a surface (HTTP, gRPC, message bus, GraphQL, SDK).
- Needs a **feature-to-code trace** to back a product/architecture narrative.
- Requests **"what changed in code for this doc/feature/PR?"**.
- Wants to drive **diagrams or EA views** directly from discovered code structure.

---

## Scope & Assumptions

- **Global & vault-agnostic**:
  - No hard-coded repository roots, language lists, or CI paths.
  - Callers provide: entry points (paths, repos, services), languages of interest, and any relevant conventions.
- **Orchestrator over tools**:
  - This skill defines **what** discovery steps to perform and **how to structure outputs**.
  - Concrete **CodeAccessContract** implementations (MCP servers, shell, IDE APIs) are provided by the host.
- **Documentation/architecture focus**:
  - Optimized for summarizing code to support docs, diagrams, and governance.
  - Not a full static analysis or security scanner; it can surface hints, but policy/scanning remains in specialized tools.

Assume:

- At least one **CodeAccessContract** implementation is available that can:
  - List files and directories under one or more roots.
  - Read file contents.
  - Perform pattern-based search (e.g. regex, glob, symbol search).
  - Optionally compute diffs between revisions (`base`/`head`, main/feature branch, etc.).
- Callers can provide:
  - Discovery scope (repo, service, path glob, component).
  - Documentation/architecture questions (e.g. APIs for feature Y, modules behind capability Z).
  - Any relevant **product/catalog** context (feature IDs, capability names) when doing feature-oriented discovery.

---

## Interfaces & Types

This skill is designed around two primary interfaces:

- **CodeAccessContract** — how the skill accesses code and diffs.
- **DiscoveryOutputContract** — how results are structured for reuse.

Only a **summary** is included here; see `references/types.md` for full schemas and guidance.

### CodeAccessContract (summary)

Abstract interface that adapters must satisfy:

- **Capabilities** (logical operations, not specific tools):
  - `list_paths(scope, patterns, exclude)` — enumerate files/directories.
  - `read_file(path)` — read file content.
  - `search(pattern, scope, language_hint?)` — search within code.
  - `symbol_index(scope, kinds?)` (optional) — retrieve symbols/definitions.
  - `diff(base, head, scope)` (optional) — compute file-level and hunk-level diffs.
- **Implementations**:
  - May be backed by MCP repo/file servers, shell + VCS tooling (e.g. `git`, `rg`), or IDE APIs.
  - MUST respect environment safety and rate limits defined by the host.

### DiscoveryOutputContract (summary)

Core shared types:

- **`ModuleMap`**:
  - Describes modules/packages/services, their key files, dependencies, and related artifacts.
- **`APIIndex`**:
  - Describes externally visible APIs (routes, RPCs, interfaces, public functions/classes).
- **`ArtifactRef`**:
  - Generic pointer to a concrete artifact (code, tests, docs, diagrams, configs).
- **`FeatureTrace`**:
  - Connects features/capabilities to modules, APIs, and artifacts.
- **`ChangeImpactReport`**:
  - Summarizes impact of a diff/PR on modules, APIs, and documentation.

Detailed field definitions, relationships, and JSON examples are in `references/types.md`. Other skills (e.g. `product-knowledge-catalog`, `documentation-governance`) SHOULD reference those definitions rather than redefining types.

---

## Workflow Modes

`code-discovery-for-docs` exposes several **workflow modes**. Callers should select the mode that matches their task and provide the required parameters (scope, questions, constraints).

### 1. Codebase Survey

High-level inventory of a repository, service, or directory tree.

- **Goal**: Build or refresh a `ModuleMap` for a given scope.
- **Typical triggers**:
  - "Build a module map for this repo/service."
  - "Give me a high-level view of this codebase for docs."
  - "What are the main modules and layers here?"
- **Core steps**:
  - Identify root(s) and languages.
  - Cluster files into modules (packages, services, components, layers).
  - Derive dependencies between modules (imports, calls, config wiring).
  - Emit `ModuleMap` with `ArtifactRef` links to representative files and tests.

### 2. Feature-Oriented Discovery

Trace from **features/capabilities** to underlying code.

- **Goal**: Populate or refine `FeatureTrace` objects that map features to modules/APIs.
- **Typical triggers**:
  - "Where is Feature Y implemented?"
  - "Trace this capability into the code."
  - "Find code paths behind this user journey."
- **Core steps**:
  - Accept feature/capability inputs (names, IDs, user journeys, stories).
  - Use `CodeAccessContract.search` and `ModuleMap` context to locate relevant modules/APIs.
  - Construct `FeatureTrace` entries referencing `ModuleMap`, `APIIndex`, and `ArtifactRef`s.

### 3. API & Interface Indexing

Catalog user-facing and integration-facing APIs.

- **Goal**: Produce an `APIIndex` for one or more services/libraries.
- **Typical triggers**:
  - "List all HTTP APIs for this service."
  - "Generate an API index for our SDK."
  - "What public interfaces exist in this package?"
- **Core steps**:
  - Identify API entry points (routes, controllers, handlers, exports).
  - Extract signatures, routes, HTTP methods, request/response types, stability/visibility flags.
  - Link APIs back to modules and code locations using `ArtifactRef`.

### 4. Architecture View Extraction (optional)

Derive architecture-relevant slices for diagrams and EA views.

- **Goal**: Provide **diagram-ready slices** based on `ModuleMap` and `APIIndex`.
- **Typical triggers**:
  - "Give me a component view for this service."
  - "Extract a deployment-relevant view for architecture docs."
- **Core steps**:
  - Project `ModuleMap` into higher-level groupings (domains, layers, bounded contexts).
  - Produce node/edge structures compatible with `diagram` semantic model (components, dependencies, flows).
  - Attach `ArtifactRef`s so diagrams can link back to code.

### 5. Diff / Change Impact (optional)

Summarize **what changed** and **what may need doc updates** given a diff or PR.

- **Goal**: Emit a `ChangeImpactReport` suitable for documentation and governance flows.
- **Typical triggers**:
  - "What changed for this PR, and which docs should we update?"
  - "Summarize code changes from branch X vs main for documentation."
- **Core steps**:
  - Use `CodeAccessContract.diff` to list changed files and hunks.
  - Map changed artifacts to `ModuleMap` and `APIIndex` entries.
  - Produce `ChangeImpactReport` with:
    - Impacted modules and APIs.
    - New/removed/modified artifacts.
    - Hints about likely docs, runbooks, or diagrams to review (as `ArtifactRef`s, when known).

---

## Integration with Other Skills

This skill is designed to be **composed** with other global skills rather than used directly by end-users in most flows.

### `tech-documentation`

- **Upstream inputs**:
  - Documentation topics (service, feature, capability, API surface).
  - Existing docs and code paths of interest.
- **Calls to `code-discovery-for-docs`**:
  - Use **Codebase Survey** and **API & Interface Indexing** to:
    - Build module/API maps that underpin implementation and architecture sections.
    - Suggest representative code examples and snippets (via `ArtifactRef`s).
  - Use **Feature-Oriented Discovery** to:
    - Back feature-/capability-focused documents with concrete code traces.
  - Use **Diff / Change Impact** to:
    - Inform "what changed" or "release notes" sections from a documentation perspective.
- **Returned artifacts**:
  - `ModuleMap`, `APIIndex`, `FeatureTrace`, `ChangeImpactReport`, plus `ArtifactRef`s for inline code examples.

### `diagram`

- Consumes slices of `ModuleMap` and `APIIndex`:
  - Component views (nodes = modules/services/components; edges = dependencies).
  - Integration views (nodes = APIs/consumers; edges = calls/messages).
- Callers SHOULD:
  - Pass diagram-ready graph slices derived from discovery outputs into `diagram`.
  - Preserve stable IDs (e.g. `module_id`, `api_id`) so diagrams stay bound to code artifacts.

### `product-knowledge-catalog` (planned)

- Consumes discovery outputs to populate **code-side links**:
  - `Feature` → `ModuleMap` entries, `APIIndex` entries, and test/config `ArtifactRef`s.
- Uses shared types:
  - Reuses `ArtifactRef`, `FeatureTrace`, and IDs from `ModuleMap`/`APIIndex` instead of redefining them.
- Enables:
  - Impact analysis from catalog entries (e.g. "Which modules/APIs implement Feature F?").

### `documentation-governance` (planned)

- Uses discovery outputs as **coverage baselines**:
  - "What code exists?" (via `ModuleMap`/`APIIndex`).
  - "Which artifacts and features are undocumented or under-documented?".
- Typical consumption:
  - Coverage policies referencing modules/APIs via their IDs.
  - Change-impact checks that correlate `ChangeImpactReport` with documentation and catalog coverage.

### Vault-local skills (e.g. Ai-Vault `documentation`)

- Provide environment-specific **adapters** that:
  - Bind `CodeAccessContract` to local repo layout, VCS, and CI/PR tooling.
  - Map discovery outputs into vault-local paths, note structures, and diagrams.
- SHOULD treat `code-discovery-for-docs` as the canonical source for:
  - Code module/API inventories.
  - Feature traces and change impact summaries.

---

## MCP Dependencies (Conceptual)

`code-discovery-for-docs` is intentionally **MCP-agnostic** at the contract level.

- **Current environment snapshot**:
  - Known MCP servers: e.g. diagram/visualization and documentation-related servers (such as draw.io/Excalidraw, Word/Atlassian integrations).
  - No dedicated **repo/file** MCP server has been identified in this environment yet.
- **Design assumption**:
  - Code access MAY be provided by:
    - A repo/file MCP server (future), exposing file listing, read, search, and diff tools.
    - Host-side shell commands (`git`, `rg`, language-specific tooling) where allowed.
    - IDE-integrated APIs that satisfy `CodeAccessContract`.

Callers and environment owners are responsible for:

- Selecting and configuring one or more concrete `CodeAccessContract` implementations.
- Ensuring that any MCP servers used for code access are documented at the adapter level (e.g. in a vault-local skill or a shared adapter skill).

---

## Tool Usage Mapping (Conceptual)

Because this skill is a **logical orchestrator**, the specific tools will vary by environment. The table below captures the **typical mapping** from workflow steps to tool categories.

| Workflow Step                 | Tool Category              | Example Capabilities                         | Safety Level           |
|------------------------------|----------------------------|----------------------------------------------|------------------------|
| Enumerate files/modules      | Repo/file access           | list paths, glob by language/folder          | Safe                   |
| Read code for sampling       | Repo/file access           | read files by path                           | Safe                   |
| Search for symbols/patterns  | Code search                | regex/symbol search over code                | Safe (bounded scope)   |
| Compute diffs (optional)     | VCS / CI integration       | diff base/head, list changed files/hunks     | Requires Confirmation* |
| Persist discovery artifacts  | Host storage (optional)    | write JSON/YAML maps or notes                | Requires Confirmation* |

\* "Requires Confirmation" indicates operations that may:

- Touch external systems (e.g. CI, hosted repos).
- Write durable artifacts beyond the immediate agent context.

Concrete **MCP tool names** and server IDs SHOULD be documented in the adapter or vault-local skills that implement `CodeAccessContract`.

---

## Tool Safety Policy

- **Safe operations**:
  - Reading code, listing paths, and running bounded searches within the specified scope.
  - Building in-memory discovery artifacts (`ModuleMap`, `APIIndex`, `FeatureTrace`, `ChangeImpactReport`) and returning them to callers.
- **Requires confirmation** (or explicit host configuration):
  - Running expensive or whole-repo searches on very large codebases.
  - Computing large diffs (e.g. across many branches) that may impact performance.
  - Writing discovery artifacts to disk, repos, or external systems (e.g. CI annotations, dashboards).
- **Never allowed by this skill**:
  - Destructive operations on repositories (e.g. deleting files, force-pushing branches, rewriting history).
  - Committing or pushing changes as part of discovery.

Environment-specific adapters MAY impose stricter policies; this global skill assumes the most conservative behavior when in doubt.

---

## Examples

High-level examples; see `references/examples.md` for more detailed, step-by-step flows.

### Example 1: Build a module map for documentation

1. Caller (e.g. `tech-documentation`) asks: "Build a module map for the `payments-service` repo to support a new architecture doc."
2. `code-discovery-for-docs`:
   - Uses Codebase Survey mode with the provided repo root and language hints.
   - Clusters code into modules (e.g. API handlers, domain services, infrastructure).
   - Emits a `ModuleMap` with `ArtifactRef`s to representative files and tests.
3. Caller uses the `ModuleMap` to:
   - Structure the implementation and architecture sections.
   - Feed a component view into `diagram`.

### Example 2: Generate an API index for a service

1. Caller asks: "Generate an API index for this HTTP service for the API reference section."
2. `code-discovery-for-docs`:
   - Runs API & Interface Indexing mode over the service code.
   - Discovers routes, methods, parameters, and response types.
   - Outputs an `APIIndex` with links back to code via `ArtifactRef`s.
3. Caller uses `APIIndex` to:
   - Draft API reference tables.
   - Create endpoint-focused diagrams via `diagram`.

### Example 3: Feature trace for a capability

1. Caller (e.g. `product-knowledge-catalog`) asks: "Trace Feature `Smart Routing` into the codebase."
2. `code-discovery-for-docs`:
   - Uses Feature-Oriented Discovery mode with the feature name and any IDs/user stories.
   - Searches code for relevant identifiers, configs, and tests.
   - Emits `FeatureTrace` entries linking the feature to `ModuleMap` modules, `APIIndex` entries, and `ArtifactRef`s.
3. Caller stores the feature-to-code relationships in the catalog and surfaces them in docs.

### Example 4: Change impact for a PR

1. Caller (e.g. `documentation-governance` or a vault-local doc helper) asks: "What changed in this PR that may require doc updates?"
2. `code-discovery-for-docs`:
   - Uses Diff / Change Impact mode with `base`/`head` identifiers.
   - Maps changed files to modules and APIs.
   - Produces a `ChangeImpactReport` highlighting impacted modules, APIs, and inferred doc touchpoints.
3. Caller uses the report to:
   - Gate PR merges on governance checks (policy-specific).
   - Suggest targeted documentation updates instead of full rereads.

