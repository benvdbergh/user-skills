# ResearchToSpec Workflow

Handoff research findings to specification generation workflow.

## When to Use

- User requests: "research to spec", "handoff research", "research findings"
- Research phase complete, ready for specification
- Need to format research for specification generation
- Preparing research handoff to Architect, PM, or UX Designer

## Workflow Steps

1. **Load Research Topic**
   - Load research topic from `~/Knowledge/Topics/{category}/{topic-name}.md`
   - Extract research findings
   - Identify relevant sections

2. **Role-Based Formatting**
   - Extract findings for Architect role
   - Extract findings for UX Designer role
   - Extract findings for PM role
   - Format according to role needs

3. **Handoff Document Generation**
   - Generate handoff document with role-specific sections
   - Include research references
   - Prepare for specification workflow

4. **Specification Integration**
   - Pass handoff to Specification skill
   - Trigger GenerateSpec or GeneratePRD workflow
   - Include research references in specification

## CLI Usage

```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/ResearchSynthesizer.ts \
  --topic <topic-path> \
  --handoff <architect|ux|pm|all>
```

## Integration

- Uses Specification skill for spec generation
- References research topics in project documents
- Feeds into ProjectPlanning workflow
- Updates StateManagement with research-derived constraints

## Output

Generates research handoff:
- Role-specific findings (Architect, UX Designer, PM)
- Research references
- Ready for specification generation

## Example

```
User: "Handoff Langfuse research to specification"
→ Loads ~/Knowledge/Topics/AI/Langfuse deep research.md
→ Extracts Architect findings (technical architecture, stack recommendations)
→ Extracts UX Designer findings (user research, competitive UX)
→ Extracts PM findings (market positioning, feature prioritization)
→ Generates handoff document
→ Passes to Specification skill for GeneratePRD workflow
→ PRD includes research references
```
