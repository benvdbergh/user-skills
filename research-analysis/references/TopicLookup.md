# TopicLookup Workflow

Check for existing research topics before conducting new research.

## When to Use

- User requests: "check topic", "topic exists", "find research"
- Before conducting new research
- Need to verify if research already exists
- Want to reference existing research

## Workflow Steps

1. **Topic Search**
   - Search `~/Knowledge/Topics/` for topic
   - Check by topic name and category
   - Use fuzzy matching for similar topics

2. **Topic Validation**
   - If topic found, validate completeness
   - Check research quality
   - Verify relevance

3. **Reference Generation**
   - If topic exists, generate reference link
   - Format for project document inclusion
   - Return topic path and metadata

4. **Similar Topics**
   - If exact match not found, suggest similar topics
   - Help user find related research
   - Prevent duplicate research

## CLI Usage

```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/TopicManager.ts \
  --action lookup \
  --topic <topic-name> \
  --category <category>
```

## Integration

- Used by all research workflows before research execution
- Prevents duplicate research
- Enables research reuse across projects
- Integrates with ProjectPlanning WorkflowInit

## Output

Returns:
- Topic exists: reference link and path
- Topic not found: suggestion to create new research
- Similar topics: list of related research

## Example

```
User: "Check if Langfuse research exists"
→ Searches ~/Knowledge/Topics/AI/ for "Langfuse"
→ Finds: ~/Knowledge/Topics/AI/Langfuse deep research.md
→ Validates completeness
→ Returns reference link: [Langfuse Analysis](../../Topics/AI/Langfuse%20deep%20research.md)
→ Project can reference existing topic
```
