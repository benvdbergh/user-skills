---
name: office-xlsx
description: >-
  Excel workbook automation for `.xlsx` and `.xlsm`: models, edits, validation,
  LibreOffice-backed recalculation and error scanning, plus optional Excel MCP for
  host-backed reads and small writes. Use when the user names an Excel file, asks to build
  or fix a spreadsheet, recalculate formulas, clear `#REF`/`#DIV/0!`, validate ranges,
  apply tables or charts, or turn messy `.csv`/`.tsv` into a structured workbook.
  Do not use when the primary deliverable is Word, HTML, a standalone script only,
  a database pipeline without an xlsx artifact, or Google Sheets API-only workflows.
license: MIT
compatibility: >-
  Python 3 with `openpyxl`; LibreOffice `soffice` on PATH for `scripts/recalc.py`;
  optional Cursor Excel MCP (`user-excel`). Windows, Linux, and macOS supported for recalc.
metadata:
  scope: global
  tier: supporting
  version: 0.2.0
---

# office-xlsx

Spreadsheet automation with **formula-first** workbooks, **template-respecting** edits, **LibreOffice recalc + error scan**, and optional **Excel MCP** for interactive host operations.

**Deep detail (load on demand):** `references/output-quality.md`, `references/python-libraries.md`, `references/mcp-user-excel.md`, `references/skill-escalation.md`, `references/prior-art.md`.

---

## Workflow routing

Pick the execution layer by **batch size**, **fidelity needs**, and **repeatability** — not dogmatically by file type.

| Situation | Default layer | Why |
|-----------|---------------|-----|
| Single range read, metadata peek, one formula, one small write, one validation call | **Excel MCP** (`user-excel`) | Low latency, host-accurate Excel semantics |
| Many sheets, bulk row/column ops, generated grids, repeatable transforms, CI-style checks | **Python scripts** (openpyxl + this skill’s `scripts/`) | Deterministic, diffable, fewer round trips |
| EDA, stats, joins, reshaping before any workbook design | **pandas** (then openpyxl or MCP to emit xlsx) | Tables are too large or too analytic for MCP alone |

**Golden path after structural or formula edits:** save workbook → `python scripts/recalc.py path.xlsx` → fix any `errors_found` → repeat until clean (or document accepted exceptions).

---

## MCP dependencies

- **Server (typical Cursor id):** `user-excel` (display name `excel` — confirm in MCP settings if tools are missing).
- **Primary tools (grouped):** reads `read_data_from_excel`, `get_workbook_metadata`; writes `write_data_to_excel`; formulas `apply_formula`, `validate_formula_syntax`; structure `create_workbook`, `create_worksheet`, `copy_worksheet`, …; layout `format_range`, `merge_cells`, `insert_rows`, …; analytics objects `create_table`, `create_chart`, `create_pivot_table`; checks `validate_excel_range`, `get_data_validation_info`.
- **Full tool list and routing notes:** `references/mcp-user-excel.md`.

### Tool usage mapping (summary)

| Step | Tool / artifact | Layer |
|------|-------------------|--------|
| Discover sheets / defined names | `get_workbook_metadata` | MCP |
| Read one rectangular block with validation context | `read_data_from_excel` | MCP |
| Patch a model with verified formula | `apply_formula` | MCP |
| Full-file formula recompute + `#REF!` scan | `scripts/recalc.py` | Script |
| Transform 10k+ rows then write model | pandas + openpyxl (or chunked MCP) | Python first |
| Overnight batch on many files | openpyxl script in repo / temp tool | Script |

---

## Core workflows

### A) Recalculate and scan for errors (mandatory after formula work)

```bash
python scripts/recalc.py workbook.xlsx [timeout_seconds]
```

Stdout is JSON: `status` (`success` | `errors_found`), `total_errors`, `error_summary`, `total_formulas`. On Windows the script invokes `soffice` directly (no `timeout` wrapper).

### B) Build or edit models

1. Preserve existing templates when editing.
2. Put assumptions in **input cells**; formulas **reference** them.
3. Prefer openpyxl for rich formatting; use MCP when a single host operation is enough.
4. Run **A** before hand-off.

### C) Tabular sources (.csv / .tsv)

Use pandas to **clean and analyze**, then emit `.xlsx` via `to_excel` (data) or openpyxl (models with formulas). See `references/python-libraries.md`.

---

## Dependencies

- **Python:** `openpyxl`; **pandas** recommended when analysis-first.
- **LibreOffice:** `soffice` for `scripts/recalc.py`.
- **Excel MCP:** optional; if absent, use Python paths only and tell the user.

**Degraded mode:** Without LibreOffice, still edit structure and formulas in Python/MCP, but **full-workbook recalc verification** is unavailable until `soffice` works.

---

## Smoke tests

```powershell
python -c "import openpyxl; print('ok')"
python scripts/recalc.py --help
python scripts/recalc.py workbook.xlsx 60
```

---

## Tool safety policy

- **Safe:** Read-only inspection; writing **new** output paths; `recalc.py` on a copy; MCP reads and validations.
- **Requires confirmation:** Overwriting production workbooks; bulk MCP mutations; destructive sheet deletes.
- **Never:** Saving workbooks with `data_only=True` in openpyxl when formulas must be preserved; silent overwrite of user masters.

---

## Examples

**Example 1 — MCP quick read:** User asks what is in `Sheet1!A1:D20` of `model.xlsx`. Call `read_data_from_excel` with filepath, sheet, and cell range; summarize.

**Example 2 — Python model + verify:** User needs a 5-year P&L with scenario inputs on a dedicated sheet. Build with openpyxl (formula strings), save, then run `python scripts/recalc.py model.xlsx` and resolve any `#DIV/0!` in driver rows.

**Example 3 — Analysis then xlsx:** User has a 200 MB `.csv` for cohort stats. Use pandas for aggregation; write a **summary** sheet to `.xlsx` with `to_excel` or openpyxl; optional charts via MCP `create_chart` if the host is available.

---

## Optimization notes (v0.2.0)

- Expanded routing: **MCP vs scripts vs pandas**, grounded in `skill-set` script guidance and discovered **`user-excel`** MCP tools.
- Added `references/` hub: output quality, libraries, MCP inventory, escalation, prior-art link (proprietary upstream not copied).
- `recalc.py` gained `--help` / `-h` for agent discovery.
