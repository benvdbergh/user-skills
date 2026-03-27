---
name: pdf-to-markdown
description: >-
  Converts PDFs to full Markdown (text, links, images, tables) and optional
  interactive HTML using the markdrop library. Supports PDF files and URLs,
  table detection, image extraction, and optional AI-powered image/table
  descriptions via six LLM providers. Use when the user wants to convert a PDF
  to Markdown, import a PDF into the vault, extract content from a PDF with
  images and tables, or add AI descriptions to PDF-derived Markdown.
license: MIT
compatibility: "Requires Python 3.10+. Install markdrop: pip install markdrop (extras: anthropic, groq, litellm, all as needed)."
metadata:
  scope: global
  tier: supporting
  version: 1.0.0
---

# pdf-to-markdown

Converts **PDF documents to structured Markdown** (and optional HTML) using [markdrop](https://pypi.org/project/markdrop/). Preserves formatting, extracts images and tables, and can add AI-generated descriptions for images and tables via multiple LLM providers.

This skill is the **canonical owner** of PDF → Markdown ingestion. It is invoked by `tech-documentation` (import workflow) when the source is a PDF; it does not handle DOCX→Markdown or Markdown→PDF export (those remain with `docx-documentation`).

---

## Purpose and Scope

- **PDF → Markdown**: Convert a PDF (local file or URL) to Markdown with structure, links, extracted images, and detected tables (Docling + Table Transformer).
- **AI descriptions**: Optionally add image and table descriptions using Gemini, OpenAI, Anthropic, Groq, OpenRouter, or LiteLLM (requires API keys via `markdrop setup`).
- **Outputs**: Markdown file(s), optional interactive HTML with downloadable Excel tables, optional standalone image-description batch runs.

Use this skill when the user:

- Says "convert this PDF to Markdown", "import this PDF", "turn this PDF into Markdown with images and tables".
- Wants to bring a PDF (or PDF URL) into the vault as editable Markdown.
- Wants AI-generated alt text or descriptions for images/tables in a PDF-derived document.

---

## Dependency: markdrop

All conversion and AI features are provided by the **markdrop** Python package. The agent MUST ensure markdrop is installed before running scripts.

- **Core (PDF → Markdown + Gemini/OpenAI):** `pip install markdrop`
- **With Anthropic:** `pip install "markdrop[anthropic]"`
- **With Groq:** `pip install "markdrop[groq]"`
- **With LiteLLM (100+ providers):** `pip install "markdrop[litellm]"`
- **Everything (including local HuggingFace models):** `pip install "markdrop[all]"`

API keys for AI descriptions: run `markdrop setup <provider>` (e.g. `markdrop setup gemini`) and follow prompts. Keys are stored in the package `.env` (or environment variables).

---

## Workflows

| Workflow | Trigger | Details |
|----------|---------|---------|
| **convert** | "Convert PDF to Markdown", "Import this PDF", "PDF to MD" | PDF (file or URL) → Markdown + optional HTML; optional `--add_tables`. |
| **describe** | "Add AI descriptions to this Markdown", "Describe images/tables in this doc" | Run markdrop describe on an existing Markdown file (from a previous convert or any MD with images/tables). |
| **analyze** | "Analyze images in this PDF", "Extract and describe images" | PDF → image analysis output; optional `--save_images`. |
| **batch** | "Describe all images in this folder" | Batch image description generation for a directory. |

Detailed steps, CLI usage, and script usage are in `references/workflows.md`.

---

## Script and CLI Usage

When executing conversion or description steps, the agent SHOULD:

1. Prefer the **markdrop CLI** if the environment has markdrop installed and the operation is a single convert/describe/analyze.
2. Use the skill’s **scripts** (e.g. `scripts/convert.py`) when a thin wrapper is useful (e.g. fixed output dir, logging, or vault paths). Scripts call markdrop’s Python API or subprocess CLI.

### Convert PDF → Markdown (+ HTML)

```bash
markdrop convert <input_path> --output_dir <dir> [--add_tables]
# Example: local file
markdrop convert report.pdf --output_dir ./out --add_tables
# Example: URL
markdrop convert https://example.com/doc.pdf --output_dir ./out
```

### Add AI descriptions to Markdown

```bash
markdrop describe <markdown_file> --ai_provider <provider> [--output_dir <dir>] [--remove_images] [--remove_tables]
# Example: Gemini (default)
markdrop describe doc.md --ai_provider gemini
# Example: Anthropic Claude
markdrop describe doc.md --ai_provider anthropic
```

Supported `--ai_provider`: `gemini`, `openai`, `anthropic`, `groq`, `openrouter`, `litellm`.

### Analyze images in a PDF

```bash
markdrop analyze report.pdf --output_dir pdf_analysis [--save_images]
```

### Batch image descriptions

```bash
markdrop generate images/ --output_dir descriptions/ --prompt "Describe in detail." --llm_client gemini openai
```

Python API examples (for scripts) are in `references/workflows.md`.

---

## Integration with tech-documentation and docx-documentation

- **tech-documentation** (import workflow): When the user asks to import a **PDF** into Markdown, orchestrate by invoking this skill (run convert, then optionally describe). The result is canonical Markdown in the vault.
- **docx-documentation**: Owns DOCX ↔ Markdown and DOCX → PDF. It does **not** perform PDF → Markdown; for that, tech-documentation delegates to **pdf-to-markdown**.

Flow:

- User: "Import this PDF into the vault as Markdown."
- tech-documentation → **pdf-to-markdown** (convert, optionally describe) → cleaned Markdown → tech-documentation (place in vault, apply any vault conventions).

---

## Tool Safety Policy

- **Safe**: Converting a PDF to Markdown/HTML in a user-specified output directory; analyzing PDF images; generating descriptions into a new or specified file.
- **Requires confirmation**: Overwriting an existing Markdown file that the user considers canonical; installing packages (pip) if the user has not pre-approved.
- **Never**: Treating PDF as the canonical source of truth when the user intends Markdown to be canonical; deleting source PDFs without explicit request.

---

## Examples

**Example 1: Convert a PDF to Markdown with tables**

1. User: "Convert this report.pdf to Markdown and keep tables."
2. Agent ensures markdrop is installed, then runs: `markdrop convert report.pdf --output_dir ./out --add_tables`.
3. Agent reports the path to the generated Markdown (and HTML if produced) and offers to add AI descriptions if the user wants.

**Example 2: Import a PDF from a URL and add image descriptions**

1. User: "Import https://example.com/whitepaper.pdf as Markdown and add AI descriptions for images."
2. Agent runs convert, then runs describe with the chosen provider (e.g. `--ai_provider anthropic`), and places the final Markdown in the vault per tech-documentation conventions.

**Example 3: Add descriptions to an existing Markdown file**

1. User: "Add AI descriptions to the images and tables in doc.md."
2. Agent runs: `markdrop describe doc.md --ai_provider gemini` (or another provider) and reports the output path.

---

## References

- **Workflows (markdrop CLI/API, all features):** `references/workflows.md`
- **markdrop on PyPI:** https://pypi.org/project/markdrop/
