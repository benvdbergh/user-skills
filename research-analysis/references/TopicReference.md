# TopicReference Workflow

Generate topic references for project documents (PRD, Architecture, etc.).

## When to Use

- User requests: "generate reference", "topic link", "reference topic"
- Need to add research references to project documents
- Creating PRD, Architecture, or other project documents
- Want to link to research topics

## Workflow Steps

1. **Topic Identification**
   - Identify topics to reference
   - Load topic metadata
   - Verify topic exists

2. **Reference Generation**
   - Generate markdown reference link
   - Calculate relative path from project to topic
   - Format reference with title and path

3. **Reference Integration**
   - Add references to project document
   - Create "Research References" section
   - Maintain reference consistency

## CLI Usage

```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/TopicReference.ts \
  --topic <topic-path> \
  --project <project-path> \
  --output <output-path>
```

## Integration

- Used by Specification skill when generating PRD/Architecture
- Used by ProjectPlanning workflow
- Maintains research references in project documents

## Output

Generates markdown reference:
```markdown
## Research References
- [Topic Title](../../Topics/Category/Topic%20name.md)
```

## Example

```
User: "Add Langfuse research reference to my PRD"
→ Identifies topic: ~/Knowledge/Topics/AI/Langfuse deep research.md
→ Calculates relative path from project to topic
→ Generates reference: [Langfuse Analysis](../../Topics/AI/Langfuse%20deep%20research.md)
→ Adds to PRD.md in Research References section
```
