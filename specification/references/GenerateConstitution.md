# GenerateConstitution Workflow

Generate project guardrails and constraints (`CONSTITUTION.md`) with enforceable policy intent.

## When to Use

- User requests: "create constitution", "project guardrails", "tech stack constraints"
- Setting up project constraints
- Preventing tech stack drift

## Workflow Steps

1. **Identify Governance Context**
   - Capture scale profile using `references/scale-playbooks.md`.
   - Extract compliance/security/operability requirements.
   - Define who owns exceptions and policy approvals.

2. **Generate Constitution**
   - Use `assets/ConstitutionTemplate.md` as scaffold.
   - Define:
     - Technology Stack (allowed/forbidden)
     - Architectural Patterns
     - Code Standards
     - Security Requirements
     - Performance Constraints
     - Change control and exception process

3. **Validate Governance Quality**
   - Apply `references/domain-standards.md` guardrail expectations.
   - Apply Gate 3 (Release Ready policy intent) from `references/quality-gates.md`.
   - Ensure each guardrail has enforceability mechanism or review workflow.

4. **Save & Version**
   - Save to `~/Knowledge/Projects/{project-name}/CONSTITUTION.md`
   - Preserve explicit policy owner and review cadence fields
   - Version through repository process when requested

## CLI Usage

```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type constitution \
  --output ~/Knowledge/Projects/{project-name}/CONSTITUTION.md
```

## Output

Creates `CONSTITUTION.md` with enforceable project guardrails and exception handling.

## Integration

- Used by `pre-project-action.ts` hook for validation
- Used by `security-validator.ts` hook for tech stack checks
- Informs planning and architecture workflows about non-negotiable constraints
