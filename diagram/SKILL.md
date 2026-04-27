---
name: diagram
description: >-
  Creates, revises, validates, and interprets technical and product diagrams
  using a format-agnostic semantic model and an opinionated editorial design
  system. Outputs draw.io files (.drawio XML), standalone HTML/SVG, or Mermaid.
  Thirteen diagram types: architecture, flowchart, sequence, state machine, ER,
  timeline, swimlane, quadrant, nested, tree, layer stack, venn, pyramid.
  USE WHEN: create diagram, update diagram, validate diagram, draw flowchart,
  architecture diagram, sequence diagram, ER diagram, state machine, swimlane,
  timeline, quadrant, layer stack, venn, pyramid, nested, tree, diagram from
  text, text from diagram, explain diagram, summarize diagram.
metadata:
  version: "2.0"
---

# Diagram

Bidirectional translation between **text** and **diagrams**, with an opinionated editorial design system applied to all output formats.

Three output formats: **draw.io** (`.drawio` XML file), **HTML/SVG** (self-contained `.html`), **Mermaid** (inline DSL). All share the same semantic model and quality bar.

---

## Scope

**Domain-neutral and vault-agnostic.** Focuses on semantic graph construction and translation. Domain-specific meaning is supplied by the calling skill (e.g. `enterprise-architecture`, `product-knowledge-catalog`).

---

## When Called by Other Skills

Calling skills should provide:

- **Structured input**: graph-like description (nodes, edges, clusters, diagram kind) rather than raw prose where possible
- **Stable identifiers**: deterministic IDs carried through from upstream systems; diagram node IDs bind to upstream objects, not presentation
- **Output format + context**: format choice (draw.io default for editable, HTML for editorial), consumption context (docs, standalone artifact, EA view)

---

## First-Time Setup — Style Guide Gate

**Before generating a first HTML/SVG diagram in a new project, verify the style guide has been customized.**

Open [`references/style-guide.md`](references/style-guide.md) and check the default tokens. If still at shipped defaults (paper `#faf7f2`, ink `#1c1917`, accent `#b5523a` rust), **pause and ask**:

> *"The style guide is still at the default palette. Do you want to customize it to match your brand first? Options: (a) run onboarding — I'll pull colors and fonts from your website, (b) paste your tokens manually, (c) proceed with the default for now."*

- **(a)** → follow [`references/onboarding.md`](references/onboarding.md)
- **(b)** → accept tokens and write them into `style-guide.md`
- **(c)** → proceed; optionally remind later

**Skip this gate** once customized (detect by `accent` value differing from `#b5523a`), and for draw.io output (style-guide applies to HTML/SVG only).

---

## Philosophy

**The highest-quality move is usually deletion.**

Every node is a distinct idea. Every edge carries information. If removing something wouldn't hurt the page — remove it.

- Two nodes that always travel together are one node.
- A connection whose relationship is obvious from layout is noise.
- Accent color is **editorial signal, not a flag**. 1–2 focal elements per diagram.
- The diagram is done when nothing can be removed, not when everything is added.

**Target density: 4/10.** Technically complete. Not so dense it needs a guide.

**Don't draw when** a table, bullet list, or well-written paragraph communicates the same thing.

---

## Action Taxonomy

| Action | Direction | Purpose |
|--------|-----------|---------|
| **Author** | Text → Diagram | Create a new diagram from description, requirements, or structured text |
| **Revise** | Diagram + Text → Diagram | Update an existing diagram (add/remove/relabel nodes or edges, change layout or style) |
| **Verify** | Diagram → Report | Validate schema, bindings, node/edge consistency, optional node/path alignment |
| **Interpret** | Diagram → Text | Extract insights: summarize structure, list entities and relations, answer questions |

Design system quality standards (§ Design System, § Anti-patterns, § Pre-Output Checklist) apply to **all four actions** — including Revise output and Verify reports.

---

## Workflow

### 1. Ingest and classify

Parse input (free text, list, spec, or existing diagram file). Identify:
- **Diagram type** (see § Diagram Types selection guide)
- **Output format** (draw.io default for editable/technical; HTML for standalone editorial)
- **Action** (Author / Revise / Verify / Interpret)

For Revise/Verify/Interpret: parse the existing artifact into the semantic model first (see [`references/diagram-mechanics.md`](references/diagram-mechanics.md) § Adapter Contract).

### 2. Build semantic skeleton

- **Nodes**: distinct entities with `id`, `label`, `type?`, `cluster?`
- **Edges**: `sourceId`, `targetId`, `type?`, `label?`
- **Metadata**: `diagramKind`, output format, complexity count

