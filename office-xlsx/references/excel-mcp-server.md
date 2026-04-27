# Excel MCP server (`excel-com-mcp` / Cursor `user-excel`)

Authoritative operator details (transports, env vars, allowlists, `filepath` rules) live in the **`excel-com-mcp`** distribution: upstream [README](https://github.com/haris-musa/excel-mcp-server/blob/main/README.md) and [TOOLS.md](https://github.com/haris-musa/excel-mcp-server/blob/main/TOOLS.md). This file is the **office-xlsx** skill’s default execution contract: use this MCP **first** when it is configured, then fall back to openpyxl / pandas / `scripts/recalc.py` as described in `SKILL.md`.

## When to load this reference

Load when routing workbook work in Cursor (or any host that exposes MCP tools), confirming **`user-excel`** (or your configured server name) is enabled before assuming tools exist.

## Server identity

| Concept | Typical value |
|--------|----------------|
| Cursor MCP server id | **`user-excel`** (confirm in MCP settings; display name may be `excel`) |
| PyPI / console package | **`excel-com-mcp`** (`uvx excel-com-mcp stdio`) |
| Purpose | Create/read/edit `.xlsx` / `.xlsm` via **file** (`openpyxl`) and optional **Windows Excel COM** |

## Default execution order (agents)

1. **Excel MCP** — For discovery, reads, small writes, formulas, formatting, tables/charts/pivot helpers, validation calls, and COM-backed session workflows when available.
2. **Python (openpyxl / pandas)** — For bulk generation, large scripted edits, repeatable transforms, or CI-style pipelines when MCP round trips are costly or MCP is absent.
3. **`scripts/recalc.py`** — After structural or formula edits that must be verified as a workbook snapshot (LibreOffice-backed full recalc + error scan); run **after** saving to disk when using file-backed workflows.

If MCP tools are missing or errors indicate COM/file routing mismatch, **do not** retry blindly: switch layer per `SKILL.md` and tell the user what failed.

## `filepath`: workbook identity

Every workbook-scoped tool accepts **`filepath`** (same rules for reads and writes):

- **Absolute local path** — Normal file identity; path allowlists (`EXCEL_MCP_ALLOWED_PATHS`) apply when configured on the server.
- **`https://…` cloud locator** — Use when Excel reports a SharePoint-style **`Workbook.FullName`** (must match COM identity). Get it via **`excel_list_open_workbooks`** or Excel VBA Immediate: `? ActiveWorkbook.FullName`. Passing only a synced **disk** path while Excel’s `FullName` is `https://` can prevent COM matching and cause **`auto`** routing to fall back to file mode (**permission denied** while Excel holds the file).

Optional **`workbook_transport`** on routed tools: **`auto`** \| **`file`** \| **`com`** (inherits **`EXCEL_MCP_TRANSPORT`** when omitted). This selects **workbook backend**, not the MCP wire transport (stdio/HTTP).

## Session and lifecycle (Windows + COM)

| Tool | Role |
|------|------|
| **`excel_list_open_workbooks`** | Discovery: JSON list of open workbooks with exact **`full_name`** locators — copy into **`filepath`** for downstream tools. |
| **`excel_open_workbook`** | Open an existing workbook in Excel so **`auto`** / **`com`** routing can attach. |
| **`excel_close_workbook`** | Close in Excel; optional save before close. |

These tools are **COM-only**; they do not use the same routing matrix as generic workbook ops but align with ADR 0009-style discovery.

## Persistence

Mutating tools do **not** imply an implicit disk save compatible with every backend policy. When you need changes flushed for **`openpyxl`** reads or predictable file snapshots, call **`save_workbook`** (see upstream TOOLS.md). Align reads/writes: COM-first reads may require **`save_workbook`** before **`read_data_from_excel`** if you need on-disk consistency.

## Tool groups (summary)

Use host MCP descriptors for JSON schemas. Typical families:

| Area | Representative tools |
|------|----------------------|
| Metadata / read | `get_workbook_metadata`, `read_data_from_excel` |
| Write / formulas | `write_data_to_excel`, `apply_formula`, `validate_formula_syntax` |
| Structure | `create_workbook`, `create_worksheet`, `copy_worksheet`, `rename_worksheet`, `delete_worksheet` |
| Rows/columns | `insert_rows`, `insert_columns`, `delete_sheet_rows`, `delete_sheet_columns` |
| Ranges | `copy_range`, `delete_range`, `format_range`, `merge_cells`, `unmerge_cells`, `get_merged_cells` |
| Objects | `create_table`, `create_chart`, `create_pivot_table` |
| Validation | `validate_excel_range`, `get_data_validation_info` |
| Lifecycle | `excel_list_open_workbooks`, `excel_open_workbook`, `excel_close_workbook`, `save_workbook` |

## Operator environment (high level)

Server-side variables (`EXCEL_MCP_TRANSPORT`, `EXCEL_MCP_ALLOWED_PATHS`, `EXCEL_MCP_ALLOWED_URL_PREFIXES`, COM-related flags) are documented in the upstream README. Remote transports (SSE / streamable HTTP) may require **`EXCEL_FILES_PATH`** jail paths — **stdio** local setups usually pass absolute **`filepath`** per call.

## Tool safety policy (MCP)

| Class | Guidance |
|-------|-----------|
| **Safe** | Read-only inspection; validations; creating **new** output paths; reads after explicit user consent on scope |
| **Requires confirmation** | Overwrites of production workbooks; destructive sheet/range deletes; bulk mutations |
| **Never** | Guessing SharePoint URLs; ignoring **`full_name`** from discovery; silent overwrite of masters |

## Fallback when MCP is unavailable

Use **openpyxl** / **pandas** plus **`scripts/recalc.py`** from this skill; state clearly that Excel MCP was not used. Do not invent MCP tool calls.

## Relationship to other references

- **`mcp-user-excel.md`** — Short index; detailed routing lives **here**.
- **`SKILL.md`** — Routing table, examples, recalc golden path.
- **`skill-escalation.md`** — Boundaries vs Word/PDF/Slides and non-spreadsheet pipelines.
