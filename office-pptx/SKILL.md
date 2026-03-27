---
name: office-pptx
description: >-
  PowerPoint (.pptx) creation, editing, and analysis for Office automation, including
  template-based slide duplication/reordering, text inventory + safe replacement, and
  HTML→PPTX generation with visual validation. Use when the user says "create a deck",
  "update this PowerPoint", "replace text in PPTX", "reorder slides", "generate slide thumbnails",
  or needs PPTX OOXML unpack/edit/pack workflows.
license: MIT
metadata:
  scope: global
  tier: supporting
  version: 0.1.0
---

# office-pptx

Office automation skill for **PowerPoint (.pptx)** work. This skill focuses on:

- **Template-driven deck assembly** (duplicate/reorder/delete slides).
- **PPTX text inventory** (extract all text shapes with formatting metadata).
- **Safe text replacement** (with validation and “clears-all-shapes” guardrails).
- **Visual validation** (thumbnail grids to catch layout regressions).
- **OOXML workflows** (unpack/edit/pack) when raw XML is required.

`office-pptx` is intended to be called by higher-level orchestrators (e.g. `tech-documentation`) when a user request specifically targets PowerPoint artifacts.

---

## Core workflows

### 1) Analyze / inventory PPTX text

- Run: `python scripts/inventory.py input.pptx inventory.json`
- Output: `inventory.json` keyed by `slide-N` / `shape-N`, sorted by visual position.
- Notes:
  - Slide indices are **0-based**.
  - Inventory includes formatting hints (bullets, alignment, font properties, colors).

### 2) Replace text safely (template-based authoring)

- Run: `python scripts/replace.py input.pptx replacement.json output.pptx`
- **Guardrail**: the replacement workflow **clears all inventoried text shapes** unless `paragraphs` is provided for that shape.
  - This is powerful for template filling, but **requires explicit intent** when the goal is “only change a few fields”.

### 3) Rearrange slides from a template (duplicate/reorder/delete)

- Run: `python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52`
- Supports repeated indices (duplicates the slide content and relationships).

### 4) Thumbnail grid for visual validation

- Run: `python scripts/thumbnail.py input.pptx [output_prefix] --cols 4`
- Use as a **quality gate** after any automated edits.

### 5) Create PPTX from scratch (HTML→PPTX)

- Use: `scripts/html2pptx.js` (Node) to render HTML slides and build a PPTX with PptxGenJS.
- Recommended flow:
  - Create one HTML file per slide (fixed dimensions).
  - Generate PPTX.
  - Run `thumbnail.py` and fix any layout issues iteratively.

---

## Dependencies (Windows-aware)

### Python (required for scripts)

- `python-pptx`
- `Pillow`
- `defusedxml`
- Optional: `markitdown` (PPTX → Markdown text extraction)

### Node (required for HTML→PPTX)

- `pptxgenjs`
- `playwright` (Chromium)
- `sharp`
- `react`, `react-dom`, `react-icons` (optional, for icon rasterization workflows)

### System tools (recommended)

- **LibreOffice** (`soffice`) for PPTX→PDF conversion (thumbnail pipeline)
- **Poppler** (`pdftoppm`) for PDF→JPG slide images (thumbnail pipeline)

### Degraded-mode behavior

- If `soffice`/`pdftoppm` are unavailable, `thumbnail.py` will fail; inventory/replace/rearrange workflows can still run.

---

## Smoke tests

- **Inventory**
  - `python scripts/inventory.py input.pptx inventory.json`
- **Replace (write a new file)**
  - `python scripts/replace.py input.pptx replacement.json output.pptx`
- **Thumbnails (if LibreOffice + Poppler installed)**
  - `python scripts/thumbnail.py output.pptx output-thumbs --cols 4`

---

## Tool Safety Policy

- **Safe operations**
  - Inventory extraction (read-only)
  - Thumbnail generation into new output files
  - Creating a new PPTX output file from a template or HTML sources

- **Requires confirmation**
  - Overwriting an existing `.pptx`
  - Bulk replacement runs that clear text across many shapes (replacement JSON omits `paragraphs` for shapes)
  - OOXML pack operations that could produce a corrupt file if inputs are invalid

- **Never allowed**
  - Silent destructive edits (clearing text or deleting slides) without explicitly stating what will happen
  - Treating `.pptx` as canonical content when the workflow intends Markdown/text-first as canonical

---

## Examples

### Example: Fill a PPTX template with new content

1. Create inventory: `python scripts/inventory.py template.pptx inv.json`
2. Produce `replacement.json` with updated `paragraphs` only where needed.
3. Apply: `python scripts/replace.py template.pptx replacement.json output.pptx`
4. Validate visually: `python scripts/thumbnail.py output.pptx output-thumbs --cols 4`