Optionally produce a **low-fidelity ASCII sketch** to confirm structure before rendering complex diagrams.

Apply **complexity budget** (§ Layout & Spacing) — if over budget, split into overview + detail.

### 3. Emit via format adapter

Map semantic model to the target format:

| Format | Output | When |
|--------|--------|------|
| **draw.io** (default) | `.drawio` XML file | Editable/technical; share with engineers; embed in VS Code |
| **HTML/SVG** | `.html` self-contained file | Editorial; standalone; browser-ready; branded |
| **Mermaid** | Inline DSL string | Simple inline docs; quick author from text |

Load the matching `references/type-*.md` **before drawing** — it contains layout conventions, anti-patterns, and examples for that type.

### 4. Verify (optional, always available)

Run on any emitted artifact: schema validity, binding consistency, node/path alignment against the semantic model. On failure, trigger self-correcting Revise with a focused fix.

**Success criteria:**
- **Author**: Valid artifact in chosen format; optional Verify passes or user confirms
- **Revise**: Updated diagram reflects requested changes; design quality maintained
- **Verify**: Validation report produced (pass/fail + specific issues)
- **Interpret**: Text summary, entity list, or answer to user's question

---

## Diagram Types

**Always load the relevant `references/type-*.md` before drawing.**

| Showing… | Use | Reference |
|---|---|---|
| Components + connections in a system | **Architecture** | [type-architecture.md](references/type-architecture.md) |
| Decision logic with branches | **Flowchart** | [type-flowchart.md](references/type-flowchart.md) |
| Time-ordered messages between actors | **Sequence** | [type-sequence.md](references/type-sequence.md) |
| States + transitions + guards | **State machine** | [type-state.md](references/type-state.md) |
| Entities + fields + relationships | **ER / data model** | [type-er.md](references/type-er.md) |
| Events positioned in time | **Timeline** | [type-timeline.md](references/type-timeline.md) |
| Cross-functional process with handoffs | **Swimlane** | [type-swimlane.md](references/type-swimlane.md) |
| Two-axis positioning / prioritization | **Quadrant** | [type-quadrant.md](references/type-quadrant.md) |
| Hierarchy through containment / scope | **Nested** | [type-nested.md](references/type-nested.md) |
| Parent → children relationships | **Tree** | [type-tree.md](references/type-tree.md) |
| Stacked abstraction levels | **Layer stack** | [type-layers.md](references/type-layers.md) |
| Overlap between sets | **Venn** | [type-venn.md](references/type-venn.md) |
| Ranked hierarchy or conversion drop-off | **Pyramid / funnel** | [type-pyramid.md](references/type-pyramid.md) |

Rules of thumb:
- If a 3-column table communicates the same thing, use the table.
- If combining two types, pick the dominant axis — don't hybridize grammars.
- Over the complexity budget → split into overview + detail.

---

## Design System

**Applies to HTML/SVG output.** For draw.io XML output, use the draw.io schema rules in [`references/diagram-mechanics.md`](references/diagram-mechanics.md).

The design system is skinnable — all tokens live in [`references/style-guide.md`](references/style-guide.md). When specs below reference `ink`, `accent`, `muted`, etc., look up the current hex value there.

### Semantic color roles

| Role | Purpose |
|---|---|
| `paper`, `paper-2` | Page bg and container bg |
| `ink` | Primary text / stroke |
| `muted`, `soft` | Secondary text, default arrows, sublabels |
| `rule`, `rule-solid` | Hairline borders |
| `accent`, `accent-tint` | 1–2 focal elements per diagram only |
| `link` | HTTP/API calls, external arrows |

**Focal rule:** `accent` on 1–2 elements max. If tempted to accent 4 things, you haven't decided what's focal yet.

### Node type → treatment

| Type | Fill | Stroke |
|---|---|---|
| **Focal** (1–2 max) | `accent-tint` | `accent` |
| **Backend / API / Step** | white | `ink` |
| **Store / State** | `ink @ 0.05` | `muted` |
| **External / Cloud** | `ink @ 0.03` | `ink @ 0.30` |
| **Input / User** | `muted @ 0.10` | `soft` |
| **Optional / Async** | `ink @ 0.02` | `ink @ 0.20` dashed `4,3` |
| **Security / Boundary** | `accent @ 0.05` | `accent @ 0.50` dashed `4,4` |

### Typography

- **Title** — Instrument Serif, 1.75rem, 400
- **Node name** — Geist (sans), 12px, 600 — human-readable labels
- **Sublabel / technical** — Geist Mono, 9px — ports, URLs, field types, commands
- **Eyebrow / tag** — Geist Mono, 7–8px, uppercase, tracked
- **Arrow label** — Geist Mono, 8px
- **Editorial aside** — Instrument Serif *italic*, 14px — annotation callouts only

