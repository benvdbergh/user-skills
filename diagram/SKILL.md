---
name: diagram
description: >-
  Translates textual content into diagrammatic form and back using a
  format-agnostic semantic model. Supports Author (create), Revise (update),
  Verify (validate), and Interpret (extract insights). Default output: draw.io.
  USE WHEN create diagram, update diagram, validate diagram, diagram from text,
  text from diagram, draw.io, Excalidraw, PlantUML, ArchiMate, flowchart,
  sequence diagram, entity-relationship, visual model.
metadata:
  mcp-server: drawio
  default-format: draw.io
---

# Diagram

Skill for bidirectional translation between **text** and **graphic** diagrammatic representations. Core knowledge is independent of output format; format adapters (draw.io, Excalidraw, PlantUML, ArchiMate, Markdown, etc.) are applied at the edges.

**Default output format: draw.io** (via MCP tools for interactive editing).

---

## Scope and domain neutrality

This skill is **domain-neutral** and **vault-agnostic**: it does not assume any specific enterprise, product, or repository structure. It focuses purely on semantic graph construction (nodes, edges, clusters, diagram kind) and translation to/from diagram formats. Any domain- or vault-specific meaning is supplied by the calling skill (e.g. enterprise-modeling, product-knowledge-catalog, documentation-governance).

---

## When called by other skills

When other skills call `diagram`, they should:

- **Provide a semantic model or structured description** rather than raw prose when possible:
  - Graph-like structures (nodes, edges, clusters, diagram kind)
  - Viewpoint-specific slices (e.g. “capability map view”, “request lifecycle”)
- **Preserve stable identifiers**:
  - Use deterministic IDs or carry through IDs from upstream systems (e.g. entity IDs from enterprise models, feature or module IDs from catalogs/code-discovery)
  - Treat diagram node IDs as bindings to upstream objects, not as presentation-only
- **Specify intended output format and usage**:
  - Format (draw.io default, Excalidraw, PlantUML, Mermaid, etc.)
  - Consumption context (inline in docs, standalone artifact, part of an EA view)

Vault- or environment-specific examples (e.g. diagrams derived from a particular enterprise model or repository) should be treated as **examples only**; they must not introduce hard-coded paths or assumptions into this skill.

---

## Output Methods

### Method 1: VS Code Extension (Preferred when available)

If the user has the **draw.io VS Code extension** installed, write the XML to a `.drawio` file:

```
1. Generate valid draw.io XML following the schema rules below
2. Write to a file with `.drawio` extension (e.g., `diagram.drawio`)
3. User opens the file in VS Code - the draw.io extension renders it natively
```

**Benefits**: No browser required, integrated with IDE, file persists automatically.

### Method 2: MCP Browser Tools (Fallback)

- **Server**: `drawio`
- **Primary Tools**: `mcp__drawio__open_drawio_xml`, `mcp__drawio__open_drawio_csv`, `mcp__drawio__open_drawio_mermaid`
- **Fallback**: Excalidraw MCP (`mcp__excalidraw__*`) when draw.io unavailable or user-specified

## Tool Usage Mapping

| Workflow Step | Output Method | Purpose | Safety Level |
|---------------|---------------|---------|--------------|
| Author (XML) | Write `.drawio` file OR `mcp__drawio__open_drawio_xml` | Create diagram for VS Code or browser | Safe |
| Author (Mermaid) | `mcp__drawio__open_drawio_mermaid` | Open editor from Mermaid syntax (simple diagrams only) | Safe |
| Author (CSV) | `mcp__drawio__open_drawio_csv` | Open editor from tabular data (org charts) | Safe |
| Revise | Read + Edit `.drawio` file OR MCP tool | Modify existing diagram | Safe |
| Interpret | Read `.drawio` file OR `lightbox: true` | View diagram in read-only mode | Safe |

## Tool Safety Policy

- **Safe Operations**: Writing `.drawio` files and MCP tools are non-destructive
- **User Control**: User has full control in the editor to save, export, or discard
- **Lightbox Mode**: Use `lightbox: true` for read-only viewing (Verify, Interpret)

## Core Model: Text ↔ Graphic

### Semantic Layer (Format-Agnostic)

Work in a **semantic diagram model** before emitting any format:

| Concept | Meaning |
|--------|--------|
| **Node** | Logical entity: actor, component, process, state, concept. Has identity, label, optional type. |
| **Edge** | Directed or undirected relationship between two nodes. Has type (e.g. flows-to, contains, implements). |
| **Cluster** | Grouping of nodes (e.g. swimlane, subsystem, layer). |
| **Diagram kind** | Semantic type: flowchart, sequence, ER, architecture, mind map, etc. Drives layout and conventions. |

