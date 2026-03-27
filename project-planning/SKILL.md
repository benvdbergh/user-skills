---
name: project-planning
description: BMAD-style project planning workflow for sharding PRDs into epics and stories, managing project structure, and workflow initialization. USE WHEN project planning, shard PRD, create epic, create story, workflow init, break down requirements, epic management, story management.
---

# project-planning - BMAD-Style Project Planning

## Overview

The project-planning skill provides BMAD Method-style project planning workflows:
- **Workflow Initialization** - Set up project structure and planning phase
- **PRD Sharding** - Break PRD into implementable Epics and Stories
- **Epic Management** - Create and manage epics
- **Story Management** - Create and track user stories
- **Planning Review** - Review and validate planning phase
- **Cleanup Prompts** - Remove .prompt.md files after content population

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowInit** | "workflow init", "initialize project", "start planning" | `references/WorkflowInit.md` |
| **ShardPRD** | "shard PRD", "break down PRD", "create epics from PRD" | `references/ShardPRD.md` |
| **CreateEpic** | "create epic", "new epic", "add epic" | `references/CreateEpic.md` |
| **CreateStory** | "create story", "new story", "add story" | `references/CreateStory.md` |
| **PlanReview** | "review plan", "validate planning", "planning review" | `references/PlanReview.md` |
| **CleanupPrompts** | "cleanup prompts", "remove prompt files", "clean prompt files" | `references/CleanupPrompts.md` |

## Core Components

### 1. CLI Tools

**WorkflowInit.ts** - Initialize project workflow
```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts \
  --project <project-name> \
  --brief <brief-description>
```

**ShardPRD.ts** - Break PRD into epics/stories
```bash
bun run $PAI_DIR/skills/project-planning/scripts/ShardPRD.ts \
  --project <project-name> \
  --prd <path-to-PRD.md>
```

**EpicManager.ts** - Epic lifecycle management
```bash
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts \
  --project <project-name> \
  --action <create|list|update|cleanup> \
  --epic <epic-name>
```

**StoryManager.ts** - Story tracking
```bash
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts \
  --project <project-name> \
  --action <create|list|update|cleanup> \
  --story <story-name>
```

**CleanupPrompts.ts** - Remove prompt files for populated epics/stories
```bash
bun run $PAI_DIR/skills/project-planning/scripts/CleanupPrompts.ts \
  --project <project-name>
```

### 2. Templates

- **ProjectBriefTemplate.md** - Initial project brief
- **EpicTemplate.md** - Epic structure
- **StoryTemplate.md** - Story structure

(Templates live in `assets/`.)

### 3. Storage

Project structure in `~/Knowledge/Projects/{project-name}/`:
- `brief.md` - Project brief
- `PRD.md` - Product requirements
- `Architecture.md` - System design
- `CONSTITUTION.md` - Project constitution (if present)
- `Epics/` - Epic files
- `Stories/` - Story files

### 4. Prompt File Workflow

When epics and stories are created, the system automatically generates `.prompt.md` files:
- **Purpose**: Structured prompts for AI-assisted content population
- **Location**: Same directory as epic/story files
- **Naming**: `Epic-{Name}.prompt.md` and `Story-{Name}.prompt.md`
- **Cleanup**: Automatically removed after content is fully populated (no TODO comments)
- **Safety**: Only removed when epic/story is complete; preserved for incomplete items

## Examples

**Example 1: Initialize project workflow**
```
User: "Initialize planning for my task management app"
→ Invokes WorkflowInit workflow
→ Creates project structure
→ Generates brief.md
→ Sets up Epics/ and Stories/ directories
```

**Example 2: Shard PRD into epics**
```
User: "Break down the PRD into epics"
→ Invokes ShardPRD workflow
→ Reads PRD.md
→ Generates epics based on PRD sections
→ Creates epic files in Epics/ directory
```

**Example 3: Create story**
```
User: "Add a story for user login"
→ Invokes CreateStory workflow
→ Uses StoryTemplate.md
→ Creates Story-UserLogin.md
→ Links to parent epic
→ Generates Story-UserLogin.prompt.md for content population
```

Additional examples (Create epic, Cleanup prompts) are in `references/examples.md`.

**Action bias:** Implementation-oriented; the agent creates and updates files and runs CLI tools rather than only suggesting.

## Integration Points

- **Specification Skill** - Uses PRD/Architecture from Specification
- **StateManagement Skill** - Tracks planning decisions in state
- **Agents Skill** - Uses role-based personas for planning (Analyst, PM, Architect)
- **VersionControl Skill** - All planning artifacts version controlled

**Dependencies:** WorkflowInit and planning assume StateManagement and VersionControl when available; see `references/dependencies.md` for fallback when they are not.
