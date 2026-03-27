# documentation-governance — Policy & Result Schemas

This reference defines the core data structures used by `documentation-governance` and adjacent skills.

It is intentionally **implementation-agnostic**: callers may store these objects as JSON, YAML, or other serializations, as long as the fields and semantics are preserved.

---

## Shared Helper Types (Contracts)

The following helper types are **consumed** by `documentation-governance` and are expected to be defined canonically in shared references or adjacent skills.

```yaml
ArtifactRef:
  id: string                  # Stable logical identifier for the artifact
  kind: string                # e.g., "markdown-doc", "runbook", "api-reference"
  path: string                # Repository or vault path (relative or absolute, per environment)
  doc_type: string            # Canonical doc type key, e.g., "architecture-doc", "runbook"
  title: string               # Human-readable title
  tags: string[]              # Free-form tags or taxonomy labels
  related_ids: string[]       # Optional: related ArtifactRef IDs (e.g., spec ↔ runbook)

ModuleMap:
  modules: Module[]

Module:
  id: string                  # Stable module/service identifier
  name: string
  tags: string[]
  owned_by: string | null     # Optional: team/owner identifier

APIIndex:
  apis: API[]

API:
  id: string                  # Stable API or endpoint group ID
  name: string
  method: string              # e.g., GET, POST
  path: string                # e.g., /payments/{id}
  tags: string[]

DomainTerm:
  id: string                  # Stable term ID
  term: string                # Canonical label (e.g., "Payments", "Order Management")
  kind: string                # e.g., "product", "capability", "feature"
  synonyms: string[]          # Known alternative phrasings
  description: string
```

> Recommended canonical locations (not created by this skill):
> - `~/.claude/skills/shared/references/artifacts-and-coverage-schema.md`
> - `~/.claude/skills/shared/references/domain-terms-and-catalog-schema.md`

---

## DocTypePolicy

Represents governance expectations for a **single doc type** (e.g. "architecture-doc", "runbook").

```yaml
DocTypePolicy:
  id: string                      # Policy ID, stable within an environment
  doc_type: string                # Canonical doc type key
  version: string                 # e.g., "1.0.0"
  title: string                   # Human-readable name (e.g., "Architecture Doc v1")
  description: string

  applies_to:
    artifact_kinds: string[]      # e.g., ["markdown-doc"]
    tags_any: string[]            # Optional: applies when any tag matches
    tags_all: string[]            # Optional: applies when all tags present

  required_sections:
    - id: string                  # Section identifier (e.g., "context", "architecture-view")
      label: string               # Human label for readers
      min_length: integer | null  # Optional: min word/character count
      must_appear_once: boolean   # Enforce at most one instance

  optional_sections:
    - id: string
      label: string

  prohibited_sections:
    - id: string                  # e.g. "implementation-details" for high-level docs

  style_guidelines:
    reading_level: string | null  # e.g., "engineer", "executive"
    voice: string | null          # e.g., "neutral", "formal"
    terminology_requirements:
      allowed_terms: string[]     # IDs or labels from DomainTerm
      banned_terms: string[]      # Strings to avoid

  coverage_expectations:
    # Optional per-doc coverage hints (cross-checked with CoveragePolicy)
    must_reference_modules: boolean
    must_reference_products: boolean

  quality_gates:
    min_structure_score: integer  # 0-100
    min_clarity_score: integer    # 0-100
    min_completeness_score: integer

  metadata:
    owner: string | null          # Team/role responsible for the policy
    last_updated: string          # ISO timestamp
```

---

## CoveragePolicy

Represents expected **coverage** across a portfolio for modules, APIs, products, or capabilities.

```yaml
CoveragePolicy:
  id: string
  scope:
    dimension: string             # "module" | "api" | "product" | "capability"
    key_prefix: string | null     # Optional: filter by ID prefix (e.g., "payments-")

  required_doc_types:
    - doc_type: string            # e.g., "architecture-doc"
      min_per_entity: integer     # e.g., 1
      freshness_days: integer     # Max age before considered stale

  optional_doc_types:
    - doc_type: string

  risk_rules:
    high_risk_if_missing: string[]  # Doc types whose absence is "high risk"
    medium_risk_if_missing: string[]

  aggregation:
    bucket_by: string[]           # e.g., ["team", "domain"]

  metadata:
    owner: string | null
    last_updated: string
```

