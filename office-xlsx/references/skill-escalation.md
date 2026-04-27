# Skill escalation — office-xlsx

## Owns

- `.xlsx` / `.xlsm` workbook structure, formulas, formatting, and conventions (inputs vs calculated cells).
- LibreOffice-backed full-workbook **recalculation** and **error-cell scanning** via `scripts/recalc.py`.
- Guidance for **openpyxl** / **pandas** workflows and **Excel MCP** (`user-excel` in typical Cursor installs) when the deliverable remains a spreadsheet artifact; MCP-first usage is specified in **`references/excel-mcp-server.md`**.

## Does not own

- **Word / PDF** document authoring or tracked changes → `office-docx`, `docx-documentation`, `office-pdf`.
- **PowerPoint** → `office-pptx`.
- **Database ETL**, warehouse loads, or production pipelines where Excel is not the primary artifact → general software / data-engineering skills.
- **Google Sheets API**-only automation (no local `.xlsx`) → out of scope unless the user explicitly wants export to `.xlsx` first.

## Escalation paths

| Situation | Route to |
|-----------|----------|
| Markdown or long-form report as primary output | `tech-documentation` |
| Branded Word/PDF from model | `kion-docx`, `docx-documentation`, `office-pdf` as appropriate |
| Market sizing / segmentation narrative | `market-segmentation-research` (data may still land in xlsx) |
| Repo or CI concerns | `ci-cd-governance`, `repo-docs` |

## MCP availability

If the Excel MCP server is not configured, fall back to **Python (openpyxl/pandas)** plus `scripts/recalc.py` for validation; state the gap to the user instead of assuming tools exist. When MCP **is** configured, follow **`references/excel-mcp-server.md`** before choosing scripted alternatives.
