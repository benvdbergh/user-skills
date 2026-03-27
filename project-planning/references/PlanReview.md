# PlanReview Workflow

Review and validate planning phase completeness.

## When to Use

- User requests: "review plan", "validate planning", "planning review"
- Planning phase is complete
- Need to validate planning artifacts before implementation

## Workflow Steps

1. **Load Planning Artifacts**
   - Read project brief
   - Read PRD
   - Read all epics
   - Read all stories

2. **Validate Completeness**
   - Check all PRD requirements are covered by epics
   - Check all epics have stories
   - Verify story acceptance criteria are defined

3. **Check Dependencies**
   - Identify epic dependencies
   - Identify story dependencies
   - Verify dependency order is valid

4. **Validate State**
   - Check state management is initialized
   - Verify architectural decisions are recorded
   - Check constraints are defined

5. **Generate Review Report**
   - Create planning review report
   - List issues and recommendations
   - Provide planning phase summary

## CLI Usage

```bash
bun run $PAI_DIR/skills/project-planning/scripts/WorkflowInit.ts \
  --project <project-name> \
  --action review
```

## Output

Generates planning review report with validation results.

## Integration

- Validates Specification skill outputs
- Validates StateManagement skill state
- Ensures readiness for implementation phase
