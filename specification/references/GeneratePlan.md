# GeneratePlan Workflow

Generate a technical implementation plan from approved specification or PRD artifacts.

## When to Use

- User requests: "technical plan", "implementation plan", "architecture plan"
- After spec or PRD is complete
- Need detailed technical implementation plan

## Workflow Steps

1. **Load and Assess Source**
   - Read existing `spec.md` or `PRD.md`
   - Extract technical requirements, constraints, and risks
   - Identify unresolved architecture decisions and dependency risks

2. **Apply Standards and Scale**
   - Use `references/domain-standards.md` and `references/scale-playbooks.md`.
   - Calibrate plan detail to startup/growth/enterprise scale.
   - Convert risks into mitigation and contingency actions.

3. **Generate Technical Plan**
   - Use `assets/PlanTemplate.md` as scaffold.
   - Include:
     - architecture context and explicit decision status (accepted/pending),
     - phased implementation with dependency ordering,
     - test strategy aligned to acceptance criteria,
     - rollout and rollback strategy.

4. **Validate Plan Readiness**
   - Run `ValidateSpec.ts` for structural completeness.
   - Apply Gate 2 (Build Ready) from `references/quality-gates.md`.
   - Escalate complex or unresolved architecture decisions to `software-architecture`.

5. **Save & Version**
   - Save to `~/Knowledge/Projects/{project-name}/Plan.md`
   - Link to source spec/PRD and unresolved decision register
   - Preserve traceability for `project-planning`

## CLI Usage

```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type plan \
  --source ~/Knowledge/Projects/{project-name}/specs/spec.md \
  --output ~/Knowledge/Projects/{project-name}/Plan.md
```

## Output

Creates `Plan.md` with phased, risk-aware implementation guidance and readiness evidence.

## Integration

- Reads from specification outputs (`spec.md`, `PRD.md`)
- Feeds `project-planning` for epic/story decomposition
- Escalates architecture complexity to `software-architecture`
