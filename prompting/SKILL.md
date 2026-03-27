---
name: prompting
description: >-
  Meta-prompting system for dynamic prompt generation using Handlebars
  templates, prompt engineering standards, and reusable primitives.
  USE WHEN meta-prompting, template generation, template rendering,
  prompt optimization, or programmatic prompt composition.
license: MIT
metadata:
  author: PAI
  version: 1.1.0
---

# prompting

Meta-Prompting & Template System

## Overview

Route all prompt engineering tasks through this skill's workflows. Match user intent to the Workflow Routing table and follow the corresponding file.

**This skill provides:**
- **Standards** — Anthropic best practices, Claude 4.x patterns, empirical research
- **Templates** — Handlebars-based system for programmatic prompt generation
- **Scripts** — Template rendering and validation utilities (require Bun runtime)
- **Primitives** — Reusable prompt generation patterns (Roster, Voice, Structure, Briefing, Gate)

## Workflow Routing

| Workflow | Trigger | File | Done When |
|----------|---------|------|-----------|
| **RenderTemplate** | "render template", "generate from template" | `scripts/RenderTemplate.ts` | Rendered output written to file or displayed to user |
| **ValidateTemplate** | "validate template", "check template syntax" | `scripts/ValidateTemplate.ts` | Validation result reported (valid/invalid + details) |
| **ApplyStandards** | "review prompt", "optimize prompt" | `references/standards.md` | Optimized prompt presented with changes explained |

### ApplyStandards Process

When the user asks to review or optimize a prompt:

1. Read the user's prompt or prompt file
2. Read `references/standards.md` for the evaluation criteria
3. Evaluate the prompt against the Claude 4.x Transformations Quick Reference table
4. Check for anti-patterns: verbose explanations, negative-only constraints, aggressive tool language, example overload, misaligned examples
5. Apply transformations: positive framing, imperative voice, soft tool language, signal-to-noise optimization
6. Present the optimized prompt with a brief summary of what changed and why

## Core Components

### Standards (references/standards.md)

Prompt engineering standards based on Anthropic's Claude 4.x best practices, context engineering principles, and empirical research from 1,500+ academic papers.

### Primitives (assets/Primitives/)

Handlebars templates for common prompt generation patterns:

| Primitive | Purpose |
|-----------|---------|
| **Roster.hbs** | Agent/skill definitions from YAML data |
| **Voice.hbs** | Personality and voice calibration settings |
| **Structure.hbs** | Multi-step workflow patterns |
| **Briefing.hbs** | Agent context handoff documents |
| **Gate.hbs** | Validation and quality checklists |

### Scripts (scripts/)

Template rendering and validation tools. Require **Bun** runtime.

```bash
# Render a template with data
bun run scripts/RenderTemplate.ts \
  --template Primitives/Briefing.hbs \
  --data path/to/data.yaml \
  --output path/to/output.md

# Validate template syntax
bun run scripts/ValidateTemplate.ts \
  --template Primitives/Briefing.hbs
```

Project configuration: `scripts/package.json`, `scripts/tsconfig.json`, `scripts/CLAUDE.md` (Bun conventions).

## Examples

**Example 1: Render an agent roster**

```
User: "Generate a roster from my agents.yaml"

Run:
  bun run scripts/RenderTemplate.ts \
    --template Primitives/Roster.hbs \
    --data ./agents.yaml --preview

Output: Markdown document with each agent's display name, role,
personality traits, and perspective, formatted per the Roster template.
```

**Example 2: Optimize a prompt**

```
User: "Review this system prompt for best practices"

Process:
  1. Read the user's prompt
  2. Cross-reference with references/standards.md
  3. Identify: negative framing, aggressive tool language, missing examples
  4. Apply transformations and present optimized version

Output: Revised prompt with changelog of applied improvements.
```

**Example 3: Validate template syntax**

```
User: "Check my Gate template for errors"

Run:
  bun run scripts/ValidateTemplate.ts \
    --template Primitives/Gate.hbs

Output: Validation status (valid/invalid), list of variables used,
helpers referenced, and any syntax errors with line numbers.
```

## Best Practices

1. **Separation of Concerns** — Templates for structure, YAML for content
2. **Keep Templates Simple** — Business logic in TypeScript, not templates
3. **DRY Principle** — Extract repeated patterns into partials
4. **Validate Before Rendering** — Check all required variables exist
