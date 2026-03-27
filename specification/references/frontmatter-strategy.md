# Frontmatter Strategy for Knowledge Documents

## Overview

All documents in `~/Knowledge/` now use YAML frontmatter for metadata. This enables:
- **Obsidian compatibility** - Frontmatter is queryable in Obsidian
- **LLM readability** - Still human-readable and LLM-friendly
- **Programmatic access** - Easy to update from hooks and tools
- **Consistency** - Standardized metadata across all documents

## Format

All documents follow this structure:

```markdown
---
title: Document Title
type: document-type
created: YYYY-MM-DD
updated: YYYY-MM-DD
# ... template-specific fields
---

# Document Title

[Document body content]
```

## Common Properties

All documents have these **required** fields:
- `title` - Document title
- `type` - Document type (brief, constitution, spec, prd, epic, story, plan)
- `created` - ISO 8601 date when created
- `updated` - ISO 8601 date when last updated

**Optional** common fields:
- `project` - Project name (for project documents)
- `status` - Document status (draft, active, archived, etc.)
- `version` - Version number (for versioned documents)
- `tags` - Array of tags
- `aliases` - Array of alternative names (for Obsidian)
- `related` - Array of related document paths

## Template-Specific Properties

See `references/FrontmatterStrategy.yaml` for full template definitions (brief, constitution, spec, prd, plan, epic, story, research).

## Tools

### FrontmatterManager.ts

Manage frontmatter in documents:

```bash
# Read frontmatter
bun run FrontmatterManager.ts --action read --file path/to/doc.md

# Migrate from old format
bun run FrontmatterManager.ts --action migrate --file path/to/doc.md

# Update a field
bun run FrontmatterManager.ts --action update --file doc.md --key status --value active

# Validate frontmatter
bun run FrontmatterManager.ts --action validate --file doc.md --template brief
```

Run from skill scripts directory: `$PAI_DIR/skills/specification/scripts/FrontmatterManager.ts`

## Strategy File

The complete strategy is defined in:
`$PAI_DIR/skills/specification/references/FrontmatterStrategy.yaml`

This file defines:
- Common properties
- Template-specific properties
- Validation rules
- Migration patterns
