---
name: office-xlsx
description: >-
  Excel / spreadsheet automation skill for creating, editing, and validating `.xlsx` models
  with formula integrity checks and LibreOffice-backed recalculation. Use when the user asks
  to "update an Excel file", "build a spreadsheet model", "recalculate formulas", "fix #REF/#DIV errors",
  or wants spreadsheet conventions (inputs vs formulas) enforced.
license: MIT
metadata:
  scope: global
  tier: supporting
  version: 0.1.0
---

# office-xlsx

Office automation skill for **Excel workbooks (`.xlsx`)**. Primary focus:

- **Formula-first** modeling (avoid hardcoding calculated values).
- **Recalculate + scan for Excel error values** (`#REF!`, `#DIV/0!`, etc.).
- **Template-respecting edits** (preserve existing formats and conventions).

---

## Core workflows

### 1) Recalculate formulas and report errors (LibreOffice)

- Run: `python scripts/recalc.py workbook.xlsx [timeout_seconds]`
- Output: JSON summary to stdout
  - `status`: `success` or `errors_found`
  - `total_errors`
  - `error_summary` (locations)

---

## Dependencies (Windows-aware)

- **Python**
  - `openpyxl`
- **System tools**
  - LibreOffice `soffice` (required for recalc)

Degraded mode:

- If LibreOffice is unavailable, this skill can still help with **structure, formulas, and formatting** via Python tooling, but cannot provide authoritative recalculated values.

---

## Smoke tests

```powershell
python -c "import openpyxl; print('ok')"
python scripts/recalc.py workbook.xlsx 60
```

---

## Tool Safety Policy

- **Safe operations**
  - Read-only inspection of workbooks
  - Writing new output workbook files
  - Recalc + error scanning

- **Requires confirmation**
  - Overwriting an existing workbook
  - Bulk edits across many sheets/ranges

- **Never allowed**
  - Destroying formulas by saving with `data_only=True`

