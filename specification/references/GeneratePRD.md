# GeneratePRD Workflow

Generate a Product Requirements Document with clear outcomes, testable requirements, and delivery guardrails.

## When to Use

- User requests: "create PRD", "product requirements", "generate PRD"
- Planning phase of project
- Need structured product requirements document

## Workflow Steps

1. **Capture Product Intent and Scale**
   - Identify product vision, business objective, and target users.
   - Select scale profile from `references/scale-playbooks.md`.
   - Define measurable success outcomes before feature detail.

2. **Apply Domain Standards**
   - Use `references/domain-standards.md` to enforce measurable requirements.
   - Ensure each user story has acceptance criteria.
   - Ensure NFRs have explicit thresholds and ownership.

3. **Generate PRD**
   - Use `assets/PRDTemplate.md` as scaffold.
   - Fill:
     - problem statement and opportunity,
     - user stories and functional requirements,
     - non-functional requirements with measurable thresholds,
     - success metrics and rollout assumptions.

4. **Validate and Gate**
   - Run `ValidateSpec.ts` for completeness checks.
   - Apply Gate 1 (Spec Ready) and relevant Gate 2 checks from `references/quality-gates.md`.
   - Escalate unresolved architecture or UX design concerns per `references/skill-escalation.md`.

5. **Save & Version**
   - Save to `~/Knowledge/Projects/{project-name}/PRD.md`
   - Preserve stable sections for `project-planning` handoff

## CLI Usage

```bash
bun run $PAI_DIR/skills/specification/scripts/Specify.ts \
  --project <project-name> \
  --type prd \
  --output ~/Knowledge/Projects/{project-name}/PRD.md
```

## Output

Creates `PRD.md` with measurable product requirements and delivery-ready guardrails.

## Integration

- Feeds `project-planning` for decomposition into epics/stories
- Links architecture-sensitive decisions to `software-architecture`
- Links UX-sensitive decisions to `ux-designer`
