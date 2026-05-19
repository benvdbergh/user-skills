# Obsidian Canvas (JSON Canvas 1.0)

**Format adapter** for Obsidian `.canvas` files. Use with the diagram skill’s semantic model, diagram types (`references/type-*.md`), philosophy, and complexity budget — then map to [JSON Canvas 1.0](https://jsoncanvas.org/spec/1.0/).

**Authority:** [jsoncanvas.org](https://jsoncanvas.org/spec/1.0/) · [Obsidian Help — Canvas](https://help.obsidian.md/plugins/canvas) · [obsidian-api canvas.d.ts](https://github.com/obsidianmd/obsidian-api/blob/master/canvas.d.ts) · [Obsidian 1.12 backlinks in Canvas](https://obsidian.md/changelog/2026-02-27-desktop-v1.12.4)

---

## When to use this format

| Use Obsidian Canvas when… | Prefer another format when… |
|---|---|
| Output lives in an Obsidian vault (`.canvas` note) | Standalone web page or slide → HTML/SVG |
| Cards should be **vault notes** (`file` nodes) with live preview | Engineering edit in VS Code draw.io → `.drawio` |
| User wants backlinks / graph integration (file cards, v1.12+) | Inline doc fragment → Mermaid |
| Knowledge map, research board, architecture on vault notes | No Obsidian in the workflow |

**Default assumption:** Most canvas cards are **`file` nodes** pointing at existing or new `.md` notes — not duplicate prose in `text` nodes.

---

## Bridge from diagram skill (apply first)

Before emitting JSON, run the core skill workflow:

1. **Classify diagram type** — load `references/type-*.md` (architecture, flowchart, tree, …) for layout direction and anti-patterns.
2. **Build semantic skeleton** — `id`, `label`, `type?`, `cluster?`; edges `sourceId`, `targetId`, `label?`.
3. **Complexity budget** — default limits in SKILL.md (≤9 nodes, ≤12 edges, ≤2 focal). For large vault knowledge maps, **split** into linked canvases or use **groups + one overview canvas** rather than one unreadable board.
4. **Philosophy** — remove redundant nodes/edges; prefer one `file` card per concept over a `text` card with the same content.
5. **Style guide gate** — HTML/SVG tokens do **not** apply. Use Obsidian `color` presets or hex for ≤2 focal cards only.

### Semantic model → JSON Canvas mapping

| Semantic | JSON Canvas |
|---|---|
| Node (generic concept) | `text` if no vault path; **`file` if path known** |
| `label` + vault path | `file` + `file: "path/to/Note.md"` |
| `cluster` / region | `type: "group"` + bounds containing children |
| External URL | `type: "link"` + `url` |
| Focal (≤2) | `color: "1"`–`"6"` or hex e.g. `"#b5523a"` |
| Edge | `edges[]` entry: `fromNode`, `toNode`, optional `fromSide`/`toSide`, `label`, `color` |
| `sourceId` / `targetId` | `fromNode` / `toNode` (must match node `id`) |
| Heading-scoped note | `file` + `subpath: "#Heading"` |

**ID convention:** Obsidian uses **16-character lowercase hex** strings (e.g. `"6f0ad84f44ce9c17"`). Generate unique ids for every node and edge.

**Z-order:** Order in `nodes[]` — **first = back, last = front**. Put **`group` nodes first**, then content cards, focal cards last if they should sit on top.

---

## File format

Top-level JSON object — **no `version` field** in the file (spec is 1.0).

| Key | Type | Description |
|-----|------|-------------|
| `nodes` | array | Optional; z-order = array order |
| `edges` | array | Optional; connectors between node ids |

```json
{
  "nodes": [],
  "edges": []
}
```

Obsidian pretty-prints `.canvas` on save (git-friendly). Invalid JSON shows a parse error on open.

---

## Node types

Only four types in JSON Canvas 1.0: `text`, `file`, `link`, `group`.

### Generic fields (all types)

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `id` | Yes | string | Unique on canvas |
| `type` | Yes | string | `text` \| `file` \| `link` \| `group` |
| `x`, `y` | Yes | integer | Top-left, pixels; negative allowed |
| `width`, `height` | Yes | integer | Pixels |
| `color` | No | string | `"1"`–`"6"` or `"#RRGGBB"` |

### `file` — vault note or attachment (preferred)

| Field | Required | Notes |
|-------|----------|-------|
| `file` | Yes | Vault-relative path, forward slashes, e.g. `"Projects/API.md"` |
| `subpath` | No | Heading/block: must start with `#`, e.g. `"#Architecture"` |

Renders **embedded preview** in the card (like `![[note]]`). As of **Obsidian 1.12+**, file cards count toward **Backlinks** and **Graph** links.

```json
{
  "id": "a1b2c3d4e5f67890",
  "type": "file",
  "file": "Architecture/System-Overview.md",
  "x": 0,
  "y": 0,
  "width": 400,
  "height": 300,
  "color": "4"
}
```

### `text` — canvas-only Markdown

| Field | Required | Notes |
|-------|----------|-------|
| `text` | Yes | Markdown string; use `\n` for newlines (not literal `\\n`) |

Supports `[[wikilinks]]`, markdown links, code blocks (per Obsidian Help). **Does not appear in Backlinks** until converted to a file (UI: convert card to file).

Use for: legends, scratch labels, bridge text — **not** for content that should live in the knowledge graph.

### `link` — external URL

| Field | Required |
|-------|----------|
| `url` | Yes |

```json
{
  "id": "c3d4e5f678901234",
  "type": "link",
  "url": "https://example.com/docs",
  "x": 500,
  "y": 0,
  "width": 400,
  "height": 200
}
```

### `group` — visual cluster (maps to semantic `cluster`)

| Field | Required | Notes |
|-------|----------|-------|
| `label` | No | Title on group frame |
| `background` | No | Vault path to image |
| `backgroundStyle` | No | `cover` \| `ratio` \| `repeat` |

**No `parentId` in JSON** — membership is **spatial** (cards inside group bounds). Moving a group in JSON does **not** move children; update every child `x`/`y` or use Obsidian UI.

```json
{
  "id": "d4e5f6789012345a",
  "type": "group",
  "label": "Integration layer",
  "x": -50,
  "y": -50,
  "width": 900,
  "height": 500,
  "color": "5"
}
```

---

## Edges

| Field | Required | Default | Values |
|-------|----------|---------|--------|
| `id` | Yes | — | Unique string |
| `fromNode` | Yes | — | Source node `id` |
| `toNode` | Yes | — | Target node `id` |
| `fromSide` | No | auto | `top` \| `right` \| `bottom` \| `left` |
| `toSide` | No | auto | same |
| `fromEnd` | No | `none` | `none` \| `arrow` |
| `toEnd` | No | `arrow` | `none` \| `arrow` |
| `label` | No | — | Relationship text |
| `color` | No | — | Same as node colors |

**Bidirectional** relationships need **two** edge objects.

```json
{
  "id": "fedcba9876543210",
  "fromNode": "a1b2c3d4e5f67890",
  "fromSide": "right",
  "toNode": "b2c3d4e5f6789012",
  "toSide": "left",
  "label": "calls",
  "color": "2"
}
```

Canvas edges are **visual** — they are not wikilinks. Use **`file` nodes** for graph/backlink semantics.

---

## Layout and spacing (canvas-specific)

Align with diagram skill spacing discipline where possible:

| Rule | Value |
|------|--------|
| Grid alignment | Multiples of **10 or 20** px (matches snap-to-grid in app) |
| Gap between cards | **50–100** px |
| Padding inside groups | **20–50** px from group edge to child cards |
| Typical text card | 200–600 × 80–500 |
| Typical file card | 300–500 × 200–400 |
| Flow direction | Same as type-* guides: L→R or T→B for architecture/flowchart |

**Groups:** Place group node **earlier** in `nodes[]` than cards inside it. Size group `width`/`height` to contain all children with padding.

**Colors:** Presets `"1"`–`"6"` are theme-dependent (red → purple). Use **at most two** colored/focal cards per canvas (diagram skill focal rule).

---

## Vault integration

| Mechanism | Behavior |
|-----------|----------|
| `file` node | Embeds note; backlinks/graph (1.12+) for referenced files |
| `text` with `[[Note]]` | Wikilinks work; renames update links in text cards |
| Embed canvas in note | `![[Board.canvas]]` — preview/summary, not full editor |
| Link to canvas | `[[Board.canvas]]` in any note |
| `edges[]` | Layout only; not Graph edges |

**Agent rule:** When the user names vault notes, emit **`file` nodes** with correct paths. Create stub notes first if the workflow includes note creation (escalate to vault/enterprise skills for ontology paths).

---

## Settings: file vs app

**Not in `.canvas`:** snap-to-grid, zoom, pan, viewport, theme background — vault Canvas plugin settings.

**In `.canvas`:** all `nodes` and `edges` geometry, colors, group labels/backgrounds.

Hold **Space** while dragging in UI to temporarily disable snap.

---

## Type-specific layout on canvas

Apply the same mental model as `type-*.md`; adapt placement to pixels:

| Diagram type | Canvas layout hint |
|--------------|-------------------|
| Architecture | Groups = tiers/zones; `file` = component notes; flow L→R |
| Flowchart | Single row or column of `file`/`text` cards; edges = transitions |
| Tree | Parent above/before children; increasing `y` or `x` per level |
| Nested | Outer `group` per scope; inner groups for sub-scopes |
| ER | `file` = entity notes; edge labels = relationship names |
| Sequence | Horizontal lifelines as columns of `file` cards; edges top→bottom time |
| Swimlane | One `group` per lane; cards inside lane bounds |

---

## Anti-patterns (canvas)

| Anti-pattern | Why it fails |
|--------------|--------------|
| Huge `text` cards duplicating note bodies | Breaks single-source-of-truth; no backlinks |
| One canvas with 30+ cards for a “simple” diagram | Violates complexity budget; split or group |
| Accent color on every card | Same as HTML focal misuse — max 2 |
| Orphan `fromNode`/`toNode` | Broken edges |
| Duplicate `id`s | Undefined rendering |
| Literal `\\n` in `text` | Shows backslash-n, not newline |
| Expecting group drag from JSON-only edit | Must move each child coordinate |
| Treating canvas edges as wikilinks | Graph won’t match drawn arrows |

---

## Verify checklist (canvas)

1. JSON parses.
2. Unique `id` on every node and edge.
3. Each node: `id`, `type`, integer `x`, `y`, `width`, `height`.
4. Type fields: `text` / `file` / `url` present as required.
5. Every `fromNode` / `toNode` exists in `nodes`.
6. Sides ∈ {`top`,`right`,`bottom`,`left`} if set.
7. `subpath` starts with `#` if present.
8. `file` paths exist in vault (or document as planned stubs).
9. Semantic model nodes/edges preserved (Interpret/Verify against skeleton).
10. ≤2 focal colors unless user waived complexity rules.

---

## UI-only features (not in JSON Canvas 1.0)

Do not rely on these in hand-authored JSON: collapsible groups (plugins), export image, narrow-to-heading (persists as `subpath` when saved from UI), auto-layout commands. Prefer Obsidian UI for complex layout, then save.

---

## Prior art

| Resource | URL |
|----------|-----|
| JSON Canvas spec | https://jsoncanvas.org/spec/1.0/ |
| Sample canvas | https://github.com/obsidianmd/jsoncanvas/blob/main/sample.canvas |
| Obsidian Help — Canvas | https://help.obsidian.md/plugins/canvas |
| Obsidian Help — Embeds | https://help.obsidian.md/embeds |
| kepano json-canvas skill | https://github.com/kepano/obsidian-skills/blob/main/skills/json-canvas/SKILL.md |
