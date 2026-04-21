# Python libraries — openpyxl, pandas, recalc

## When to use which

| Need | Library | Notes |
|------|---------|--------|
| Bulk statistical analysis, joins, reshaping, exploration | **pandas** | Load sheets into DataFrames; see dtype and `usecols` for large files |
| Rich cell formatting, merged regions, precise formula strings | **openpyxl** | Formulas are stored as text until recalculated in Excel/LibreOffice |
| Full-workbook formula evaluation + error scan | **scripts/recalc.py** | Requires LibreOffice `soffice` on PATH |

## Formula-first rule

Prefer **Excel formulas** in the workbook for anything the user should recalculate by changing inputs. Avoid computing totals, growth rates, or ratios in Python and pasting numeric literals into model cells.

**Acceptable Python roles:** ingesting raw data, generating **formula strings**, layout automation, validation passes.

## openpyxl cautions

- Indices are **1-based** (row 1, column 1 = `A1`).
- `load_workbook(..., data_only=True)` reads **cached values**; saving that workbook can **strip formulas**. Use `data_only=True` only for read-only inspection, never as the default save path.
- For very large files: `read_only=True` / `write_only=True` modes when appropriate.

## pandas patterns

```python
import pandas as pd

df = pd.read_excel("file.xlsx")  # first sheet
all_sheets = pd.read_excel("file.xlsx", sheet_name=None)  # dict of DataFrames
```

- Pass `dtype={...}` when IDs must stay strings.
- Use `usecols` to limit columns on wide sheets.
- Use `parse_dates=[...]` for real date columns.

Writing: `df.to_excel("out.xlsx", index=False)` is fine for **data dumps**; for **models** with formulas, prefer openpyxl (or MCP) so formulas and formats stay under explicit control.

## Recalc script output

`python scripts/recalc.py <path.xlsx> [timeout_seconds]` prints JSON:

- `status`: `success` or `errors_found`
- `total_errors`, `error_summary` (types → counts and sample `Sheet!Cell` locations)
- `total_formulas`

Iterate: fix references → save → recalc until `success` or acceptable residual errors are documented.
