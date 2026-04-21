# Output quality — spreadsheets

Load when polishing **new** workbooks or **financial-style** models. If the user supplied a **template**, its conventions override everything here.

## All Excel deliverables

- **Typography:** Use one consistent professional font (e.g. Arial, Calibri, Times New Roman) unless the template dictates otherwise.
- **Formula errors:** Ship models with **no** propagated error values (`#REF!`, `#DIV/0!`, `#VALUE!`, `#N/A`, `#NAME?`, `#NUM!`, `#NULL!`) in intended output ranges. Use `scripts/recalc.py` after formula changes, then fix reported locations.
- **Templates:** Match existing number formats, styles, sheet layout, and naming. Do not “normalize” a client workbook to a new aesthetic without explicit approval.

## Financial / scenario models (optional conventions)

When building **new** analysis workbooks (not retrofitting foreign templates), many teams use color semantics for auditability:

| Visual | Typical meaning |
|--------|-----------------|
| Blue text | Hard-coded inputs / scenario knobs |
| Black text | In-cell formulas |
| Green text | Links to other sheets in the same file |
| Red text | Links to external files |
| Yellow fill | Assumptions to revisit or validate |

### Number presentation

- **Years:** Prefer text labels such as `2026` (avoid thousands separators on year labels).
- **Currency:** Currency number format plus **explicit units in headers** (e.g. `Revenue ($m)`).
- **Zeros:** Consider formats that show zero as `-` where it improves readability.
- **Percentages:** Often one decimal (`0.0%`); align to stakeholder norm.
- **Negatives:** Accounting-style parentheses where requested.
- **Multiples:** Formats like `0.0x` for ratios.

### Model structure

- Centralize **assumptions** in dedicated cells; formulas reference those cells instead of embedding magic numbers.
- Document **hard-coded** figures with source, date, and pointer (comment, adjacent note cell, or footnote table).

## Verification checklist

- Spot-check **2–3** key formula links before scaling a pattern across a horizon.
- Watch **off-by-one** rows/columns and **far-right** forecast columns.
- Guard divisions with `IF`/`IFERROR` only where business logic allows (avoid hiding real errors blindly).
