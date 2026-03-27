---
name: product-knowledge-catalog
description: >-
  Maintains a global, vault-agnostic catalog of domain terms, products,
  capabilities, features, and user journeys with traceability to code and
  documentation. Use when the user wants to seed or normalize a product/domain
  glossary, query product/capability/feature impact across docs and code, or
  scaffold documentation and governance rules from a single, canonical catalog.
license: MIT
metadata:
  scope: global
  tier: core
  version: 1.0.0
---

# product-knowledge-catalog

Global **product and domain knowledge catalog** skill that maintains a structured, vault-agnostic catalog of:

- **DomainTerm** – canonical vocabulary and synonyms.
- **Product** – high-level products or services.
- **Capability** – business or technical capabilities.
- **Feature** – user-visible or API-level features tied to products/capabilities.
- **UserJourney** – cross-cutting flows across capabilities and features.

The skill exposes workflows to **initialize/import** a catalog, **normalize terminology**, **query and analyze impact**, and **scaffold documentation** from catalog entries, with optional **traceability hooks to code and enterprise models**.

---

## Scope & Positioning

- **Scope**:
  - Product and domain knowledge that must stay consistent across **documentation**, **code**, and **architecture views**.
  - Canonical vocabulary and relationships between terms, products, capabilities, features, and user journeys.
- **Vault-agnostic**:
  - No hard-coded vault paths or repository structures.
  - Works at **user-global** scope; vault-local adapters (e.g. Ai-Vault `documentation`) provide environment-specific storage paths and persistence rules.
- **Role**:
  - **Single shared catalog** for product/domain knowledge.
  - Upstream of **tech-documentation**, **documentation-governance** (planned), and **code-discovery-for-docs**.
  - Optional exporter of catalog slices to **enterprise-modeling** (capabilities, products, journeys).

When in doubt, treat this skill as the **canonical source of product/domain semantics**, and treat other skills as consumers or producers of slices of that catalog.

---

## Data Model (Conceptual)

The full conceptual model is documented in `references/data-model.md`. At a high level:

- **DomainTerm**
  - Canonical term with definition, synonyms, domain/category, and status (proposed/accepted/deprecated).
  - References **Products**, **Capabilities**, and **Features** where it is primary.
- **Product**
  - Product or service with ownership, lifecycle stage, and primary domains.
  - Aggregates **Capabilities** and **Features**; references **UserJourneys** where it appears.
- **Capability**
  - Business or technical capability (often aligned with enterprise capabilities).
  - May map to **enterprise-modeling** capabilities; supports one or more **Products** and **UserJourneys**.
- **Feature**
  - User-visible (or API-level) feature tied to a **Product** and one or more **Capabilities** and **UserJourneys**.
  - May hold **ArtifactRef** lists pointing to code artifacts discovered via `code-discovery-for-docs` (`ModuleMap`, `APIIndex`, tests, configs).
- **UserJourney**
  - Cross-cutting journey for personas, with triggers, steps, and success outcomes.
  - Connects **Capabilities**, **Products**, and **Features** in time-ordered flows.

Shared reference types (e.g. `ArtifactRef`, `ModuleMapRef`, `APIIndexRef`) are documented in `references/data-model.md` and are designed to be compatible with the contracts defined in the `code-discovery-for-docs` skill.

---

## Workflow Modes

The skill exposes four primary workflow modes. Each mode has **trigger phrases**, **inputs**, and **expected outputs**. Detailed steps and JSON snippets are in `references/workflows.md`.

### 1. Catalog Initialization / Import

**Purpose**: Seed or refresh the catalog from existing sources (spreadsheets, JSON exports, existing docs, or research outputs).

- **Typical triggers**:
  - "Initialize a product catalog from this spreadsheet."
  - "Import our existing product + capability list."
  - "Build a domain glossary from these docs."
- **Inputs**:
  - One or more sources (tables, JSON, Markdown, research reports).
  - Hints about column/field semantics (e.g. "this column is capability level 2").
- **Behavior**:
  - Infer whether each row/item is a `DomainTerm`, `Product`, `Capability`, `Feature`, or `UserJourney`.
  - Propose a normalized representation for each entity type.
  - Highlight ambiguity and capture **assumptions** (e.g. whether an item is a capability vs. feature).
  - Output draft catalog structures (e.g. JSON blocks or Markdown tables) ready for human review.

Use this mode when seeding a catalog for the first time or when importing from a new source system.

### 2. Term Normalization & Glossary

**Purpose**: Normalize terminology, deduplicate synonyms, and produce a **governed glossary** backed by the catalog.

- **Typical triggers**:
  - "Normalize terminology across these docs."
  - "What is our canonical term for X?"
  - "Generate a glossary for this product/domain."
- **Inputs**:
  - Existing or draft catalog entries.
  - Example documents or term lists.
- **Behavior**:
  - Identify candidate `DomainTerm` entries and conflicting usages.
  - Propose canonical terms, synonyms, and deprecations with rationales.
  - Generate glossary views for specific scopes (e.g. "Payments capabilities", "Customer journeys").
  - Provide **doc-ready glossary sections** that `tech-documentation` can embed.

