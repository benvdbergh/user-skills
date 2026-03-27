# ProjectResearch Workflow

Project-specific research summary workflow for saving research findings directly to project Research folders.

## When to Use

- User requests: "research for [project]", "project research", "research summary for [project]"
- Research is conducted specifically for a project (not general topic research)
- Need to save project-specific research summaries
- Research findings should be linked to a specific project context

## Workflow Steps

1. **Project Detection**
   - Detect project name from context or user input
   - Verify project exists in `~/Knowledge/Projects/{project-name}/`
   - Check project brief.md for project metadata

2. **Research Execution**
   - Conduct research using appropriate workflow (DeepResearch, MarketResearch, etc.)
   - Research topics saved to `~/Knowledge/Topics/{category}/` (general knowledge)
   - Collect findings for project-specific summary

3. **Summary Generation**
   - Synthesize research findings into project-specific summary
   - Include references to general research topics
   - Format for project context

4. **Project Research Storage**
   - Create `~/Knowledge/Projects/{project-name}/Research/` if needed
   - Save summary to `Research/{summary-title}.md`
   - Include frontmatter with project metadata
   - Link to related research topics

5. **Topic References**
   - Generate references to general research topics
   - Create relative links from project to Topics directory
   - Maintain connection between project-specific and general research

## CLI Usage

```bash
# Save project research summary
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/ProjectResearchSummary.ts \
  --project <project-name> \
  --summary <summary-content> \
  --title <summary-title> \
  --topic-refs <topic1-path,topic2-path> \
  --research-type <type>
```

## Integration

- Uses **DeepResearch**, **MarketResearch**, or **TechnicalAnalysis** workflows for research execution
- Uses **ResearchSynthesizer** to combine findings
- Uses **TopicReference** to generate topic links
- Saves to project-specific Research folder (not general Topics)

## Storage Structure

**General Research Topics** (reusable across projects):
```
~/Knowledge/Topics/
├── AI/
│   ├── Langfuse deep research.md
│   └── ...
└── [other categories]/
```

**Project-Specific Research** (project context):
```
~/Knowledge/Projects/{project-name}/
├── Research/
│   ├── Research-Summary.md
│   ├── Competitive-Analysis.md
│   └── ...
└── brief.md
```

## Output

Creates project-specific research summary:
- Project metadata in frontmatter
- Research findings summary
- Links to related general research topics
- Project context and recommendations

## Example

```
User: "Research competitors for PAI-Dashboard project"
→ Detects project: PAI-Dashboard
→ Conducts MarketResearch workflow
→ Saves topics to ~/Knowledge/Topics/AI/ (general knowledge)
→ Generates project summary
→ Saves to ~/Knowledge/Projects/PAI-Dashboard/Research/Competitive-Analysis.md
→ Includes links to Topics/AI/ research files
```

## Best Practices

1. **Separate Concerns**: General topics in Topics/, project summaries in Projects/{project}/Research/
2. **Link Topics**: Always include references to general research topics
3. **Project Context**: Focus summary on project-specific insights and recommendations
4. **Reuse Topics**: Reference existing topics instead of duplicating research
5. **Consistent Naming**: Use descriptive titles for research summaries
