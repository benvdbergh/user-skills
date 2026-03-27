# product-knowledge-catalog — Data Model

Conceptual data model for the global **product-knowledge-catalog** skill. This file keeps the model details outside `SKILL.md` for progressive disclosure and easier evolution.

The intent is to provide a **portable** schema that:

- Can be serialized as JSON, YAML, or Markdown tables.
- Does **not** hard-code any specific company's products.
- Is compatible with other skills (`code-discovery-for-docs`, `enterprise-modeling`, `tech-documentation`, `documentation-governance`).

> Note: Property names are suggestions, not strict requirements. Callers MAY adapt to local schemas as long as semantics are preserved.

---

## Core Entity Types

### 1. DomainTerm

**Purpose**: Canonical vocabulary for a domain, product line, or platform.

**Key properties (suggested)**:

- `id`: Stable identifier (string).
- `name`: Canonical term (string).
- `kind`: Optional classification (e.g. `"business-term"`, `"technical-term"`, `"regulatory-term"`).
- `definition`: Concise definition in business language.
- `synonyms`: List of alternate spellings / phrases.
- `abbreviations`: Common acronyms or short forms.
- `domain`: Primary domain(s) or subject areas.
- `status`: `"proposed" | "accepted" | "deprecated"`.
- `owner_role`: Role or group responsible for term stewardship.
- `source_evidence`: Optional list of citations (docs, standards, tickets).
- `notes`: Free-form clarifications.

**Typical relationships**:

- `primary_for_products`: Products where this term is the primary label.
- `primary_for_capabilities`: Capabilities where this term is canonical.
- `primary_for_features`: Features where this term is canonical.
- `related_terms`: Other `DomainTerm` IDs (e.g. broader/narrower/related).

---

### 2. Product

**Purpose**: High-level product or service offered to customers or internal users.

**Key properties (suggested)**:

- `id`: Stable identifier.
- `name`: Product name (ideally aligned with canonical `DomainTerm`).
- `description`: High-level product description.
- `domains`: Associated business/technical domains.
- `lifecycle_stage`: `"idea" | "in-development" | "launched" | "sunset"` (or local variant).
- `owner_team`: Owning team or group.
- `owner_role`: Product owner / manager role.
- `target_segments`: Optional customer/market segments (can align with `market-segmentation-research` where relevant).
- `external_ids`: Optional map of system IDs (e.g. `{ jira_project_key, confluence_space_key }`).
- `tags`: Arbitrary labels (e.g. `"platform"`, `"internal"`, `"regulated"`).

**Typical relationships**:

- `capabilities`: List of `CapabilityRef` (see below).
- `features`: List of `FeatureRef`.
- `user_journeys`: List of `UserJourneyRef` where product participates.
- `primary_terms`: List of `DomainTerm` IDs that define the product.

---

### 3. Capability

**Purpose**: Business or technical capability (often aligned to enterprise capability maps).

**Key properties (suggested)**:

- `id`: Stable identifier.
- `name`: Capability name.
- `description`: What the capability enables or provides.
- `domain`: Domain / capability cluster.
- `level`: Optional capability level (e.g. 1–3, or `"L1"`, `"L2"`, `"L3"`).
- `owner_team`: Primary responsible team (if applicable).
- `metrics`: Optional list of KPIs/KRIs for the capability.
- `status`: `"planned" | "active" | "deprecated"` or similar.

**Typical relationships**:

- `parent_capability`: Optional `CapabilityRef` (for hierarchical models).
- `child_capabilities`: List of `CapabilityRef`.
- `supporting_products`: List of `ProductRef` that realize this capability.
- `features`: List of `FeatureRef` that operationalize the capability.
- `user_journeys`: List of `UserJourneyRef` where capability appears.
- `primary_terms`: `DomainTerm` IDs that define the capability.
- `enterprise_entity_ref`: Optional link to `enterprise-modeling` (e.g. `{ model_id, node_id, archimate_type: "BusinessCapability" }`).

---

### 4. Feature

**Purpose**: User-visible or API-level feature, typically smaller than a product and often released incrementally.

**Key properties (suggested)**:

- `id`: Stable identifier.
- `name`: Feature name (ideally aligned with `DomainTerm`).
- `description`: What the feature does and for whom.
- `product`: `ProductRef` (primary product).
- `status`: `"planned" | "in-development" | "released" | "deprecated"` or similar.
- `release_version`: Optional version / milestone identifier.
- `personas`: Optional list of personas impacted.
- `metrics`: Optional list of metrics (adoption, usage, error rates).

**Typical relationships**:

