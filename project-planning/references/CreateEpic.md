# CreateEpic Workflow

Create a new epic for project planning.

## When to Use

- User requests: "create epic", "new epic", "add epic"
- Need to add a new epic to project
- Manually creating epics outside of PRD sharding

## Workflow Steps

1. **Gather Epic Information**
   - Extract epic name and description from user request
   - Identify epic scope and objectives
   - Determine epic priority

2. **Generate Epic File**
   - Use `assets/EpicTemplate.md`
   - Fill in epic details
   - Create file in `Epics/` directory

3. **Link to PRD**
   - If PRD exists, link epic to relevant PRD sections
   - Update PRD with epic references

4. **Update State**
   - Record epic creation in state
   - Update knowledge map

5. **Create Epic Directory**
   - Create epic-specific directory for stories
   - Set up epic structure

6. **Populate & Cleanup** (Agent Action)
   - Auto-populate epic content from `Epic-{Name}.prompt.md`
   - Replace all `<!-- TODO: ... -->` comments with detailed content
   - After population, run cleanup to remove prompt file

## CLI Usage

```bash
bun run $PAI_DIR/skills/project-planning/scripts/EpicManager.ts \
  --project <project-name> \
  --action create \
  --epic <epic-name> \
  --description <description>
```

## Output

Creates epic file in `Epics/` directory. Auto-generates `Epic-{Name}.prompt.md` for content population, removed after completion.

## Integration

- Links to Specification skill (PRD.md)
- Updates StateManagement skill
- Ready for story creation
