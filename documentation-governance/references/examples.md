# documentation-governance — Worked Examples

This reference provides **end-to-end examples** showing how policies, assessments, and reports can be combined in practice.

---

## Example 1 — Architecture Doc Policy + Single-File Assessment

### 1. Define `DocTypePolicy`

See `policy-schema.md` for full field descriptions. A minimal architecture doc policy might be:

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
    - id: "risks"
      label: "Risks & Mitigations"
      min_length: 150
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

### 2. Provide an `ArtifactRef` for the doc

```yaml
ArtifactRef:
  id: "arch-doc-payments-v1"
  kind: "markdown-doc"
  path: "docs/architecture/payments-architecture.md"
  doc_type: "architecture-doc"
  title: "Payments Service Architecture"
  tags: ["architecture", "payments"]
  related_ids: []
```

### 3. Run Single-File Doc Assessment

`documentation-governance` evaluates the document’s structure, content, and terminology against the policy and produces:

```yaml
DocAssessmentResult:
  kind: "doc"
  id: "assess-arch-doc-payments-2025-03-13"
  artifact:
    id: "arch-doc-payments-v1"
    kind: "markdown-doc"
    path: "docs/architecture/payments-architecture.md"
    doc_type: "architecture-doc"
    title: "Payments Service Architecture"
    tags: ["architecture", "payments"]
    related_ids: []
  policies_applied: ["arch-doc-v1"]
  status: "warn"
  scores:
    structure: 80
    clarity: 75
    completeness: 65
    terminology: 90
  findings:
    - id: "missing-risks-section"
      severity: "major"
      category: "structure"
      message: "Required 'Risks & Mitigations' section is missing."
      location: null
      suggested_fix: "Add a 'Risks & Mitigations' section describing key risks and mitigations."
    - id: "low-completeness"
      severity: "minor"
      category: "completeness"
      message: "Context section is shorter than recommended; consider elaborating system boundaries and dependencies."
      location: "section:context"
      suggested_fix: "Expand the Context section with more details on upstream/downstream systems."
  gating_decision:
    recommended: "warn"
    rationale: "Missing required risks section; may be acceptable for early drafts but should be added before final approval."
  metadata:
    assessed_at: "2025-03-13T12:34:56Z"
    assessor: "documentation-governance"
```

An orchestrator such as `tech-documentation` can then:

- Present findings inline in the editor.
- Offer to apply suggested fixes interactively.
- Re-run the assessment until the status is `"pass"`.

---

## Example 2 — CoveragePolicy + Portfolio Assessment

### 1. Define a `CoveragePolicy` for modules

```yaml
CoveragePolicy:
  id: "payments-module-coverage-v1"
  scope:
    dimension: "module"
    key_prefix: "payments-"
  required_doc_types:
    - doc_type: "architecture-doc"
      min_per_entity: 1
      freshness_days: 365
    - doc_type: "runbook"
      min_per_entity: 1
      freshness_days: 180
  optional_doc_types:
    - doc_type: "api-reference"
  risk_rules:
    high_risk_if_missing: ["runbook"]
    medium_risk_if_missing: ["architecture-doc"]
  aggregation:
    bucket_by: ["team"]
  metadata:
    owner: "SRE Guild"
    last_updated: "2025-03-13T00:00:00Z"
```

### 2. Use `ModuleMap` + doc inventory

- `code-discovery-for-docs` provides a `ModuleMap` for services whose IDs start with `"payments-"`.
- A documentation inventory provides `ArtifactRef`s mapped to those modules.

### 3. Run Portfolio Coverage Scan

`documentation-governance` computes coverage for each module:

```yaml
PortfolioAssessmentResult:
  kind: "portfolio"
  id: "portfolio-payments-modules-2025-03-13"
  scope:
    dimension: "module"
    filter: "payments-*"
  coverage_policy_ids: ["payments-module-coverage-v1"]
  status: "warn"
  metrics:
    total_entities: 5
    covered_entities: 3
    coverage_percent: 60.0
  per_entity:
    - entity_id: "payments-core"
      entity_label: "Payments Core"
      status: "pass"
      missing_doc_types: []
      stale_doc_types: []
    - entity_id: "payments-gateway"
      entity_label: "Payments Gateway"
      status: "warn"
      missing_doc_types: ["runbook"]
      stale_doc_types: []
    - entity_id: "payments-reports"
      entity_label: "Payments Reports"
      status: "fail"
      missing_doc_types: ["runbook", "architecture-doc"]
      stale_doc_types: []
    - entity_id: "payments-risk"
      entity_label: "Payments Risk"
      status: "fail"
      missing_doc_types: ["runbook"]
      stale_doc_types: ["architecture-doc"]
    - entity_id: "payments-batch"
      entity_label: "Payments Batch"
      status: "warn"
      missing_doc_types: []
      stale_doc_types: ["runbook"]
  risk_summary:
    high_risk_count: 2
    medium_risk_count: 2
    low_risk_count: 1
  metadata:
    assessed_at: "2025-03-13T13:00:00Z"
    notes: "High-risk due to missing/stale runbooks in payments-risk and payments-reports."
```

This object can drive:

- Governance dashboards.
- Quarterly reports.
- Focused remediation backlogs for teams.

---

## Example 3 — PR / Change Impact Check (High Level)

Inputs:

- PR touches modules `orders-service` and `payments-core`.
- `code-discovery-for-docs` identifies changed APIs.
- Orchestrator passes impacted entities and any modified docs to `documentation-governance`.

`documentation-governance`:

1. Identifies docs that reference `orders-service` or `payments-core`.
2. Runs Single-File assessments for those docs.
3. Checks relevant `CoveragePolicy` records for the impacted scope.
4. Produces a small bundle of `DocAssessmentResult` + a summarized `PortfolioAssessmentResult` for the impacted entities only.

CI or a vault-local adapter can then:

- Block merge if status is `"fail"`.
- Mark as `"warn"` but allow overrides with justification.
- Automatically open remediation tickets based on findings if desired.