Use this mode when aligning docs and systems on a single vocabulary or when preparing new domain/product glossaries.

### 3. Catalog Query & Impact Analysis

**Purpose**: Answer structured questions against the catalog and perform impact analysis across **products, capabilities, features, user journeys, docs, and code artifacts**.

- **Typical triggers**:
  - "Which products implement capability X?"
  - "If we deprecate feature Y, what docs and APIs are impacted?"
  - "Where is term Z used across products and journeys?"
- **Inputs**:
  - One or more query anchors (term, product, capability, feature, journey).
  - Optional filters (e.g. lifecycle stage, domain, persona).
- **Behavior**:
  - Traverse relationships between `DomainTerm`, `Product`, `Capability`, `Feature`, and `UserJourney`.
  - When `ArtifactRef` links exist (via `code-discovery-for-docs`), surface **code-level impact** (modules, APIs, tests).
  - Emit **impact summaries** that documentation and governance skills can consume (e.g. lists of affected docs, features, APIs).

Use this mode whenever the user asks "what is impacted if..." or wants a structured answer about how catalog entities connect.

### 4. Catalog-to-Docs Scaffolding

**Purpose**: Use catalog entries to **scaffold documentation**, providing outlines, sections, and terminology guidance for downstream documentation skills.

- **Typical triggers**:
  - "Draft a product overview doc for Product A."
  - "Create a capability map doc for this domain."
  - "Generate user journey documentation for this flow."
- **Inputs**:
  - One or more catalog entities (product, capability, feature, journey).
  - Doc intent (e.g. overview, implementation guide, API reference, release notes).
- **Behavior**:
  - Propose **outline structures** (headings, sections) aligned with the catalog entity type.
  - Embed canonical `DomainTerm` definitions, product/capability descriptions, and journey flows.
  - Produce **scaffolding payloads** (e.g. Markdown outlines and structured hints) for `tech-documentation` to turn into full documents.

Use this mode when documentation needs to be **grounded in the catalog** rather than invented ad hoc.

---

## Integration with Other Skills

### With `tech-documentation`

`tech-documentation` is the **global documentation orchestrator**; `product-knowledge-catalog` acts as a **semantic backbone** for product and domain concepts.

- **Scaffolding integration**:
  - For product, capability, feature, or journey docs, `tech-documentation` SHOULD:
    - Call `product-knowledge-catalog` (Catalog-to-Docs Scaffolding mode) with the relevant entities.
    - Receive outlines, canonical terms, and reference snippets.
    - Use those outputs as the **structural and terminology spine** for full document drafts.
- **Impact-analysis integration**:
  - For documentation **impact analysis** workflows, `tech-documentation` MAY:
    - Call `product-knowledge-catalog` (Catalog Query & Impact Analysis mode) with changed entities.
    - Use the resulting impact sets to propose **doc update plans** (e.g. affected runbooks, design docs).

In effect, `tech-documentation` answers "how should we write this doc?" while `product-knowledge-catalog` answers "what are we writing about, and how is it connected?".

### With `documentation-governance` (planned)

The planned `documentation-governance` skill will use `product-knowledge-catalog` as its **source of truth for terminology and coverage rules**:

- **Terminology enforcement**:
  - Validate that docs use canonical `DomainTerm` labels and avoid deprecated terms.
  - Flag inconsistent usage across documents and propose corrections.
- **Coverage rules**:
  - Ensure that key `Product`, `Capability`, `Feature`, and `UserJourney` entities have appropriate documentation coverage (e.g. overview, runbook, architecture view).
  - Use catalog query outputs to detect **missing or stale docs** by entity.

The `documentation-governance` skill SHOULD call `product-knowledge-catalog` rather than re-implementing its own product/domain model.

### With `code-discovery-for-docs`

`code-discovery-for-docs` is expected to discover and index code artifacts using contracts such as **`ModuleMap`**, **`APIIndex`**, and **`ArtifactRef`**. `product-knowledge-catalog`:

- **Consumes**:
  - `ArtifactRef` entries attached to `Feature`, `Capability`, or `Product` entities to track:
    - Source modules, APIs, configuration, tests, and infra pieces.
  - These are **references only**; the canonical definitions live in `code-discovery-for-docs`.
- **Provides**:
  - A semantic anchor for code artifacts: features and capabilities that those artifacts implement.
  - Impact-analysis inputs (e.g. "list all code artifacts linked to Feature F") that can be routed back to `code-discovery-for-docs` or documentation skills.

This integration makes it possible to move from **"feature → APIs/modules/tests"** and back, enabling full **doc + code traceability**.

### With `enterprise-modeling` (optional)

For organizations that maintain an **enterprise model**:

- **Capabilities and products**:
  - `Capability` and `Product` entries MAY carry optional references to `enterprise-modeling` entities (e.g. ArchiMate BusinessCapability, Product).
  - `product-knowledge-catalog` SHOULD treat these as **foreign keys only**, not as the system of record.
- **Export slices**:
  - When requested, the skill MAY export catalog slices (e.g. capabilities and products for a given domain or journey) in a form that `enterprise-modeling` can ingest or compare.

