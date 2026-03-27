# PDF-to-Markdown Workflows (markdrop)

Detailed steps and CLI/API usage for the **markdrop** library. See [markdrop on PyPI](https://pypi.org/project/markdrop/).

---

## 1. Convert PDF → Markdown (+ HTML)

**Goal:** Turn a PDF (file or URL) into structured Markdown with preserved formatting, extracted images, and optional table detection.

### CLI

```bash
markdrop convert <input_path> --output_dir <dir> [--add_tables]
```

- `input_path`: Local path or URL (e.g. `https://arxiv.org/pdf/1706.03762`).
- `--output_dir`: Directory for `.md` and assets (images, etc.).
- `--add_tables`: Enable table detection (Microsoft Table Transformer).

### Python API

```python
from markdrop import markdrop, MarkDropConfig, add_downloadable_tables
from pathlib import Path
import logging

config = MarkDropConfig(
    image_resolution_scale=2.0,
    download_button_color='#444444',
    log_level=logging.INFO,
    log_dir='logs',
    excel_dir='markdrop-excel-tables',
)

html_path = markdrop("path/to/input.pdf", "output", config)
downloadable_html = add_downloadable_tables(html_path, config)
```

---

## 2. Add AI descriptions (images and tables)

**Goal:** Add LLM-generated descriptions for images and tables in an existing Markdown file (e.g. one produced by convert).

### CLI

```bash
markdrop describe <markdown_file> --ai_provider <provider> [--output_dir <dir>] [--remove_images] [--remove_tables]
```

| Provider   | `--ai_provider` |
|-----------|------------------|
| Google Gemini | `gemini` |
| OpenAI    | `openai` |
| Anthropic Claude | `anthropic` |
| Groq      | `groq` |
| OpenRouter | `openrouter` |
| LiteLLM   | `litellm` |

### API keys

```bash
markdrop setup gemini       # → GEMINI_API_KEY
markdrop setup openai       # → OPENAI_API_KEY
markdrop setup anthropic    # → ANTHROPIC_API_KEY
markdrop setup groq         # → GROQ_API_KEY
markdrop setup openrouter   # → OPENROUTER_API_KEY
markdrop setup litellm      # → LITELLM_API_KEY
```

### Python API

```python
from markdrop import process_markdown, ProcessorConfig, AIProvider, setup_keys

# One-time: setup_keys('anthropic')

config = ProcessorConfig(
    input_path="doc.md",
    output_dir="output",
    ai_provider=AIProvider.ANTHROPIC,
    remove_images=False,
    remove_tables=False,
    table_descriptions=True,
    image_descriptions=True,
    max_retries=3,
    retry_delay=2,
    anthropic_model_name="claude-sonnet-4-5",
    anthropic_text_model_name="claude-sonnet-4-5",
)
output_path = process_markdown(config)
```

---

## 3. Analyze images in a PDF

**Goal:** Extract and optionally save images from a PDF; optional analysis output.

### CLI

```bash
markdrop analyze report.pdf --output_dir pdf_analysis [--save_images]
```

---

## 4. Batch image description generation

**Goal:** Generate descriptions for a folder of images with one or more LLM clients.

### CLI

```bash
markdrop generate images/ --output_dir descriptions/ --prompt "Describe in detail." --llm_client gemini openai
```

`--llm_client` values: `qwen`, `gemini`, `openai`, `llama-vision`, `molmo`, `pixtral`.

### Python API

```python
from markdrop import generate_descriptions

generate_descriptions(
    input_path='images/',
    output_dir='output/',
    prompt='Give a highly detailed description of this image.',
    llm_client=['gemini', 'llama-vision'],
)
```

---

## Default models (overridable via config)

| Provider   | Default vision/model      | Default text (if different) |
|-----------|----------------------------|------------------------------|
| Gemini    | gemini-3.1-flash-lite      | —                            |
| OpenAI    | gpt-5.4                    | —                            |
| Anthropic | claude-opus-4-6            | claude-sonnet-4-5            |
| Groq      | meta-llama/llama-4-maverick-17b-128e-instruct | llama-3.3-70b-versatile |
| OpenRouter| google/gemini-3.1-flash-lite | anthropic/claude-sonnet-4-5 |
| LiteLLM   | openai/gpt-5.4             | —                            |

Use `--model` in CLI or the corresponding `*_model_name` / `*_text_model_name` in `ProcessorConfig` to override.

---

## DOCX / PPTX input

markdrop also supports DOCX and PPTX as input to the convert pipeline; same `markdrop convert` CLI and `markdrop()` Python API.