**Translation principles:**

- **Text → Graphic**: Extract nodes and edges from prose, lists, or structured text. Classify diagram kind. Produce semantic skeleton (nodes + edges + clusters), then pass to layout and format adapter.
- **Graphic → Text**: Treat diagram as a graph (nodes = concepts, edges = relationships). Extract labels and connection structure; verbalize as summary, list of entities/relations, or structured description. Prefer symbolic representation (JSON/XML/ASCII) when parsing diagrams rather than raw pixel/coordinate intuition.

### Spatial Reasoning Constraints (LLM-Aware)

- LLMs reason over **tokens**, not continuous geometry. Strong at qualitative relationships (“A contains B”), weaker at exact coordinates and multi-hop spatial consistency.
- Prefer **symbolic and structural output** (schema, graph, ASCII sketch) over guessing pixel positions.
- Use **layout algorithms** (e.g. Dagre, ELK) for coordinates when targeting canvas formats; prefer automated layout over hand-computed coordinates for complex diagrams.
- **Bidirectional bindings** (e.g. arrow ↔ shape references) are error-prone in one-shot generation; implement or use tools that update both sides of a connection atomically.

Detailed mechanics (ASCII-to-structured conversion, binding rules, DiagramEval-style validation) are in [references/reference.md](references/reference.md).

---

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Author** | "create diagram", "diagram from text", "draw flowchart" | (Workflow §1–5) |
| **Revise** | "update diagram", "modify diagram", "change diagram" | (Workflow §1–5) |
| **Verify** | "validate diagram", "check diagram", "verify diagram" | (Workflow §5) |
| **Interpret** | "text from diagram", "explain diagram", "summarize diagram" | (Workflow §1–2, then extract) |

---

## Action Taxonomy

Four diagram actions; each consumes or produces the semantic model and optionally a target format.

| Action | Direction | Purpose |
|--------|-----------|--------|
| **Author** | Text → Diagram | Create a new diagram from description, requirements, or structured text. |
| **Revise** | Diagram + Text → Diagram | Update an existing diagram (add/remove/relabel nodes or edges, change layout or style). |
| **Verify** | Diagram → Report | Validate correctness: schema, bindings, node/edge consistency, optional DiagramEval-style node/path alignment. |
| **Interpret** | Diagram → Text | Extract insights: summarize structure, list entities and relations, answer questions about the diagram. |

- **Author** and **Revise** are **text-to-graphic**; **Interpret** is **graphic-to-text**; **Verify** is **graphic-to-report** (quality assessment).

**Action bias:** Implementation-oriented for Author/Revise (produce artifacts); analysis-oriented for Interpret (extract insights); quality-check for Verify (validate correctness).

---

## Workflow

### 1. Ingest and classify

- Parse user input (free text, list, spec, or existing diagram in a supported format).
- Identify **diagram kind** (flowchart, sequence, ER, architecture, etc.) and **intended output format** if specified (Excalidraw, draw.io, PlantUML, Markdown, ArchiMate, etc.).

### 2. Build semantic skeleton

- **Nodes**: distinct entities with ids, labels, types; assign to clusters if needed.
- **Edges**: source, target, type; no coordinates yet.
- Optionally produce a **low-fidelity ASCII sketch** to confirm structure with the user before rendering.

### 3. Layout (when output is canvas-based)

- Use layout engine (Dagre, ELK, or format-specific) to assign positions. Do not rely on the model to place coordinates for large diagrams.

### 4. Emit via format adapter

- Map semantic model + layout to the chosen **target format** (e.g. Excalidraw JSON, draw.io XML, PlantUML, Mermaid, ArchiMate XML). Each adapter has its own schema and binding rules—see reference and format-specific docs.

### 5. Verify (optional)

- Run **Verify** on the emitted artifact: schema validity, binding consistency, and optionally node/path alignment against the intended semantic model.

**Success criteria:**
- **Author**: Complete when a valid artifact in the chosen format is produced and optional Verify passes (or user confirms).
- **Revise**: Complete when the updated diagram reflects requested changes and optional Verify passes.
- **Verify**: Complete when a validation report is produced (pass/fail with specific issues if any).
- **Interpret**: Complete when a text summary, entity list, or answer to the user's question is provided.

---