- `capabilities`: List of `CapabilityRef` this feature supports.
- `user_journeys`: List of `UserJourneyRef` where feature appears.
- `domain_terms`: `DomainTerm` IDs closely tied to the feature name/description.
- `artifact_refs`: List of `ArtifactRef` objects referencing code and related artifacts (shared contract with `code-discovery-for-docs`).
- `docs_refs`: Optional references to key documentation artifacts (could be URLs, vault-relative paths, or catalog IDs).

---

### 5. UserJourney

**Purpose**: End-to-end journey for a user or persona, spanning multiple products, capabilities, and features.

**Key properties (suggested)**:

- `id`: Stable identifier.
- `name`: Journey name.
- `persona`: Primary user or actor (string or structured object).
- `trigger`: How the journey starts.
- `steps`: Ordered list of steps (with optional step IDs and descriptions).
- `success_criteria`: What it means for the journey to succeed.
- `failure_modes`: Optional high-level failure points.
- `channels`: Optional list of channels (web, mobile, API, support).

**Typical relationships**:

- `products`: List of `ProductRef` involved.
- `capabilities`: List of `CapabilityRef` exercised.
- `features`: List of `FeatureRef` touched.
- `domain_terms`: `DomainTerm` IDs central to the journey.

---

## Shared Reference Types

To stay compatible with `code-discovery-for-docs` and other skills, references are modeled as **lightweight, portable objects**.

> If the `code-discovery-for-docs` skill defines richer reference types, this catalog SHOULD treat those as the source of truth and store only the minimal fields needed for linking.

### Entity Reference Types

These are small objects used within other entities:

- **ProductRef**
  - `{ id, name? }`
- **CapabilityRef**
  - `{ id, name? }`
- **FeatureRef**
  - `{ id, name? }`
- **UserJourneyRef**
  - `{ id, name? }`

Including `name` is optional but useful for human-facing artifacts and debugging.

---

### ArtifactRef (shared with `code-discovery-for-docs`)

**Purpose**: Link catalog entities (especially Features and Capabilities) to concrete code artifacts discovered elsewhere.

**Suggested minimal shape**:

```json
{
  "id": "artifact-123",
  "kind": "module | api | test | config | job | other",
  "label": "OrdersService.listOrders",
  "source": "code-discovery-for-docs",
  "origin": {
    "module_map_id": "modulemap-xyz",
    "api_index_id": "apiindex-abc"
  },
  "locations": [
    {
      "repo": "name-or-url",
      "path": "src/orders/service.ts",
      "symbol": "listOrders"
    }
  ]
}
```

The catalog skill SHOULD:

- Treat `ArtifactRef` as **opaque** beyond these fields.
- Avoid duplicating large code maps; instead, **reference** them via IDs and locations.

---

## Relationship Patterns (Examples)

These are **patterns**, not mandatory rules. They help other skills reason about the catalog.

### Product–Capability–Feature Chain

- A **Product** typically:
  - Aggregates multiple **Capabilities** it provides to users or internal systems.
  - Contains multiple **Features** as incremental deliverables.
- A **Capability**:
  - May be realized by more than one **Product** (e.g. shared platforms).
  - Has multiple **Features** that expose it to users or APIs.

Example (informal):

- Product P1 "Payments Platform"
  - Capability C1 "Collect Payments"
  - Capability C2 "Refund Payments"
  - Feature F1 "Card Checkout"
  - Feature F2 "Refund via Dashboard"

### Journey–Capability–Feature Path

- A **UserJourney** might:
  - Touch capabilities C1 (Collect), C3 (Notify), C4 (Reconcile).
  - Invoke features F1 (Card Checkout), F3 (Email Receipt), F5 (Reconciliation Screen).
- Documentation and governance can then:
  - Check if each journey step has adequate docs.
  - Evaluate risk and impact when a capability or feature changes.

### DomainTerm Anchoring

- Every key **Product**, **Capability**, and **Feature** SHOULD:
  - Be anchored to at least one `DomainTerm`.
  - Avoid inventing new labels when canonical terms exist.

This enables `documentation-governance` to:

- Enforce canonical naming.
- Flag deprecated terms across docs and code commentary (via downstream skills).

---

## Versioning and Evolution

- The catalog skill does **not** enforce a specific persistence format.
- Callers SHOULD:
  - Maintain stable `id` values for long-lived entities.
  - Record changes (e.g. via version control, Neo4j, or other systems) outside this conceptual model.
  - Treat additions as **additive** and deprecations as status changes rather than hard deletes where possible.

The model is intentionally minimal so that:

- It remains portable across organizations and vaults.
- It can be extended by environment-specific adapters (e.g. adding pricing, SLAs, compliance flags) without breaking global semantics.

