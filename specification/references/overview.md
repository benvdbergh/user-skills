# Specification Skill — Overview

Specification-driven development skill for generating and managing project specifications, PRDs, technical plans, and constitutions with measurable standards and scale-aware rigor.

## Quick Start

```bash
# Generate a project specification
bun run $PAI_DIR/skills/specification/scripts/Specify.ts --project my-app --type spec

# Create a PRD
bun run $PAI_DIR/skills/specification/scripts/Specify.ts --project my-app --type prd

# Validate a specification
bun run $PAI_DIR/skills/specification/scripts/ValidateSpec.ts --spec ~/Knowledge/Projects/my-app/specs/spec.md

# Update a specification
bun run $PAI_DIR/skills/specification/scripts/UpdateSpec.ts --spec ~/Knowledge/Projects/my-app/specs/spec.md --update "Added authentication requirements"
```

## Validation

The `ValidateSpec.ts` tool checks specification completeness by:
- Verifying all required sections are present (based on document type)
- Checking for unfilled placeholders (TODO comments, template variables)
- Validating section content (ensures sections have substantial content)

**Validation Behavior:**
- Only validates top-level sections (`##` headers), not nested subsections (`###`, `####`)
- Sections with nested subsections are correctly recognized as having content
- Returns exit code 0 if valid, 1 if errors found

## Integration

- Applies domain standards from `references/domain-standards.md`
- Applies scale profiles from `references/scale-playbooks.md`
- Applies readiness checks from `references/quality-gates.md`
- Feeds `project-planning` and escalates architecture complexity to `software-architecture`
