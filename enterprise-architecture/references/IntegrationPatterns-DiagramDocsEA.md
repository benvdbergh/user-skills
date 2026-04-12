## Diagram, documentation, and enterprise model integration patterns

Vault-agnostic patterns for wiring skills together so **`diagram`** stays domain-neutral, **global methodology** stays in **`enterprise-architecture`**, and **Ai-Vault persistence** stays in **`enterprise-model-store`** (when that project skill exists).

Use these patterns when orchestrating `tech-documentation`, `documentation`, `deep-research`, or `research-analysis`.

**Split of responsibilities**

| Concern | Skill |
|---------|--------|
| Classify text, extract entities, propose relationships, gap/quality, arc42/ArchiMate methodology | **`enterprise-architecture`** (global) |
| `ontology-v1.json`, Neo4j MCP, validation/apply workflows, Obsidian from graph | **`enterprise-model-store`** (Ai-Vault / CAI project) |
| Diagram formats and layout (draw.io, Excalidraw, Mermaid, …) | **`diagram`** |

See also `references/CrossSkillAndOntologySources.md`.

---

### 1. Architecture / capability docs flow

**Goal:** Documentation backed by the enterprise model and consistent diagrams.

1. **Authoring** — User asks for architecture or capability documentation.
2. **Model state** — Load or query entities via **`enterprise-model-store`** (e.g. Neo4j `read-cypher`) when available.
3. **Methodology / narrative** — Use **`enterprise-architecture`** for ArchiMate-aligned viewpoints, gaps, and quality language where needed.
4. **Diagram generation** — Build a **diagram-ready graph slice** (nodes, edges, clusters, diagram kind); call **`diagram`** to render.
5. **Assembly** — Embed narrative + diagrams; reference **stable entity IDs** when the graph is the source of truth.

**Contracts**

- **`enterprise-model-store`** → documentation: authoritative IDs and graph-backed facts.
- **`enterprise-architecture`** → documentation: structured EA methodology and proposal shaping (when not only copying from the graph).
- **`diagram`** → documentation: rendered diagrams from a semantic graph; no vault-specific ontology embedded in the diagram skill.

---

### 2. Research-informed modeling flow

**Goal:** Turn research into **proposed** model updates and downstream docs.

1. Run **`deep-research`** / **`research-analysis`**.
2. Pass curated excerpts (and optional candidate entities/relationships) into **`enterprise-architecture`** workflows (classify → extract → propose relationships → gaps/quality).
3. When using Ai-Vault CAI, compile and validate updates in **`enterprise-model-store`** (`ProposeModelUpdate`, validation workflow, then MCP apply).
4. Refresh documentation and diagrams using flow 1.

**Contracts**

- research → **`enterprise-architecture`**: text + optional structured candidates + scope.
- **`enterprise-model-store`**: validation and persistence; not a substitute for methodology steps.

---

### 3. Diagram-only flow (no enterprise model)

**Goal:** Ad hoc diagrams (flows, sequences, UI) without Neo4j.

1. User asks **`diagram`** directly.
2. Build the semantic graph from the prompt; render.

**Constraints**

- **`enterprise-model-store`** is not involved.
- To align later with a graph, explicitly run modeling workflows and re-bind diagram node IDs.

---

### 4. Model-driven diagram refresh flow

**Goal:** Update diagrams when the enterprise model changes.

1. Model changes applied via **`enterprise-model-store`** (or equivalent graph write path).
2. Identify impacted viewpoints.
3. Re-query or re-derive graph slices (store + optional **`enterprise-architecture`** narrative).
4. Call **`diagram`** with updated semantics; preserve layout bindings when the format allows.

---

### 5. Responsibilities summary

- **`enterprise-architecture`** — Methodology, ArchiMate/arc42 alignment, proposals; tool-agnostic outputs and `diagram` handoff.
- **`enterprise-model-store`** — Project ontology JSON, Neo4j, human-in-the-loop apply, Obsidian generation (Ai-Vault).
- **`diagram`** — Formats and rendering; treats IDs as opaque bindings from upstream.
- **Documentation / tech-documentation** — Narrative structure and publishing; orchestrates the above via clear contracts.
- **deep-research / research-analysis** — Research execution; hands off text and structured hints to **`enterprise-architecture`** (and then **`enterprise-model-store`** when persisting).
