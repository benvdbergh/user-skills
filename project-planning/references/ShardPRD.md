# ShardPRD Workflow

Break PRD into implementable Epics and Stories (BMAD Method pattern).

## When to Use

- User requests: "shard PRD", "break down PRD", "create epics from PRD"
- PRD is complete and ready for planning
- Need to break down requirements into implementable chunks

## Workflow Steps

1. **Load PRD**
   - Read `PRD.md` from project directory
   - Parse PRD structure and sections

2. **Identify Epic Candidates**
   - Analyze PRD sections (user stories, features, requirements)
   - Group related requirements into epic candidates
   - Identify dependencies between epics
   - **Right-sized epics:** Aim for one clear goal per epic (one sentence), context-bound scope so each epic fits reasoning and tool use. Optional heuristics: e.g. 3–5 API endpoints or one major capability per epic when it fits the PRD.

3. **Create Epics**
   - For each epic candidate:
     - Use `assets/EpicTemplate.md`
     - Generate epic file in `Epics/` directory
     - Link to source PRD sections

4. **Break Epics into Stories**
   - For each epic:
     - Identify user stories within epic
     - Create story files in `Stories/` directory
     - Link stories to parent epic

5. **Update State**
   - Record planning decisions in state
   - Update knowledge map with epic/story relationships

6. **Generate Planning Summary**
   - Create summary of epics and stories
   - Show dependencies and relationships

## CLI Usage

```bash
bun run $PAI_DIR/skills/project-planning/scripts/ShardPRD.ts \
  --project <project-name> \
  --prd ~/Knowledge/Projects/{project-name}/PRD.md
```

## Output

Creates:
- Epic files in `Epics/` directory
- Story files in `Stories/` directory
- Planning summary document

## Integration

- Reads from Specification skill (PRD.md)
- Uses StateManagement skill for decision tracking
- Feeds into agent execution for story implementation
