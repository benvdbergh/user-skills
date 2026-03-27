# PPTX OOXML reference (vendored)

Vendored from the upstream `claude-office-skills` repo to keep `office-pptx/SKILL.md` concise.

Primary use: when a workflow requires unpack/edit/pack of a `.pptx` and you need element ordering, relationship, and schema tips.

---

## Key reminders

- `p:txBody` child order: `<a:bodyPr>`, `<a:lstStyle>`, `<a:p>`
- Add `xml:space="preserve"` to text nodes with leading/trailing whitespace
- Keep relationships and content types consistent when editing slides/media
- Prefer validating after edits (when schemas are available)

