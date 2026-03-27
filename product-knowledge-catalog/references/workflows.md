# product-knowledge-catalog — Workflow Details

Deeper guidance and examples for each workflow mode exposed by the **product-knowledge-catalog** skill.

The intent is to:

- Keep `SKILL.md` concise.
- Provide concrete, copy-pastable patterns for callers and sub-agents.

---

## 1. Catalog Initialization / Import

### Typical Inputs

- Table-like sources:
  - CSV/Excel exports of products, capabilities, or features.
  - Tables embedded in Markdown, Confluence, or Word.
- Structured sources:
  - JSON payloads from APIs (e.g. product DB, Jira epics, feature flags).
- Unstructured sources:
  - Existing product overview docs or capability maps.

### Recommended Steps

1. **Classify rows/items**:
   - For each row (or object), infer whether it is best modeled as:
     - `DomainTerm`
     - `Product`
     - `Capability`
     - `Feature`
     - `UserJourney`
   - Use column headings, field names, and surrounding text as clues.
2. **Propose entity candidates**:
   - Emit draft JSON objects for each inferred entity with:
     - `id` (temporary, can be refined later).
     - Core properties filled from the source.
     - `assumptions` and `confidence_score` where inference is fuzzy.
3. **Detect duplicates and collisions**:
   - Flag potential duplicates (same or similar `name`/`definition`).
   - Suggest merges or splits when appropriate.
4. **Produce a human-review bundle**:
   - Group entities by type (Products, Capabilities, Features, etc.).
   - Provide a short checklist:
     - "Confirm these 10 capabilities."
     - "Resolve these 3 ambiguous features vs. capabilities."
     - "Approve or rename these 5 domain terms."

### Example Prompt Pattern

> "Given this CSV of our Payments domain (columns: Name, Type, Owner, Lifecycle, Description), infer products, capabilities, and features using the catalog data model, propose normalized JSON, and call out any ambiguous rows."

---

## 2. Term Normalization & Glossary

### Typical Inputs

- Existing catalog entities (some may be inconsistent or incomplete).
- Excerpts from documentation, tickets, or wiki pages.
- Lists of terms from stakeholders.

### Recommended Steps

1. **Harvest candidate terms**:
   - Extract distinct noun phrases and important labels from the inputs.
   - Map them against existing `DomainTerm` entries.
2. **Propose canonical clusters**:
   - For each cluster of similar labels:
     - Select a recommended `name`.
     - Mark others as `synonyms` or `abbreviations`.
     - Optionally mark some as `deprecated` if they cause confusion.
3. **Align with entities**:
   - Suggest which `Product`, `Capability`, and `Feature` entities should reference which `DomainTerm` IDs.
4. **Generate glossary views**:
   - Produce Markdown sections for:
     - A domain-level glossary (e.g. "Payments Glossary").
     - Product- or capability-specific glossaries, when requested.

### Example Prompt Pattern

> "Normalize terminology across these three capability docs and our existing catalog; propose a canonical glossary and mark deprecated terms with explanations."

---

## 3. Catalog Query & Impact Analysis

### Typical Questions

- "Which capabilities does Product X implement?"
- "Which products and features realize Capability Y?"
- "Which features participate in User Journey Z?"
- "If we deprecate Feature F, which capabilities, journeys, artifacts, and docs are impacted?"

### Recommended Steps

1. **Resolve the anchor entity**:
   - Map the user’s input to one or more catalog entities (by `id` or `name`).
2. **Traverse relationships**:
   - Follow links to related entities:
     - Products ↔ Capabilities ↔ Features ↔ UserJourneys.
     - DomainTerms where relevant for terminology impact.
3. **Include code and doc traceability where available**:
   - For each impacted `Feature` or `Capability`:
     - Pull attached `artifact_refs` (if present).
     - Enumerate code modules, APIs, tests, and configs implicated.
     - List any `docs_refs` provided.
4. **Summarize impact**:
   - Group impacts by type:
     - Catalog entities (products/capabilities/features/journeys).
     - Code artifacts (modules/APIs/tests).
     - Documentation hints (e.g. "runbooks mentioning Capability Y").
   - Provide a **prioritized** summary (e.g. "High impact on journeys A and B; moderate impact on feature F2").

### Example Prompt Pattern

> "Given this catalog JSON, list all products and features that use Capability 'Collect Payments', and summarize which user journeys and code artifacts would be impacted by a change to that capability."

---

## 4. Catalog-to-Docs Scaffolding

### Typical Scenarios

- New or updated:
  - Product overview docs.
  - Capability descriptions or maps.
  - User journey narratives and diagrams.
  - Release notes structured by capabilities and features.

### Recommended Steps

1. **Determine doc intent and audience**:
   - Examples:
     - "Executive overview."
     - "Developer integration guide."
     - "Runbook / operational playbook."
2. **Select relevant catalog entities**:
   - For a product doc:
     - One `Product`, its `Capabilities`, `Features`, and key `UserJourneys`.
   - For a capability doc:
     - One `Capability`, supporting `Products`, and representative `Features` and `UserJourneys`.
3. **Propose outline**:
   - Sections such as:
     - Context / Purpose.
     - Key Concepts (DomainTerms).
     - Capabilities and Features.
     - User Journeys and Flows.
     - Dependencies and Integrations.
     - Glossary.
4. **Embed catalog hints**:
   - Inline in the outline, include:
     - Entity IDs and names.
     - Short descriptions.
     - Key relationships (e.g. "Feature F1 realizes Capability C2").
   - These hints help `tech-documentation` or other doc skills expand into full prose while staying aligned with the catalog.

### Example Prompt Pattern

> "Using this catalog snippet for Product X and its capabilities/features, create a Markdown outline for an architecture overview doc, including where diagrams and glossary sections should go."

---

## Adapter Pattern (Environment-Specific Storage)

The catalog skill itself is **vault-agnostic** and does not decide:

- Where catalog files live.
- How they are versioned.
- Which DBs or graph stores to use.

Environment- or vault-specific skills (e.g. Ai-Vault `documentation` or a future `product-catalog-adapter`) SHOULD:

- Define:
  - Storage locations (e.g. Markdown folder, JSON files, Neo4j nodes).
  - Naming conventions (e.g. `catalog/product-entities.json`).
  - Backup/versioning strategy.
- Provide:
  - Read/write helpers that expose catalog snapshots to this skill.
  - Mapping logic between local schemas and the conceptual model here.

This separation ensures:

- The **conceptual model** can stay stable and portable.
- Each environment can evolve its storage and tooling without breaking the global skill contract.

