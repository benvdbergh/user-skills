# CleanupPrompts Workflow

Automatically remove `.prompt.md` files after epics and stories have been fully populated.

## When to Use

- User requests: "cleanup prompts", "remove prompt files", "clean prompt files"
- After populating epic/story content (removing all TODO comments)
- Periodic maintenance to clean up temporary prompt files
- Before committing project planning artifacts

## Overview

When epics and stories are created, the system automatically generates `.prompt.md` files containing structured prompts for content population. Once the epic/story content is fully populated (all TODO comments removed), these prompt files are no longer needed and can be safely removed.

## How It Works

1. **Detection**: Scans all epic and story `.md` files in the project
2. **Validation**: Checks if files contain any `<!-- TODO: ... -->` comments
3. **Cleanup**: Removes corresponding `.prompt.md` files for fully populated items
4. **Preservation**: Keeps prompt files for items that still have TODOs

## Workflow Steps

1. **Scan Project Files**
   - Read all files in `Epics/` directory
   - Read all files in `Stories/` directory
   - Filter for `.md` files starting with `Epic-` or `Story-`

2. **Check Population Status**
   - Read each epic/story file content
   - Use regex pattern `/<!--\s*TODO:.*?-->/g` to detect TODO comments
   - Mark file as "populated" if no TODOs found

3. **Remove Prompt Files**
   - For each populated file, check if corresponding `.prompt.md` exists
   - Delete prompt file if epic/story is fully populated
   - Log each removal for visibility

4. **Report Results**
   - Display count of cleaned files
   - Show message if no cleanup needed

## CLI Usage

### Cleanup All Prompts (Recommended)
```bash
bun run $PAI_DIR/skills/project-planning/scripts/CleanupPrompts.ts \
  --project <project-name>
```

### Cleanup Epic Prompts Only
```bash
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts \
  --project <project-name> \
  --action cleanup
```

### Cleanup Story Prompts Only
```bash
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts \
  --project <project-name> \
  --action cleanup
```

## Examples

**Example 1: Cleanup after populating content**
```bash
# After populating epics and stories with content
bun run $PAI_DIR/skills/project-planning/scripts/CleanupPrompts.ts --project PAI-Dashboard

# Output:
# ✓ Removed epic prompt: Epic-Authentication.prompt.md
# ✓ Removed story prompt: Story-UserLogin.prompt.md
# ✓ Cleaned up 2 prompt file(s) for project: PAI-Dashboard
```

**Example 2: Safe to run multiple times**
```bash
# Running cleanup again (no files to clean)
bun run $PAI_DIR/skills/project-planning/scripts/CleanupPrompts.ts --project PAI-Dashboard

# Output:
# No prompt files to clean up (all epics/stories still have TODOs or prompts already removed).
```

**Example 3: Selective cleanup**
```bash
# Only cleanup epics
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts \
  --project PAI-Dashboard \
  --action cleanup

# Only cleanup stories
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts \
  --project PAI-Dashboard \
  --action cleanup
```

## Safety Features

- **Idempotent**: Safe to run multiple times without side effects
- **Selective**: Only removes prompts for fully populated items
- **Preservation**: Keeps prompts for incomplete items (still have TODOs)
- **Non-destructive**: Never deletes epic/story files, only prompt files
- **Validation**: Checks file existence before deletion

## Integration

- Works with **CreateEpic** workflow (prompts generated automatically)
- Works with **CreateStory** workflow (prompts generated automatically)
- Can be run manually or as part of **PlanReview** workflow
- Integrates with version control (cleanup before commits)

## Best Practices

1. **Run after population**: Clean up prompts after populating epic/story content
2. **Regular maintenance**: Run periodically to keep project clean
3. **Before commits**: Clean up prompts before committing planning artifacts
4. **Selective cleanup**: Use epic/story-specific cleanup if needed
5. **Verify first**: Check which files will be cleaned (list epics/stories first)

## Technical Details

### Detection Pattern
```typescript
const todoPattern = /<!--\s*TODO:.*?-->/g;
const isPopulated = !todoPattern.test(content);
```

### File Naming Convention
- Epic: `Epic-{Name}.md` → `Epic-{Name}.prompt.md`
- Story: `Story-{Name}.md` → `Story-{Name}.prompt.md`

### Error Handling
- Gracefully handles missing directories
- Skips non-existent files
- Reports errors clearly without crashing