This allows enterprise architects to reconcile **catalog-centric** and **model-centric** views without coupling the systems.

---

## MCP Dependencies

`product-knowledge-catalog` is intentionally **MCP-agnostic by default**:

- It does **not require** any specific MCP server to function.
- Catalog content can be represented as JSON/Markdown structures managed by vault-local adapters or calling agents.

However, in richer environments it MAY compose with MCP-backed tools via other skills:

- **Server**: `user-mcp-atlassian` (optional, via `search-company-knowledge` or `obsidian-confluence-sync`)
  - **Usage**: Seeding catalog entries from Jira/Confluence product backlogs, space hierarchies, or existing glossaries (via calling skills).
- **Server**: `user-word-document-server` (optional, via `docx-documentation` + `tech-documentation`)
  - **Usage**: Importing existing Word-based product documentation to mine terms and entities during catalog initialization.
- **Server**: `neo4j` (optional, via `enterprise-modeling`)
  - **Usage**: Linking capabilities/products to ArchiMate entities and exporting/importing slices for EA reconciliation.

This skill documents **how** to reason about MCP-backed flows but leaves concrete tool invocation to composing skills.

---

## Tool Usage Mapping

Because `product-knowledge-catalog` is a **conceptual orchestrator**, it does not call MCP tools directly. Instead, it expects host workflows or composing skills to map its guidance to concrete tool invocations.

| Workflow Step                              | MCP Tool (via other skill)           | Purpose                                            | Safety Level            |
|-------------------------------------------|--------------------------------------|----------------------------------------------------|-------------------------|
| Seed catalog from Confluence space        | `user-mcp-atlassian.search` (via `search-company-knowledge`) | Discover existing product/capability/glossary pages | Requires Confirmation   |
| Seed catalog from Jira epics/features     | `user-mcp-atlassian.search` / issue APIs | Extract candidate Product/Feature/Capability rows   | Requires Confirmation   |
| Import Word-based catalog docs            | `user-word-document-server.get_document_outline` (via `docx-documentation`) | Extract headings/sections as candidate entities     | Safe (read-only)        |
| Link capabilities to EA model             | `neo4j.read-cypher` (via `enterprise-modeling`) | Resolve or verify corresponding ArchiMate entities  | Requires Confirmation   |

Callers SHOULD ensure that any destructive operations (e.g. writing back to Jira/Confluence/Neo4j) are owned by the respective integration skills, not by this catalog skill.

---

## Tool Safety Policy

- **Safe operations**:
  - Reading and interpreting JSON, tables, and Markdown content.
  - Proposing catalog entities and relationships based on read-only data.
  - Generating documentation scaffolds and glossary sections.
- **Requires confirmation**:
  - Any use of MCP-backed tools to **pull** large volumes of data from external systems (e.g. Jira, Confluence, Neo4j).
  - Any suggested mappings that might imply reclassification of existing entities (e.g. treating something as a capability vs. feature).
- **Never allowed (within this skill)**:
  - Direct destructive operations on external systems (creating/updating/deleting tickets, pages, model elements).
  - Storing credentials or system-specific connection details inside the catalog.

All side-effecting operations MUST be routed through dedicated integration skills with their own safety policies.

---

## Examples

### Example 1: Seed Catalog from Spreadsheet

> User: "Initialize a product and capability catalog from this spreadsheet."

1. Use **Catalog Initialization/Import** mode.
2. Interpret spreadsheet rows as candidate `Product`, `Capability`, and `Feature` entities.
3. Propose normalized JSON blocks for each, with explicit assumptions.
4. Output a draft catalog file and a short checklist for human review.

### Example 2: Glossary for a Domain

> User: "Generate a Payments glossary across our products."

1. Use **Term Normalization & Glossary** mode.
2. Filter catalog entries for the Payments domain.
3. Propose canonical `DomainTerm` entries with synonyms and deprecations.
4. Emit a Markdown glossary section that `tech-documentation` can embed into a Payments overview doc.

### Example 3: Feature Impact Analysis

> User: "If we deprecate Feature F, what is impacted?"

1. Use **Catalog Query & Impact Analysis** mode.
2. Find the `Feature` entity and traverse linked `Product`, `Capability`, and `UserJourney` entries.
3. Surface attached `ArtifactRef` links (modules/APIs/tests) from `code-discovery-for-docs`.
4. Produce an impact report listing affected catalog entities, code artifacts, and suggested documentation updates.

### Example 4: Scaffold Product Overview Doc

> User: "Draft a product overview doc for Product A."

1. Use **Catalog-to-Docs Scaffolding** mode.
2. Generate an outline including: product definition, capabilities, key features, user journeys, and glossary section.
3. Provide canonical term guidance and key relationships as hints.
4. Pass the outline and hints to `tech-documentation` (or a vault-local documentation skill) to produce the full Markdown document.

---

## Design Principles

- **Single source of semantic truth** for product and domain concepts.
- **Vault-agnostic**, with environment-specific adapters responsible for persistence and file layout.
- **Composability** with documentation, governance, code discovery, and enterprise modeling skills.
- **Traceability-first**, providing hooks from concepts to code, docs, and architecture views without owning those systems.

