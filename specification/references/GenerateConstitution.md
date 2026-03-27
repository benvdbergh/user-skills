# GenerateConstitution Workflow

Generate project guardrails and constraints (CONSTITUTION.md).

## When to Use

- User requests: "create constitution", "project guardrails", "tech stack constraints"
- Setting up project constraints
- Preventing tech stack drift

## Workflow Steps

1. **Identify Constraints**
   - Extract tech stack preferences
   - Identify architectural constraints
   - Collect organizational standards

2. **Generate Constitution**
   - Use `assets/ConstitutionTemplate.md` as base
   - Define:
     - Technology Stack (allowed/forbidden)
     - Architectural Patterns
     - Code Standards
     - Security Requirements
     - Performance Constraints

3. **Validate Constitution**
   - Ensure constraints are clear
   - Check for conflicts
   - Verify enforceability

4. **Save & Version**
   - Save to `~/Knowledge/Projects/{project-name}/CONSTITUTION.md`
   - Version controlled
   - Used by hooks for validation

## CLI Usage

```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type constitution \
  --output ~/Knowledge/Projects/{project-name}/CONSTITUTION.md
```

## Output

Creates `CONSTITUTION.md` with project guardrails and constraints.

## Integration

- Used by `pre-project-action.ts` hook for validation
- Used by `security-validator.ts` hook for tech stack checks
- Informs StateManagement for constraint tracking
