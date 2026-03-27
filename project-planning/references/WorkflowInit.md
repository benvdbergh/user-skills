# WorkflowInit Workflow

Initialize BMAD-style project workflow and planning structure.

## When to Use

- User requests: "workflow init", "initialize project", "start planning"
- Starting a new project with BMAD Method
- Need structured project planning setup

## Workflow Steps

1. **Create Project Structure**
   - Create `~/Knowledge/Projects/{project-name}/` directory
   - Create `Epics/` subdirectory
   - Create `Stories/` subdirectory
   - Create `specs/` subdirectory (if not exists)

2. **Generate Project Brief**
   - Use `assets/ProjectBriefTemplate.md`
   - Extract project information from user request
   - Create `brief.md` in project directory

3. **Initialize State Management**
   - Run StateManagement InitializeState workflow
   - Set up state tracking for planning phase

4. **Create Planning Checklist**
   - Generate initial planning checklist
   - Mark planning phase as active

5. **Version Control Setup**
   - Initialize git repository if not exists
   - Create initial commit

## CLI Usage

```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts \
  --project <project-name> \
  --brief <brief-description>
```

## Output

Creates project structure with:
- `brief.md` - Project brief
- `Epics/` - Directory for epics
- `Stories/` - Directory for stories
- `.state/` - State management files

## Integration

- Uses Specification skill for spec generation
- Uses StateManagement skill for state initialization
- Uses VersionControl skill for versioning
