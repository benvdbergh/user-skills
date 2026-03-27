# project-planning – Quick Start

BMAD-style project planning workflow for sharding PRDs into epics and stories.

## Quick Start

```bash
# Initialize project workflow
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts --project my-app --brief "Task management application"

# Shard PRD into epics
bun run $PAI_DIR/skills/project-planning/scripts/ShardPRD.ts --project my-app

# Create an epic
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts --project my-app --action create --epic "Authentication" --description "User authentication and authorization"

# Create a story
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts --project my-app --action create --story "User Login" --epic "Authentication" --description "User can log in with email and password"

# List epics
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts --project my-app --action list

# Cleanup prompt files (after populating content)
bun run $PAI_DIR/skills/project-planning/scripts/CleanupPrompts.ts --project my-app
```

## Project Structure

```
~/Knowledge/Projects/{project-name}/
├── brief.md
├── PRD.md
├── Architecture.md
├── CONSTITUTION.md
├── Epics/
│   ├── Epic-*.md          # Epic files
│   └── Epic-*.prompt.md   # Temporary prompts (removed after population)
└── Stories/
    ├── Story-*.md          # Story files
    └── Story-*.prompt.md   # Temporary prompts (removed after population)
```

## Complete Workflow

1. **Initialize Project**
   ```bash
   bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts --project my-app --brief "Description"
   ```

2. **Create Epics and Stories**
   ```bash
   bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts --project my-app --action create --epic "Epic Name" --description "Description"
   bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts --project my-app --action create --story "Story Name" --epic "Epic Name" --description "Description"
   ```

3. **Populate Content**
   - Use the generated `.prompt.md` files to populate epic/story content
   - Remove all `<!-- TODO: ... -->` comments as you fill in content

4. **Cleanup Prompt Files**
   ```bash
   bun run $PAI_DIR/skills/project-planning/scripts/CleanupPrompts.ts --project my-app
   ```
   - Automatically removes `.prompt.md` files for fully populated items
   - Preserves prompts for items still with TODOs
   - Safe to run multiple times

## Integration

- Uses Specification skill for PRD/Architecture generation
- Uses StateManagement for architectural constraints
- Uses Agents skill for role-based personas
