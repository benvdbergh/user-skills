# GenerateSpec Workflow

Generate a project specification that is measurable, scale-calibrated, and handoff-ready.

## When to Use

- User requests: "generate spec", "create spec", "specify project"
- Starting a new project with spec-first approach
- Need executable specification as single source of truth

## Workflow Steps

1. **Establish Context and Scale**
   - Extract project name, problem statement, user, and desired outcome.
   - Choose scale profile from `references/scale-playbooks.md` (startup/growth/enterprise).
   - Capture explicit constraints, assumptions, and key risks.

2. **Apply Domain Standards**
   - Load `references/domain-standards.md`.
   - Convert vague asks into measurable requirement statements.
   - Ensure NFR categories include thresholds (performance, reliability, security, operability).

3. **Generate Artifact**
   - Use `assets/SpecTemplate.md` as scaffold.
   - Populate with:
     - measurable goals and objectives,
     - scoped functional and non-functional requirements,
     - explicit out-of-scope boundaries,
     - assumptions and unresolved decisions with owners.

4. **Run Quality Gates**
   - Run `ValidateSpec.ts` for structural completeness.
   - Apply Gate 1 (Spec Ready) from `references/quality-gates.md`.
   - If architecture decisions are unresolved and blocking, escalate to `software-architecture`.

5. **Save & Version**
   - Save to `~/Knowledge/Projects/{project-name}/specs/spec.md`
   - Preserve stable section structure for downstream planning and architecture skills
   - Version via repository workflow when requested

## CLI Usage

```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type spec \
  --output ~/Knowledge/Projects/{project-name}/specs/spec.md
```

## Output

Creates `spec.md` with complete project specification and measurable quality baseline.

## Integration

- Feeds `project-planning` with requirement and dependency context
- Escalates complex architecture decisions to `software-architecture`
- Uses `references/skill-escalation.md` for ownership boundaries