**Mono is for technical content.** Names are Geist sans. Page title is Instrument Serif. Never JetBrains Mono as blanket "dev" font.

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Core SVG rules

- Draw **arrows before boxes** (z-order: lines behind nodes)
- Every arrow label needs an **opaque `fill` rect** behind it — without one, it bleeds through the line
- **Legend** goes as a horizontal strip at the bottom, never floating inside the diagram area
- **Background**: single `<rect>` filled with `paper`; optional dot pattern for long-form editorial only
- **Border radius**: 4–8px max; never `rounded-2xl`
- **No `box-shadow`** — borders only

Full SVG primitives (arrow markers, node box pattern, legend strip, annotation callouts) in [`references/style-guide.md`](references/style-guide.md) and [`references/primitive-annotation.md`](references/primitive-annotation.md).

---

## Universal Anti-patterns

These mark low-quality diagrams of any type or format:

| Anti-pattern | Why it fails |
|---|---|
| Dark mode + cyan/purple glow | Looks "technical" without actual design decisions |
| JetBrains Mono as blanket "dev" font | Mono is for technical content (ports, commands, URLs) — names go in Geist sans |
| Identical boxes for every node | Erases hierarchy |
| Legend floating inside the diagram area | Collides with nodes |
| Arrow labels with no masking rect | Bleeds through the line (HTML/SVG) |
| Vertical `writing-mode` text on arrows | Unreadable |
| Shadow on any element | Borders only |
| `rounded-2xl` on boxes | Max radius 6–10px or none |
| Accent color on every "important" node | Accent is 1–2 editorial signals, not a flagging system |
| Descriptive IDs in draw.io XML | Must be numeric strings only (causes parser errors) |
| Multi-line attribute values in draw.io XML | Use `&#xa;` for line breaks; never actual newlines in attributes |

Type-specific anti-patterns live in each `references/type-*.md`.

---

## Layout & Spacing

### 4px grid (HTML/SVG output)

**All values — font sizes, padding, node dimensions, gaps, x/y coords — divisible by 4.**

| Category | Allowed values |
|---|---|
| Font sizes | 8, 12, 16, 20, 24, 28, 32, 40 |
| Node width / height | 80, 96, 112, 120, 128, 140, 144, 160, 180, 200, 240, 320 |
| x / y coordinates | multiples of 4 |
| Gap between nodes | 20, 24, 32, 40, 48 |
| Padding inside boxes | 8, 12, 16 |
| Border radius | 4, 6, 8 |

Exempt: stroke widths (0.8, 1, 1.2), opacity values.

### Complexity budget (all formats)

| Limit | Rule |
|---|---|
| Max nodes | 9 |
| Max arrows / transitions | 12 |
| Max accent/focal elements | 2 |
| Max lifelines (sequence) | 5 |
| Max lanes (swimlane) | 5 |
| Max items (quadrant) | 12 |
| Max entities (ER) | 8 |
| Max nesting levels | 6 |
| Max tree depth | 4 |
| Max layers (layer/pyramid stack) | 6 |
| Max circles (venn) | 3 |
| Max annotation callouts | 2 |

Over budget → split into overview + detail diagrams.

---

## Pre-Output Checklist (Taste Gate)

Run before producing any diagram in any format.

