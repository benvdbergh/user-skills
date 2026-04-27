# Diagram Skill — Reference

Mechanics and validation details derived from research on LLM spatial reasoning and professional diagram schemas. Used when implementing or debugging Author/Revise/Verify/Interpret for a specific format.

---

## 0. Adapter Contract (Multi-Platform)

To connect a new platform (draw.io, PlantUML, ArchiMate, etc.) without changing core skill logic:

**Semantic model (input/output):**

- **Nodes**: `id`, `label`, `type?`, `cluster?`
- **Edges**: `sourceId`, `targetId`, `type?`, `label?`
- **Metadata**: `diagramKind` (flowchart, sequence, ER, architecture, …)

**Adapter responsibilities:**

- **Serialize**: Semantic model + layout `(id → {x,y})` → valid artifact (file content or string).
- **Deserialize**: Artifact → semantic model (and optionally layout) for Revise, Verify, Interpret.
- **Validation**: Format-specific schema and binding rules live in the adapter or its doc; core skill only invokes “validate” and interprets pass/fail.

Keep coordinate systems, compression (e.g. draw.io), and notation rules inside the adapter so the core skill remains format-agnostic.

---

## 1. Spatial Reasoning in Token-Based Systems

- LLMs do not have an intrinsic Euclidean frame of reference; they approximate spatial structure via **statistical co-occurrence** in text (e.g. “A above B”).
- **ASCII diagrams** work because they use a sequential character grid; the model predicts the next character relative to line breaks, simulating 2D layout in 1D output.
- Performance degrades with **complexity and scale**: multi-hop reasoning, mental rotation, and precise coordinate tasks are brittle (large performance drops in studies).
- **Implication**: Prefer **symbolic representations** (graphs, JSON, XML, ASCII) over asking the model to “imagine” or output raw coordinates. Use layout engines for coordinates.

---

## 2. ASCII-to-Structured Translation

When converting ASCII art (or ASCII-style sketches) into a semantic or canvas format:

1. **Identify primitives**: vertices (e.g. `*`), horizontal lines (`-`), vertical lines (`|`). Collect positions as coordinate pairs.
2. **Ring-order algorithm**: From the upper-leftmost point, trace orthogonally adjacent characters to form polygon boundaries and bounding boxes.
3. **Extract labels**: Interior text inside a box becomes the label of the corresponding node.
4. **Output**: Semantic model (nodes + edges) or format-specific structures (e.g. Excalidraw elements).

This supports **Interpret** (ASCII → semantic model → text) and **Author** (text → ASCII prototype → structured diagram).

---

## 3. Excalidraw Schema (JSON)

- **Elements array**: Every shape, line, and text box is one object with geometric properties.
- **Key attributes**: `id`, `type` (rectangle, ellipse, diamond, arrow, text), `x`, `y`, `width`, `height`. For lines/arrows, `points` are relative to `(x,y)`.
- **Bidirectional binding**: An arrow “stuck” to a rectangle requires:
  - Arrow: `startBinding` / `endBinding` with `elementId`, `mode` (e.g. `"orbit"`), and optional `fixedPoint`.
  - Rectangle: `boundElements` array including the arrow’s `id` and type.
- **Common failure**: Updating only one side (e.g. arrow’s binding but not the shape’s `boundElements`) yields disconnected diagrams. Use a single “connect” operation that updates both.

---

## 4. draw.io Schema (mxGraph XML)

- **Container hierarchy**: `mxfile` → `diagram` → `mxGraphModel` → `root` → cells. Diagram content is often Base64 + deflate compressed; decompress before parsing.
- **Root**: Root node (id 0) and default parent (id 1) are required. All elements reference a parent.
- **mxCell**: Each node or edge. Attributes: `id`, `value` (label), `style`, `vertex`/`edge`. Geometry in `mxGeometry` (for edges, label position can be relative -1..1 from edge center).
- **Validation**: Strict XML and schema; unclosed tags or unescaped characters can break the file. Use sequential unique IDs and valid parent references.
- **Icon libraries**: Cloud/architecture diagrams often map logical names to `style` strings (e.g. AWS icons); keep a mapping file per library when generating.

### CRITICAL: draw.io XML Generation Rules

These rules MUST be followed to avoid parsing errors like "d.setId is not a function":

1. **Cell IDs MUST be numeric strings**: Use `"0"`, `"1"`, `"2"`, etc. NEVER use descriptive IDs like `"scm"`, `"myNode"`, `"arrow_1"`. The draw.io parser expects numeric IDs.

   ```xml
   <!-- CORRECT -->
   <mxCell id="2" value="My Node" .../>
   <mxCell id="3" value="Another Node" .../>

   <!-- WRONG - causes "d.setId is not a function" error -->
   <mxCell id="myNode" value="My Node" .../>
   <mxCell id="scm_container" value="Another Node" .../>
   ```

2. **Value attributes must be single-line**: Do NOT embed actual line breaks in XML attributes. Use `&#xa;` for line breaks within labels.

   ```xml
   <!-- CORRECT -->
   <mxCell id="2" value="Line 1&#xa;Line 2&#xa;Line 3" .../>

   <!-- WRONG - multi-line attribute causes parsing issues -->
   <mxCell id="2" value="Line 1
                           Line 2
                           Line 3" .../>
   ```

