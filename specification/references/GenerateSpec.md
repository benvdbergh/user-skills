# GenerateSpec Workflow

Generate a project specification using Spec Kit-style executable specifications.

## When to Use

- User requests: "generate spec", "create spec", "specify project"
- Starting a new project with spec-first approach
- Need executable specification as single source of truth

## Workflow Steps

1. **Gather Requirements**
   - Extract project name and description from user request
   - Identify project type (web app, API, CLI tool, etc.)
   - Collect key requirements and constraints

2. **Select Template**
   - Use `assets/SpecTemplate.md` as base structure
   - Customize based on project type

3. **Generate Specification**
   - Use Prompting skill to generate spec content
   - Ensure all required sections are present:
     - Project Overview
     - Goals & Objectives
     - Requirements
     - Technical Constraints
     - Success Criteria

4. **Validate Specification**
   - Run `ValidateSpec.ts` to check completeness
   - Ensure all sections have content

5. **Save & Version**
   - Save to `~/Knowledge/Projects/{project-name}/specs/spec.md`
   - Initialize version control if needed
   - Create initial commit

## CLI Usage

```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type spec \
  --output ~/Knowledge/Projects/{project-name}/specs/spec.md
```

## Output

Creates `spec.md` with complete project specification following Spec Kit patterns.

## Integration

- Uses Prompting skill for content generation
- Uses VersionControl skill for versioning
- Feeds into ProjectPlanning skill for sharding
