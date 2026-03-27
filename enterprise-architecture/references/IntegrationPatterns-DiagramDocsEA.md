## Diagram, Documentation, and Enterprise-Modeling Integration Patterns

This reference captures **vault-agnostic integration patterns** between:

- Global, domain-neutral **`diagram`** skill
- Ai-Vault-specific **`enterprise-modeling`** skill
- Global and vault-level **documentation / tech-documentation** skills
- Global **deep-research / research-analysis** skills

Use these patterns when wiring skills together (e.g. in `tech-documentation`, `documentation`, `deep-research`) so that:

- `diagram` stays **domain-neutral**
- `enterprise-modeling` remains the **CAI enterprise-modeling core** for this vault
- Documentation and research skills call them via **clear contracts**, not implicit assumptions

---

### 1. Architecture / Capability Docs Flow

**Goal:** Produce architecture or capability documentation that is backed by the enterprise model and has consistent diagrams.

1. **Authoring / Request**
   - User asks documentation skill: “Create an architecture doc / capability overview for X.”
2. **Model-aware enrichment**
   - Documentation skill calls `enterprise-modeling` to:
     - Fetch or derive relevant entities (Capabilities, BusinessActors, Applications, etc.)
     - Produce **viewpoint-oriented summaries** (e.g. capability view, organization view, application cooperation view).
3. **Diagram generation**
   - `enterprise-modeling` emits a **diagram-ready graph slice** (nodes, edges, clusters, diagram kind) for each viewpoint.
   - Documentation skill calls `diagram` with:
     - The semantic graph
     - Desired format (draw.io by default)
     - Usage context (inline in Markdown, separate `.drawio` file, etc.)
4. **Doc assembly**
   - Documentation skill embeds:
     - Textual viewpoints from `enterprise-modeling`
     - Generated diagrams from `diagram`
   - References to model entities use **stable IDs** from Neo4j so docs stay aligned with the enterprise model.

**Key contracts:**
- `enterprise-modeling` → documentation: viewpoint text + structured graph slice + stable entity IDs.
- documentation → `diagram`: semantic graph + format + usage; treat node IDs as bindings to model entities.

---

### 2. Research-Informed Modeling Flow

**Goal:** Turn research findings into proposed updates to the enterprise model and downstream architecture documentation.

1. **Research execution**
   - User runs `deep-research` / `research-analysis` to investigate a topic (e.g. “customer onboarding process”, “market entry strategy”).
2. **Structured research outputs**
   - Research skills produce:
     - Narrative report
     - Structured sections such as “Findings”, “Implications”, “Candidate entities/relationships”.
3. **Model proposal**
   - Research skill (or user) calls `enterprise-modeling` with:
     - Relevant excerpts or structured sections
     - Any candidate entities/relationships plus confidence scores (when available).
   - `enterprise-modeling` runs its standard workflow (classify → extract entities → propose relationships → propose model update).
4. **Documentation / architecture follow-up**
   - Once updates are validated and applied in Neo4j, documentation skills:
     - Pull updated viewpoints from `enterprise-modeling`
     - Optionally regenerate diagrams via `diagram` (see Flow 4).

**Key contracts:**
- research → `enterprise-modeling`: curated text + candidate entities/relationships (optional) + context about scope.
- `enterprise-modeling` → documentation: updated viewpoints and model slices for docs/diagrams.

---

### 3. Diagram-Only Flow (No Enterprise Model)

**Goal:** Create diagrams that are **not** backed by the enterprise model (e.g. ad hoc flowcharts, UI flows, API call sequences).

1. **Authoring / Request**
   - User asks `diagram`: “Draw a flowchart for the signup flow in this app” (no enterprise model mentioned).
2. **Semantic skeleton**
   - `diagram` builds a semantic graph directly from text (nodes, edges, clusters, diagram kind).
3. **Rendering**
   - `diagram` emits the chosen format (draw.io XML, Excalidraw JSON, Mermaid, etc.).

**Key constraints:**
- `enterprise-modeling` is **not** involved.
- No Neo4j IDs are assumed; if the caller wants later alignment with the enterprise model, they must explicitly call `enterprise-modeling` with the relevant text and then re-bind diagram nodes to model entities.

---

### 4. Model-Driven Diagram Refresh Flow

**Goal:** Refresh existing diagrams when the underlying enterprise model changes (e.g. a capability is split, a new application is added).

1. **Change in model**
   - Enterprise model is updated via `enterprise-modeling` (new entities/relationships, changed ownership, etc.).
2. **View selection**
   - Documentation or architecture-focused skill identifies which viewpoints/diagrams are impacted (e.g. via stored `ArtifactRef` links).
3. **Fresh graph slice**
   - Documentation or integration skill calls `enterprise-modeling` to:
     - Recompute the relevant viewpoint(s)
     - Emit **updated diagram-ready graph slices** (nodes, edges, clusters, diagram kind) with the same stable IDs.
4. **Diagram regeneration / update**
   - Caller invokes `diagram` with:
     - Updated semantic graph
     - Existing diagram’s binding information if available (to preserve layout where possible)
   - `diagram` either:
     - Regenerates the diagram from scratch, or
     - Applies updates while preserving layout and styling as much as the format allows.

**Key contracts:**
- Stable IDs from `enterprise-modeling` allow **diagram nodes to be re-bound** to updated entities.
- Callers own the mapping between diagram files and model views (e.g. via `ArtifactRef`).

---

### 5. Responsibilities Summary

- **enterprise-modeling (vault / CAI-specific)**
  - Owns **enterprise semantics** (entities, relationships, viewpoints) and Neo4j persistence.
  - Exposes **viewpoint text + diagram-ready graph slices** with stable IDs.
  - Consumes research outputs and enterprise text; does not own generic documentation or diagramming.

- **diagram (global, domain-neutral)**
  - Owns **diagram semantics and formats** (nodes/edges/clusters, layout, draw.io/Excalidraw/Mermaid, etc.).
  - Treats IDs as bindings to upstream systems (enterprise model, catalogs, code discovery).
  - Does not embed vault- or company-specific assumptions.

- **documentation / tech-documentation (global + vault)**
  - Orchestrates doc workflows, calling `enterprise-modeling`, `diagram`, and research skills where appropriate.
  - Owns doc structure, narrative, and publishing flows.

- **deep-research / research-analysis (global)**
  - Own research execution, retrieval, and synthesis.
  - Provide structured outputs that can be handed off to `enterprise-modeling` and documentation skills.

