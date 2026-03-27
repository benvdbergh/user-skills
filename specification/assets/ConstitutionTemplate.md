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

## Testing Requirements

{{testingRequirements}}

## Documentation Standards

{{documentationStandards}}

## Enforcement

This constitution is enforced by:
- `pre-project-action.ts` hook - Validates actions against constraints
- `security-validator.ts` hook - Checks tech stack compliance
- StateManagement skill - Tracks architectural decisions

## Notes

{{notes}}
