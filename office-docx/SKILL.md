---
name: office-docx
description: >-
  Word (.docx) automation skill for Markdown↔DOCX workflows and OOXML-based redlining/tracked-changes
  editing patterns. Use when the user says "export to Word", "import this .docx", "apply tracked changes",
  "redline this document", "unpack/edit/pack docx", or needs safe DOCX editing without losing formatting.
license: MIT
metadata:
  scope: global
  tier: supporting
  version: 0.1.0
---

# office-docx

Office automation skill for **Word documents (`.docx`)**. It provides two explicit workflows:

- **A) Markdown ↔ DOCX**: import/export/sync while keeping Markdown canonical (typically orchestrated by `tech-documentation`).
- **B) Redlining / OOXML tracked changes**: unpack/edit/pack patterns and (optionally) tracked-changes helpers.

---

## Workflow A — Markdown ↔ DOCX (Markdown canonical)

This skill is intentionally light on implementation details because environments vary (Pandoc, Word MCPs, templates).
When used with `tech-documentation`, prefer:

- **Import** `.docx` → Markdown (clean + normalize headings/lists)
- **Export** Markdown → `.docx` using a style/template
- **Sync** by diffing and applying substantive edits in Markdown, then re-exporting

---

## Workflow B — OOXML unpack/edit/pack (redlining-friendly)

Use when you must preserve Word’s internal structure or apply tracked changes safely.

### Unpack

- Run: `python scripts/ooxml/unpack.py input.docx outputs/unpacked-docx/`

### Pack

- Run: `python scripts/ooxml/pack.py outputs/unpacked-docx/ output.docx`
- Optional: `--force` to skip validation (not recommended)

Notes:

- The packer validates by attempting a headless LibreOffice conversion when available.
- For advanced redlining (comments + tracked changes) use the vendored helper library:
  - `python -c "from scripts.document import Document; print(Document)"`
  - XSD validation is **best-effort**: it runs only when schema files are available (otherwise it is skipped).

---

## Dependencies

- **Python**
  - `defusedxml`
  - `lxml` (required for schema and relationship validation routines)
- **System tools (recommended)**
  - LibreOffice `soffice` (validation-by-conversion during pack)

---

## Smoke tests

- **Unpack + pack round-trip**
  - `python scripts/ooxml/unpack.py input.docx outputs/unpacked-docx/`
  - `python scripts/ooxml/pack.py outputs/unpacked-docx/ output.docx`
- **Redlining helper import**
  - `python -c "from scripts.document import Document; print('ok')"`

---

## Tool Safety Policy

- **Safe operations**
  - Unpack into a new directory
  - Pack into a new `.docx` output file

- **Requires confirmation**
  - Overwriting an existing `.docx`
  - Any bulk XML edits that can corrupt the document structure

- **Never allowed**
  - Silent destructive edits without describing the impact (e.g., removing relationships, deleting content types)