3. **Avoid special Unicode characters in attributes**: Replace arrow symbols and special characters with plain text equivalents.

   ```xml
   <!-- CORRECT -->
   <mxCell id="2" value="OMS to WMS" .../>
   <mxCell id="3" value="WMS-YMS-TMS" .../>

   <!-- AVOID - special characters may cause issues -->
   <mxCell id="2" value="OMS→WMS" .../>
   <mxCell id="3" value="WMS↔YMS↔TMS" .../>
   ```

4. **No XML comments inside the root element**: Avoid placing `<!-- comments -->` within the cell structure as they can interfere with parsing.

5. **Proper XML structure template**:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <mxfile host="app.diagrams.net">
     <diagram name="Diagram Name" id="unique-id">
       <mxGraphModel dx="1422" dy="800" grid="1" gridSize="10" guides="1"
                     tooltips="1" connect="1" arrows="1" fold="1" page="1"
                     pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="0">
         <root>
           <mxCell id="0"/>
           <mxCell id="1" parent="0"/>
           <!-- All diagram cells start from id="2" -->
           <mxCell id="2" value="Node" style="..." vertex="1" parent="1">
             <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
           </mxCell>
           <!-- Continue with sequential numeric IDs -->
         </root>
       </mxGraphModel>
     </diagram>
   </mxfile>
   ```

6. **File extension for VS Code**: Save as `.drawio` (not `.xml`) to enable native editing with the draw.io VS Code extension.

---

## 5. Layout Engines

Use automated layout instead of hand-computed coordinates for non-trivial diagrams:

| Engine | Strengths | Limitations |
|--------|-----------|-------------|
| **Dagre** | Fast, hierarchical (trees, flowcharts) | Few options, no sub-flows |
| **ELK** | Configurable, sub-flows, nesting | Heavier, more complex |
| **D3-Force** | Organic, network-style | Less predictable for docs |
| **Cola** | Constraint-based | More expensive |

**Workflow**: Model outputs **semantic skeleton** (nodes + edges, no positions); layout engine produces `(x,y)`; format adapter maps to Excalidraw/draw.io/PlantUML coordinates.

---

## 6. Edge Routing and Binding

- **Orthogonal/elbow arrows**: Use iterative, greedy routing with explicit headings (Up/Down/Left/Right) per segment rather than free-form curves.
- **Binding consistency**: In canvas formats, every connection must be reflected in both endpoints (e.g. Excalidraw arrow + both shapes’ `boundElements`). Prefer a single “connect” primitive that updates both sides.

---

## 7. Validation (Verify Action)

Beyond schema validity:

- **Node alignment**: Are all intended nodes present and correctly labeled?
- **Path alignment**: Are multi-hop logical connections preserved in the generated diagram?
- **DiagramEval-style metrics**: Treat diagram as graph (nodes = text elements, edges = directed links); compare to intended semantic graph on node set and path set.
- **Structural checks**: No orphan edges; required root/default cells in draw.io; all bindings bidirectional in Excalidraw.

Automated checks can trigger **self-correction**: if validation fails, re-run Revise with a focused fix (e.g. “add missing bindings for arrows”).

---

## 8. MCP and Tool Use

### draw.io MCP (Default)

The draw.io MCP server provides three tools for opening diagrams in an interactive editor:

| Tool | Input | Use Case |
|------|-------|----------|
| `mcp__drawio__open_drawio_xml` | draw.io XML content or URL | Full control via mxGraph XML format |
| `mcp__drawio__open_drawio_mermaid` | Mermaid.js syntax or URL | Quick diagrams from text DSL (simple diagrams only) |
| `mcp__drawio__open_drawio_csv` | CSV data or URL | Org charts and tabular data |

**Common parameters:**
- `content` (required): The diagram content or URL pointing to content
- `dark`: Dark mode setting (`"auto"`, `"true"`, `"false"`)
- `lightbox`: Open in read-only view mode (`true`/`false`, default `false`)

**Usage patterns:**
- **Author**: Generate Mermaid syntax for simple diagrams, XML for complex ones, then call appropriate tool
- **Revise**: Read existing XML, modify, then call `open_drawio_xml`
- **Interpret**: Call with `lightbox: true` for read-only viewing
- **URL support**: All tools accept URLs that point to content (auto-fetched)

### Excalidraw MCP (Fallback)

When draw.io is unavailable or user explicitly requests Excalidraw:

- **Creation**: Prefer small, granular tools (e.g. `create_rectangle`, `create_arrow`) over one-shot generation of full JSON to avoid truncation and "lost-in-the-middle" effects.
- **Management**: `update_element`, `delete_element` support iterative Revise and error correction.
- **Query**: `query_elements`, `read_diagram` support Interpret and Verify by giving the agent current state.
- **Export**: `export_to_svg`, `get_shareable_url` support delivery without format-specific knowledge in the skill body.

### General MCP Principles

Persistence can be API-only (generate → save → export) or real-time (e.g. WebSocket to a live canvas); the skill stays agnostic and delegates to the server.
