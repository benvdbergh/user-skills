# Excel MCP (`user-excel`)

Cursor commonly exposes the Excel integration as MCP server identifier **`user-excel`** (display name `excel`). **Confirm the server id** in the host’s MCP panel if calls fail.

## Tool inventory (typical)

Use MCP descriptors in the IDE for authoritative schemas. Common tools include:

| Area | Tools |
|------|--------|
| Read / metadata | `read_data_from_excel`, `get_workbook_metadata`, `get_merged_cells`, `get_data_validation_info` |
| Write values | `write_data_to_excel` |
| Formulas | `apply_formula`, `validate_formula_syntax` |
| Structure | `create_workbook`, `create_worksheet`, `delete_worksheet`, `rename_worksheet`, `copy_worksheet` |
| Rows/columns | `insert_rows`, `insert_columns`, `delete_sheet_rows`, `delete_sheet_columns` |
| Ranges | `copy_range`, `delete_range`, `format_range`, `merge_cells`, `unmerge_cells` |
| Objects | `create_table`, `create_chart`, `create_pivot_table` |
| Validation | `validate_excel_range` |

## Routing guidance

- **Prefer MCP** for **one-shot** host-backed actions: read a block, apply one formula, create one sheet, validate a range, light formatting.
- **Prefer scripts (Python)** when chaining **many** structural edits, generating large grids programmatically, or repeating the same transform across files (deterministic, reviewable code).
- **Prefer pandas** when the first step is **analytical** (stats, filters, joins) on data that must be fully materialized in memory before any Excel write.

## Safety

- MCP touches **live files** on the machine running Excel; confirm paths and **ask before overwrite** of important workbooks.
- `write_data_to_excel` may accept formula strings **without** the same checks as `apply_formula`; choose the right tool for the risk level.
