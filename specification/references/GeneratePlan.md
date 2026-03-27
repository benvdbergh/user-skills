# GeneratePlan Workflow

Generate a technical plan from existing specification or PRD.

## When to Use

- User requests: "technical plan", "implementation plan", "architecture plan"
- After spec or PRD is complete
- Need detailed technical implementation plan

## Workflow Steps

1. **Load Source Document**
   - Read existing `spec.md` or `PRD.md`
   - Extract technical requirements
   - Identify architectural needs

2. **Generate Technical Plan**
   - Use `assets/PlanTemplate.md` as base
   - Structure plan with:
     - Architecture Overview
     - Technology Stack
     - Implementation Phases
     - Dependencies
     - Risk Assessment

3. **Validate Plan**
   - Ensure all requirements are addressed
   - Check for technical feasibility
   - Verify dependencies are identified

4. **Save & Version**
   - Save to `~/Knowledge/Projects/{project-name}/Plan.md`
   - Link to source spec/PRD
   - Version controlled

## CLI Usage

```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type plan \
  --source ~/Knowledge/Projects/{project-name}/specs/spec.md \
  --output ~/Knowledge/Projects/{project-name}/Plan.md
```

## Output

Creates `Plan.md` with detailed technical implementation plan.

## Integration

- Reads from specification skill outputs
- Feeds into ProjectPlanning for epic/story creation
- Informs StateManagement for architectural state
