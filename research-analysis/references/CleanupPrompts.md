# CleanupPrompts Workflow

Automatically remove `.prompt.md` files after research topics have been fully populated.

## When to Use

- User requests: "cleanup prompts", "remove prompt files", "clean prompt files"
- After populating research content (removing all TODO comments)
- Periodic maintenance to clean up temporary prompt files
- Before committing research artifacts

## Overview

When research topics are created, the system automatically generates `.prompt.md` files containing structured prompts for research execution. Once the research content is fully populated (all TODO comments removed), these prompt files are no longer needed and can be safely removed.

## How It Works

1. **Detection**: Scans all research topic `.md` files in a category
2. **Validation**: Checks if files contain any `<!-- TODO: ... -->` comments
3. **Cleanup**: Removes corresponding `.prompt.md` files for fully populated items
4. **Preservation**: Keeps prompt files for items that still have TODOs

## Workflow Steps

1. **Scan Category Files**
   - Read all files in `~/Knowledge/Topics/{category}/` directory
   - Filter for `.md` files (excluding `.prompt.md` files)

2. **Check Population Status**
   - Read each research topic file content
   - Use regex pattern `/<!--\s*TODO:.*?-->/g` to detect TODO comments
   - Mark file as "populated" if no TODOs found

3. **Remove Prompt Files**
   - For each populated file, check if corresponding `.prompt.md` exists
   - Delete prompt file if research is fully populated
   - Log each removal for visibility

4. **Report Results**
   - Display count of cleaned files
   - Show message if no cleanup needed

## CLI Usage

### Cleanup All Prompts in Category
```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/CleanupPrompts.ts \
  --category <category-name>
```

### Cleanup Specific Topic
```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/CleanupPrompts.ts \
  --category <category-name> \
  --topic <topic-name>
```

## Examples

**Example 1: Cleanup after populating research**
```bash
# After populating research topics with content
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/CleanupPrompts.ts --category AI

# Output:
# ✓ Removed prompt: Langfuse deep research.prompt.md
# ✓ Removed prompt: AI Observability Tools Market Research.prompt.md
# ✓ Cleaned up 2 prompt file(s) in category: AI
```

**Example 2: Safe to run multiple times**
```bash
# Running cleanup again (no files to clean)
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/CleanupPrompts.ts --category AI

# Output:
# No prompt files to clean up in category: AI
```

**Example 3: Selective cleanup**
```bash
# Only cleanup specific topic
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/CleanupPrompts.ts \
  --category AI \
  --topic "Langfuse deep research"
```

## Safety Features

- **Idempotent**: Safe to run multiple times without side effects
- **Selective**: Only removes prompts for fully populated items
- **Preservation**: Keeps prompts for incomplete items (still have TODOs)
- **Non-destructive**: Never deletes research files, only prompt files
- **Validation**: Checks file existence before deletion

## Integration

- Works with **DeepResearch** workflow (prompts generated automatically)
- Works with **MarketResearch** workflow (prompts generated automatically)
- Works with **TechnicalAnalysis** workflow (prompts generated automatically)
- Works with **FrameworkComparison** workflow (prompts generated automatically)
- Can be run manually or as part of research validation workflow
- Integrates with version control (cleanup before commits)

## Best Practices

1. **Run after population**: Clean up prompts after populating research content
2. **Regular maintenance**: Run periodically to keep research topics clean
3. **Before commits**: Clean up prompts before committing research artifacts
4. **Selective cleanup**: Use topic-specific cleanup if needed
5. **Verify first**: Check which files will be cleaned (list topics first)

## Technical Details

### Detection Pattern
```typescript
const todoPattern = /<!--\s*TODO:.*?-->/g;
const isPopulated = !todoPattern.test(content);
```

### File Naming Convention
- Research topic: `{topic-name}.md` → `{topic-name}.prompt.md`

### Error Handling
- Gracefully handles missing directories
- Skips non-existent files
- Reports errors clearly without crashing

## Shared Utilities

This workflow uses the shared `DocumentationUtils.ts` tool from `~/.claude/Tools/` for consistency across PAI skills. The same cleanup logic is used by ProjectPlanning and other skills that generate prompt files.
