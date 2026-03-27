---
name: docx-documentation
description: >-
  Global skill for Word/.docx and PDF export: Markdown↔DOCX conversion, DOCX→PDF
  export, light structural edits, and export pipelines. Use when the user needs
  to import from or export to Word, export to PDF from DOCX, inspect or tweak
  DOCX structure, or run post-processing on generated documents, while keeping
  Markdown as canonical. For PDF-to-Markdown ingestion use the pdf-to-markdown
  skill instead.
license: MIT
metadata:
  scope: global
  tier: supporting
  version: 1.0.0
  mcp-server: user-word-document-server
---

# docx-documentation

Global **Word/.docx** documentation helper skill that owns DOCX format-specific behavior and **export** to PDF (from DOCX). **PDF → Markdown** ingestion is owned by the **pdf-to-markdown** skill (markdrop); this skill does not perform PDF-to-Markdown conversion.

This skill is responsible for:

- Converting between **Markdown (canonical)** and `.docx`; exporting DOCX to PDF.
- Running **post-export validation** and light structural adjustments in Word.
- Providing **tool-safe mappings** for DOCX-related MCP tools.

It MUST NOT become the canonical store of document content; that role belongs to Markdown and is orchestrated via `tech-documentation` and any vault-local documentation wrappers.

---

## Purpose & Canonical Source Policy

- **Purpose**: Handle all Word/.docx and PDF-specific operations for technical and professional documents in a reusable, vault-agnostic way.
- **Canonical Source Policy**:
  - **Markdown (or structured text with front matter) is the source of truth.**
  - DOCX and PDF are **derivative artifacts** produced from Markdown.
  - Substantive content and structural changes SHOULD be applied in Markdown, then re-exported.
  - DOCX-only edits are allowed only for small, tactical adjustments when round-tripping would be excessive.

Use this skill when:

- Importing a **Word document** into Markdown to bring it under source control and standard workflows.
- Exporting Markdown documents to **Word** and optionally **PDF** for distribution.
- Performing **light structural fixes** or format-aware tweaks directly in `.docx` outputs (e.g., headings, numbering, captions) without altering the canonical Markdown.

---

## DOCX / PDF Workflows

**Note:** Import of **PDF** into Markdown is handled by the **pdf-to-markdown** skill (markdrop). This section covers DOCX only for import; PDF appears only as an **export** target (DOCX → PDF).

### 1. Import `.docx` → Markdown

Goal: Turn a Word document into a clean Markdown document suitable as a canonical source.

- Inputs:
  - `.docx` file (path or binary via MCP).
  - Any existing Markdown file path (if merging into an existing doc).
- Steps:
  1. Extract text, headings, lists, tables, images, and metadata.
  2. Normalize to Markdown according to environment-specific conversion rules (e.g., heading levels, list styles).
  3. Optionally reconstruct front matter (title, authors, version, dates, tags).
  4. Run a light integrity pass to fix conversion artefacts (dangling captions, broken numbering).
  5. Present Markdown as the new canonical source.
- Safety:
  - **Requires confirmation** before overwriting any existing Markdown file.

### 2. Export Markdown → `.docx`

Goal: Produce a `.docx` file from canonical Markdown using style templates.

- Inputs:
  - Canonical Markdown content or file path.
  - Optional reference `.docx` template for styles.
- Steps:
  1. Parse Markdown structure (headings, lists, tables, code blocks, images, front matter).
  2. Map structure to Word elements using a reference template when available.
  3. Generate the `.docx` file, preserving semantic structure as much as the format allows.
  4. Optionally run an outline/text sanity check via MCP tools.
- Safety:
  - **Safe**: Non-destructive; operates on derived `.docx` only.

### 3. Export Word → PDF

Goal: Convert a finalized `.docx` into a **PDF** suitable for distribution.

- Inputs:
  - `.docx` file to convert.
- Steps:
  1. Call the appropriate MCP tool or host-side script to convert DOCX to PDF.
  2. Return path/handle to the PDF.
- Safety:
  - **Safe**: Non-destructive; only creates additional artifact(s).

### 4. Sync / Diff Markdown ↔ `.docx`

Goal: Understand and reconcile differences between a Markdown source and its `.docx` derivative.

- Inputs:
  - Markdown content or file path.
  - `.docx` file path.
- Steps:
  1. Extract an outline and text from the `.docx`.
  2. Compute a diff between Markdown and Word content/structure.
  3. Classify differences (format-only vs. semantic).
  4. Recommend a reconciliation plan:
     - Prefer updating Markdown then re-exporting.
     - Reserve direct DOCX changes for format-only adjustments.
- Safety:
  - **Requires confirmation** for any changes that alter either Markdown or DOCX beyond inspection.

### 5. Light Structural Edits in `.docx`

Goal: Apply targeted changes to `.docx` outputs when regenerating from Markdown would be wasteful (e.g., last-minute heading tweak).

- Example operations:
  - Adjusting a heading level or text.
  - Adding a short list or paragraph near existing text.
  - Inserting a small table or image.
  - Adding or editing footnotes and captions.
- Safety:
  - **Requires confirmation** for anything that could meaningfully alter semantics.
  - Keep a clear explanation that Markdown remains canonical and SHOULD be updated later where feasible.

---

## Integration with `tech-documentation`

`docx-documentation` is **never** the primary entrypoint for documentation workflows. Instead:

- `tech-documentation`:
  - Owns user-facing workflows (`create`, `edit`, `enrich`, `audit`, `impact-analysis`, `import`, `export`, `sync`).
  - Decides **when** DOCX/PDF operations are needed.
  - Ensures Markdown is coherent and structured before export.
- `docx-documentation`:
  - Executes the **format-specific steps** for `import`, `export`, and `sync`.
  - Surfaces diagnostics about DOCX/PDF structure back to `tech-documentation`.

Typical flow:

- Import:
  - `tech-documentation` (import workflow) → `docx-documentation` (DOCX→MD) → returns cleaned Markdown to `tech-documentation`.
- Export:
  - `tech-documentation` (export workflow) → `docx-documentation` (MD→DOCX/PDF) → returns artifacts.
- Sync:
  - `tech-documentation` (sync workflow) → `docx-documentation` (diff + plan) → user chooses how to reconcile.

Vault-local documentation skills (e.g., Ai-Vault `documentation`) SHOULD:

- Call `tech-documentation` for orchestration.
- Allow `tech-documentation` to delegate DOCX/PDF concerns to this skill.

---

## MCP Dependencies and Tool Usage Mapping

When the **`user-word-document-server`** MCP is available, `docx-documentation` MAY use it as follows.

### MCP Dependencies

- **Server**: `user-word-document-server`
- **Primary Tools** (illustrative; confirm exact names from MCP descriptors):
  - `get_document_outline`
  - `get_document_text`
  - `search_and_replace`
  - `insert_header_near_text`
  - `insert_line_or_paragraph_near_text`
  - `insert_numbered_list_near_text`
  - `add_paragraph`
  - `add_heading`
  - `add_table`
  - `add_picture`
  - `add_footnote_after_text` (and related footnote helpers)
  - `convert_to_pdf`

### Tool Usage Mapping

| Workflow Step                | MCP Tool(s)                                | Purpose                                                  | Safety Level           |
|-----------------------------|--------------------------------------------|----------------------------------------------------------|------------------------|
| Inspect outline             | `get_document_outline`                     | Verify heading hierarchy after conversion/export         | Safe                   |
| Inspect text                | `get_document_text`                        | Spot-check textual content and artifacts                 | Safe                   |
| Small text fixes            | `search_and_replace`                       | Apply phrase-level corrections in `.docx`                | Requires Confirmation  |
| Insert heading/paragraph    | `insert_header_near_text`, `insert_line_or_paragraph_near_text`, `add_heading`, `add_paragraph` | Patch headings/paragraphs around existing content        | Requires Confirmation  |
| Insert lists                | `insert_numbered_list_near_text`           | Add short lists without restructuring the whole doc      | Requires Confirmation  |
| Insert tables/images        | `add_table`, `add_picture`                 | Add small tables or images to exported documents         | Requires Confirmation  |
| Footnotes and annotations   | `add_footnote_after_text` (+ helpers)      | Add or adjust footnotes/endnotes for references          | Requires Confirmation  |
| DOCX → PDF                  | `convert_to_pdf`                           | Produce a PDF artifact from finalized DOCX               | Safe                   |

If the `user-word-document-server` MCP is not available, this skill SHOULD:

- Fall back to host-side scripts (e.g., `pandoc`, `python-docx`) when configured.
- Clearly state when certain operations are unsupported in the current environment.

---

## Tool Safety Policy

- **Safe Operations**:
  - Generating `.docx` and PDF from Markdown without modifying the Markdown source.
  - Inspecting DOCX outline and text for verification.
  - Converting DOCX to PDF.
- **Requires Confirmation**:
  - Overwriting existing Markdown files during DOCX→MD import.
  - Applying `search_and_replace` or insertion tools that alter `.docx` content.
  - Any automated reconciliation that would change both Markdown and `.docx`.
- **Never Allowed**:
  - Irreversibly deleting sections or content from DOCX without explicit, contextual confirmation.
  - Treating `.docx` or PDF as canonical while discarding the Markdown source.

Always:

- Surface a clear **change plan** before making structural changes.
- Prefer updating the Markdown source and re-exporting wherever practical.

---

## Examples

### Example 1: Import Word Runbook into Markdown

1. User (via `tech-documentation`): "Import this `.docx` and clean it into Markdown."
2. `docx-documentation`:
   - Uses host-side tools or MCP to extract content.
   - Normalizes headings, lists, and tables into Markdown.
   - Reconstructs front matter where feasible.
   - Returns a cleaned Markdown document as canonical.

### Example 2: Export Design Doc to Word and PDF

1. User (via `tech-documentation`): "Export this design doc to Word and PDF with our standard template."
2. `docx-documentation`:
   - Converts Markdown to `.docx` using the provided template.
   - Uses `convert_to_pdf` to create a PDF from the DOCX.
   - Returns final `.docx` and `.pdf` artifacts.

### Example 3: Last-Minute Heading Fix in Word

1. User: "Change this section heading from 'Solution' to 'Proposed Solution' in the Word file only."
2. `docx-documentation`:
   - Uses `search_and_replace` or `insert_header_near_text` to adjust the heading.
   - Explains that Markdown remains canonical and SHOULD be updated later to match.

### Example 4: Outline Sanity Check Post-Export

1. User: "Check that the exported Word file preserved the section structure."
2. `docx-documentation`:
   - Calls `get_document_outline`.
   - Compares outline to expected Markdown structure.
   - Reports any anomalies (missing sections, wrong levels) and suggests fixes.

