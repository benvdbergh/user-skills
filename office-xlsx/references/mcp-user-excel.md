# Excel MCP quick index (`user-excel`)

**Canonical usage, filepath rules, lifecycle tools, transport/env summary:** load **`references/excel-mcp-server.md`** first — it defines **MCP-first** execution for this skill before Python fallbacks.

## Cursor server id

Typically **`user-excel`** (display name may be `excel`). Confirm in the host MCP panel if calls fail.

## Tool inventory (compact)

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
| Session / persistence | `excel_list_open_workbooks`, `excel_open_workbook`, `excel_close_workbook`, `save_workbook` |

## Routing reminder

Prefer **`references/excel-mcp-server.md`** default order: **MCP → Python → `recalc.py`** per situation.