Coverage policies are evaluated by comparing:

- Baseline entities (modules/APIs or catalog entities) from `ModuleMap` / `APIIndex` / catalog, and
- Actual docs mapped via `ArtifactRef` (e.g., by tags or explicit IDs).

---

## AssessmentResult

Canonical result object for governance assessments. Designed to be reused across skills and workflows.

### Status Enum

```yaml
AssessmentStatus:
  - pass     # Meets policy / coverage expectations
  - warn     # Non-blocking issues or partial coverage
  - fail     # Blocking issues for defined quality gates
  - unknown  # Insufficient data (e.g., missing baselines)
```

### Doc-Level AssessmentResult

```yaml
DocAssessmentResult:
  kind: "doc"
  id: string                       # Result ID
  artifact: ArtifactRef
  policies_applied: string[]       # DocTypePolicy IDs
  status: string                   # AssessmentStatus

  scores:
    structure: integer             # 0-100
    clarity: integer
    completeness: integer
    terminology: integer | null

  findings:
    - id: string
      severity: string             # "info" | "minor" | "major" | "critical"
      category: string             # e.g., "structure", "terminology", "coverage"
      message: string
      location: string | null      # Optional: section/line reference
      suggested_fix: string | null

  gating_decision:
    recommended: string            # "pass" | "warn" | "fail"
    rationale: string

  metadata:
    assessed_at: string            # ISO timestamp
    assessor: string | null        # Optional: tool/skill identifier
```

### Portfolio-Level AssessmentResult

```yaml
PortfolioAssessmentResult:
  kind: "portfolio"
  id: string
  scope:
    dimension: string              # "module" | "api" | "product" | "capability"
    filter: string | null          # e.g., "payments-*"

  coverage_policy_ids: string[]
  status: string                   # Overall AssessmentStatus for the portfolio

  metrics:
    total_entities: integer
    covered_entities: integer
    coverage_percent: number       # 0-100

  per_entity:
    - entity_id: string
      entity_label: string
      status: string               # AssessmentStatus for that entity
      missing_doc_types: string[]
      stale_doc_types: string[]

  risk_summary:
    high_risk_count: integer
    medium_risk_count: integer
    low_risk_count: integer

  metadata:
    assessed_at: string
    notes: string | null
```

---

## Storage & Versioning Recommendations

- **Policy storage**:
  - Store `DocTypePolicy` and `CoveragePolicy` as YAML or JSON in a dedicated configuration area (e.g., `governance/policies/`).
  - Group by domain or product where helpful (e.g., `payments-architecture-policy.yaml`).
- **Result storage**:
  - For long-running governance, store `AssessmentResult` objects alongside reports or dashboards.
  - Include `assessed_at` and policy version information for traceability.
- **Compatibility**:
  - Callers MAY add additional fields, but SHOULD avoid changing core field meanings to preserve interoperability across skills.

---

## Minimal End-to-End Example (Architecture Doc)

```yaml
DocTypePolicy:
  id: "arch-doc-v1"
  doc_type: "architecture-doc"
  version: "1.0.0"
  title: "Architecture Document v1"
  description: "Standard structure for system architecture documents."
  applies_to:
    artifact_kinds: ["markdown-doc"]
    tags_any: ["architecture"]
    tags_all: []
  required_sections:
    - id: "context"
      label: "Context"
      min_length: 200
      must_appear_once: true
    - id: "architecture-view"
      label: "Architecture View"
      min_length: 200
      must_appear_once: true
  optional_sections:
    - id: "alternatives"
      label: "Alternatives Considered"
  prohibited_sections: []
  style_guidelines:
    reading_level: "engineer"
    voice: "neutral"
    terminology_requirements:
      allowed_terms: ["payments", "orders"]
      banned_terms: ["old-product-name"]
  coverage_expectations:
    must_reference_modules: true
    must_reference_products: false
  quality_gates:
    min_structure_score: 70
    min_clarity_score: 70
    min_completeness_score: 70
  metadata:
    owner: "Architecture Guild"
    last_updated: "2025-03-13T00:00:00Z"
```

Callers can pair this with a `CoveragePolicy` and `DocAssessmentResult` as illustrated in `references/examples.md`.