## Target Formats (Adapter Layer)

Core knowledge does not depend on format. Support for a given format is implemented as an **adapter** that:

- Accepts: semantic model (nodes, edges, clusters, diagram kind) + optional layout result.
- Produces: valid artifact in that format (file or string).
- For **Revise** and **Interpret**: accepts artifact in that format and parses it back into the semantic model (or equivalent graph).

| Format | Typical use | Notes |
|--------|--------------|--------|
| **draw.io** (DEFAULT) | Professional diagrams, XML | mxGraph XML; MCP tools for interactive editing. Use `mcp__drawio__open_drawio_*` tools. |
| **Excalidraw** | Hand-drawn style canvas, JSON | Flat elements array; bidirectional bindings. Fallback when draw.io unavailable. |
| **PlantUML** | UML, sequence, code-as-diagram | Textual DSL; good for Author from text. |
| **Markdown / Mermaid** | Docs, simple diagrams | In-code flowcharts, sequences; easy round-trip. Can pass to `mcp__drawio__open_drawio_mermaid`. |
| **ArchiMate** | Enterprise architecture | Ontology and notation constraints; views and layers. |

When adding a new platform (e.g. draw.io, ArchiMate), add an adapter that implements the **semantic interface** (serialize/deserialize semantic model + layout); see [references/reference.md](references/reference.md) § Adapter contract. Keep coordinate and schema details in the adapter or its doc, not in the core skill text.

---

## Examples

**Example 1: Author (create flowchart via draw.io MCP)**
```
User: "Draw a flowchart for user login"
→ Classify: diagram kind = flowchart, format = draw.io (default)
→ Build semantic skeleton:
  - Nodes: "Start", "Enter credentials", "Validate", "Success", "Error"
  - Edges: Start → Enter credentials → Validate → (Success | Error)
→ Generate Mermaid syntax for simple flow
→ Call mcp__drawio__open_drawio_mermaid with the Mermaid content
→ Success: draw.io editor opens with editable diagram
```

**Example 2: Author (create from Mermaid)**
```
User: "Create a sequence diagram from this Mermaid code"
→ Call mcp__drawio__open_drawio_mermaid with user's Mermaid content
→ Success: draw.io editor opens with rendered diagram
```

**Example 3: Author (org chart from CSV)**
```
User: "Create an org chart from this CSV data"
→ Call mcp__drawio__open_drawio_csv with CSV content
→ Success: draw.io editor opens with org chart
```

**Example 4: Author (complex diagram via XML to VS Code)**
```
User: "Create a detailed architecture diagram"
→ Build semantic skeleton with nodes, edges, clusters
→ Generate draw.io XML (mxGraph format) following CRITICAL rules:
  - Use NUMERIC cell IDs only ("2", "3", "4"...)
  - Single-line value attributes (use &#xa; for line breaks)
  - Avoid special Unicode characters (→, ↔)
→ Write XML to file with .drawio extension (e.g., architecture.drawio)
→ Success: User opens file in VS Code with draw.io extension
```

**Example 4b: Author (complex diagram via MCP fallback)**
```
User: "Create a detailed architecture diagram" (no VS Code extension)
→ Build semantic skeleton with nodes, edges, clusters
→ Generate draw.io XML (mxGraph format) following CRITICAL rules
→ Call mcp__drawio__open_drawio_xml with the XML content
→ Success: draw.io editor opens in browser with full diagram
```

**Example 5: Interpret (view diagram)**
```
User: "Show me this diagram in read-only mode"
→ Call mcp__drawio__open_drawio_xml with lightbox: true
→ Success: draw.io opens in lightbox (read-only) mode
```

**Example 6: Fallback to Excalidraw**
```
User: "Create a hand-drawn style flowchart using Excalidraw"
→ User explicitly requests Excalidraw format
→ Build semantic skeleton
→ Generate Excalidraw JSON
→ Call Excalidraw MCP tools (if available)
→ Success: Excalidraw diagram produced
```

---

## Quick Reference

- **Author**: Text → classify → semantic skeleton → [layout] → format adapter → diagram.
- **Revise**: Parse existing diagram → semantic model → apply changes → [layout] → format adapter → diagram.
- **Verify**: Parse diagram → check schema, bindings, and optional node/path alignment → report.
- **Interpret**: Parse diagram → graph of nodes/edges → summarize or answer in text.

For detailed mechanics (ASCII conversion, binding rules, layout choices, DiagramEval), see [references/reference.md](references/reference.md).
