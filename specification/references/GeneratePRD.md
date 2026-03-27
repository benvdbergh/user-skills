# GeneratePRD Workflow

Generate a Product Requirements Document using BMAD-style structure.

## When to Use

- User requests: "create PRD", "product requirements", "generate PRD"
- Planning phase of project
- Need structured product requirements document

## Workflow Steps

1. **Gather Product Context**
   - Extract product vision and goals
   - Identify target users and use cases
   - Collect business requirements

2. **Select Template**
   - Use `assets/PRDTemplate.md` as base structure
   - Follow BMAD Method PRD patterns

3. **Generate PRD**
   - Use Prompting skill with PRD guidance
   - Ensure all required sections:
     - Executive Summary
     - Product Vision
     - User Stories
     - Functional Requirements
     - Non-Functional Requirements
     - Success Metrics

4. **Validate PRD**
   - Check for completeness
   - Ensure user stories are well-defined
   - Verify requirements are testable

5. **Save & Version**
   - Save to `~/Knowledge/Projects/{project-name}/PRD.md`
   - Version controlled via VersionControl skill

## CLI Usage

```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type prd \
  --output ~/Knowledge/Projects/{project-name}/PRD.md
```

## Output

Creates `PRD.md` with complete product requirements following BMAD patterns.

## Integration

- Uses Prompting skill for document generation
- Feeds into ProjectPlanning skill for sharding into Epics/Stories
- Informs StateManagement for architectural constraints
