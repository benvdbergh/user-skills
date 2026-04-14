---
title: Project Constitution
type: constitution
project: {{projectName}}
version: {{version}}
status: active
created: {{date}}
updated: {{date}}
---

# Project Constitution

## Technology Stack

### Allowed Technologies

{{allowedTechnologies}}

### Forbidden Technologies

{{forbiddenTechnologies}}

## Architectural Patterns

{{architecturalPatterns}}

## Code Standards

{{codeStandards}}

## Security Requirements

{{securityRequirements}}

## Performance Constraints

{{performanceConstraints}}

## Reliability and Operability Standards

{{reliabilityAndOperabilityStandards}}

## Testing Requirements

{{testingRequirements}}

## Documentation Standards

{{documentationStandards}}

## Change Control and Exception Process

{{changeControlAndExceptionProcess}}

## Review Cadence and Ownership

{{reviewCadenceAndOwnership}}

## Enforcement

This constitution is enforced by:
- `pre-project-action.ts` hook - Validates actions against constraints
- `security-validator.ts` hook - Checks tech stack compliance
- Specification + architecture workflows - Track decision and guardrail changes

## Notes

{{notes}}
