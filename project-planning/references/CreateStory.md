# CreateStory Workflow

Create a new user story for an epic.

## When to Use

- User requests: "create story", "new story", "add story"
- Need to add user story to an epic
- Breaking down epic into implementable stories

## Workflow Steps

1. **Gather Story Information**
   - Extract story name and description
   - Identify parent epic
   - Determine story acceptance criteria

2. **Generate Story File**
   - Use `assets/StoryTemplate.md`
   - Fill in story details
   - Create file in `Stories/` directory

3. **Link to Epic**
   - Link story to parent epic
   - Update epic file with story reference

4. **Update State**
   - Record story creation in state
   - Update knowledge map with story relationships

5. **Set Story Status**
   - Initialize story status (planned, in-progress, done)
   - Set story priority

6. **Populate & Cleanup** (Agent Action)
   - Auto-populate story content from `Story-{Name}.prompt.md`
   - Replace all `<!-- TODO: ... -->` comments with detailed content
   - After population, run cleanup to remove prompt file

## CLI Usage

```bash
bun run $PAI_DIR/skills/project-planning/scripts/StoryManager.ts \
  --project <project-name> \
  --action create \
  --story <story-name> \
  --epic <epic-name> \
  --description <description>
```

## Output

Creates story file in `Stories/` directory. Auto-generates `Story-{Name}.prompt.md` for content population, removed after completion.

## Integration

- Links to parent epic
- Updates StateManagement skill
- Ready for implementation by developer agents
