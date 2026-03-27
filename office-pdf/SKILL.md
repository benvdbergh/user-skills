---
name: office-pdf
description: >-
  PDF automation skill for importing PDFs into Markdown, extracting text/tables/images, and performing
  common PDF operations (merge/split/rotate/forms). Use when the user says "convert PDF to Markdown",
  "extract tables from PDF", "merge PDFs", "split PDF", "fill a PDF form", or needs PDF inspection workflows.
license: MIT
metadata:
  scope: global
  tier: supporting
  version: 0.1.0
---

# office-pdf

Office automation skill for **PDF workflows**, including:

- **PDF → Markdown** (import/ingestion; Markdown becomes canonical).
- **PDF operations**: merge/split/extract pages, extract text, basic inspection.
- **PDF forms**: fillable vs non-fillable workflows (see `references/FORMS.md`).

---

## Core workflows

### 1) PDF → Markdown (import)

Primary intent: produce a **clean Markdown** representation suitable for continued editing as the canonical source.

If the environment has a dedicated PDF→Markdown pipeline already (e.g. markdrop-based), this skill should delegate to it; otherwise use a best-available extraction strategy (text + images + tables) and clearly document limitations (scanned PDFs, OCR needs).

### 2) Merge / split / extract pages

Use Python libraries (e.g. `pypdf`) or system tools (e.g. `qpdf`) depending on availability and PDF complexity.

### 3) Fill PDF forms

Follow the step-by-step workflow in `references/FORMS.md` (fillable fields vs annotation overlay).

---

## Runnable scripts

Scripts live under `scripts/`:

- **Detect fillable fields**: `python scripts/check_fillable_fields.py input.pdf`
- **Extract fillable field metadata**: `python scripts/extract_form_field_info.py input.pdf fields.json`
- **Fill fillable fields**: `python -m scripts.fill_fillable_fields input.pdf field_values.json output.pdf`
- **Fill non-fillable forms (annotations)**: `python scripts/fill_pdf_form_with_annotations.py input.pdf fields.json output.pdf`
- **Convert PDF pages to PNGs** (needs Poppler): `python scripts/convert_pdf_to_images.py input.pdf out_dir`
- **Validate bounding boxes**: `python scripts/check_bounding_boxes.py fields.json`
- **Create validation image overlay**: `python scripts/create_validation_image.py 1 fields.json page_1.png validation.png`

---

## Dependencies (typical)

- **Python**
  - `pypdf`
  - Optional: `pdfplumber`, `reportlab`, `pdf2image`
- **System tools (optional)**
  - Poppler tools (`pdftoppm`, `pdftotext`, `pdfimages`)
  - `qpdf`

---

## Smoke tests

```powershell
python -c "import pypdf; print('ok')"
python -c "from pypdf import PdfReader; r=PdfReader('input.pdf'); print(len(r.pages))"
```

---

## Tool Safety Policy

- **Safe operations**
  - Read/inspect/extract
  - Writing new output PDFs or Markdown files

- **Requires confirmation**
  - Overwriting an existing PDF
  - Bulk page deletions / irreversible structure changes

- **Never allowed**
  - Silently dropping pages/content without reporting what changed