**Type fit:**
- [ ] Right type for what I'm showing? (§ Diagram Types selection guide)
- [ ] Would a table / paragraph do the same job? (If yes — don't draw.)
- [ ] Loaded the matching `references/type-*.md`?

**Remove test:**
- [ ] Can I remove any node?
- [ ] Can I merge any two nodes?
- [ ] Can I remove any arrow?
- [ ] Can I remove any label?

**Signal:**
- [ ] Accent / focal treatment on ≤2 elements?
- [ ] Within the type's complexity budget?

**Technical (HTML/SVG):**
- [ ] Arrows drawn before boxes?
- [ ] Every arrow label has an opaque rect behind it?
- [ ] Legend is a horizontal bottom strip, not floating?
- [ ] No vertical `writing-mode` text?
- [ ] Every font size, coord, width, height, gap divisible by 4?

**Technical (draw.io XML):**
- [ ] Cell IDs are numeric strings only ("2", "3", "4"...)?
- [ ] No multi-line values in attributes (use `&#xa;`)?
- [ ] No special Unicode in attributes (→, ↔)?
- [ ] File extension is `.drawio`?

**Typography (HTML/SVG):**
- [ ] Human-readable names in Geist sans, not Geist Mono?
- [ ] Technical sublabels in Geist Mono?
- [ ] Page title in Instrument Serif?
- [ ] No JetBrains Mono anywhere?

---

## Output Format Details

### draw.io — `.drawio` XML file

Write valid mxGraph XML to a `.drawio` file. User opens it in VS Code (draw.io extension) or diagrams.net.

**CRITICAL rules** (violations cause "d.setId is not a function" or parse errors):
1. Cell IDs **must** be numeric strings: `"0"`, `"1"`, `"2"` — never `"myNode"` or `"scm_container"`
2. Value attributes **must** be single-line; use `&#xa;` for line breaks
3. Avoid special Unicode in attributes (→, ↔, emoji) — use plain text equivalents
4. No XML comments inside the root element
5. Save as `.drawio` (not `.xml`) for VS Code extension compatibility

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
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

Full schema, edge routing, and validation details: [`references/diagram-mechanics.md`](references/diagram-mechanics.md).

### HTML/SVG — `.html` self-contained file

Single `.html` file: embedded CSS, inline SVG, Google Fonts only (no external images, no JavaScript).

**Three variants** (templates in `assets/`):

| Variant | File | When |
|---|---|---|
| **Minimal light** (default) | `template.html` | Screenshot-ready, diagram + title |
| **Minimal dark** | `template-dark.html` | Dark-mode sites, slides |
| **Full editorial** | `template-full.html` | Long-form posts where diagram is hero |

Optional **sketchy variant** (SVG turbulence filter): [`references/primitive-sketchy.md`](references/primitive-sketchy.md). Good for essays; not for technical docs.

Optional **annotation callouts** (italic-serif asides with dashed Bézier leader): [`references/primitive-annotation.md`](references/primitive-annotation.md).

---

## Examples

**Author — flowchart as draw.io file**
```
User: "Draw a flowchart for user login"
→ Classify: type=flowchart, format=draw.io
→ Check complexity: 5 nodes, 4 edges — within budget
→ Build semantic skeleton: Start → Enter credentials → Validate → (Success | Error)
→ Generate mxGraph XML with numeric IDs starting at "2"
→ Write to login-flow.drawio
→ User opens in VS Code draw.io extension
```

**Author — architecture diagram as HTML**
```
User: "Create an architecture diagram for our API gateway"
→ Check style-guide.md — customized? If not, run style gate
→ Classify: type=architecture, format=HTML
→ Load references/type-architecture.md
→ Build semantic skeleton: ≤9 nodes, identify 1–2 focal components
→ Apply design system: focal nodes get accent-tint/accent, others get ink stroke
→ Write assets/template.html pattern to architecture.html
→ Run pre-output checklist before finalizing
```

**Revise — update existing draw.io file**
```
User: "Add a cache layer between the API and database"
→ Parse existing .drawio XML → semantic model
→ Add Cache node (numeric ID continuing sequence), edges to API + DB
→ Check complexity budget (still ≤9 nodes?)
→ Regenerate XML with updated cells, write back to file
```

**Interpret — extract insights from diagram**
```
User: "Explain what this architecture diagram shows"
→ Parse .drawio or .html file → semantic graph
→ Extract: nodes (concepts), edges (relationships), clusters
→ Summarize: identify focal nodes, primary flows, boundary components
→ Return: structured text summary with entity list and key relationships
```

**Verify — validate diagram correctness**
```
User: "Validate this diagram"
→ Parse file → semantic model
→ draw.io: check schema (numeric IDs, valid XML, parent refs, no orphan edges)
→ HTML/SVG: check arrow label masks, legend placement, 4px grid, complexity budget
→ Node/path alignment: all intended nodes present? Multi-hop connections preserved?
→ Return: pass/fail report with specific issues; trigger self-correcting Revise if needed
```

**Revise with design upgrade — apply design system to existing diagram**
```
User: "Clean up this diagram's visual style"
→ Parse existing diagram → semantic model (preserving all nodes/edges)
→ Apply node type → treatment mapping (focal, backend, store, external...)
→ Apply typography rules, arrow markers, legend strip
→ Run taste gate checklist
→ Emit updated artifact
```

---

## Quick Reference

- **Author**: Text → classify → semantic skeleton → complexity check → format adapter → taste gate → artifact
- **Revise**: Parse existing → semantic model → apply changes → quality standards → format adapter → artifact
- **Verify**: Parse → schema + binding + node/path alignment check → report → optional self-correcting Revise
- **Interpret**: Parse → semantic graph → summarize/answer in text

For spatial reasoning constraints, ASCII-to-structured conversion, adapter contract, layout engines, edge routing, and DiagramEval-style validation: [`references/diagram-mechanics.md`](references/diagram-mechanics.md).
