---
name: slides
description: >-
  Creates strategic HTML presentations with Chart.js, design tokens, responsive
  layouts, copywriting formulas, and contextual slide strategies. Use when user
  says "create slides", "build a pitch deck", "make a presentation", "investor
  pitch", "sales deck", or "HTML presentation".
license: MIT
metadata:
  author: claudekit
  version: "1.2.0"
---

# Slides

Strategic HTML presentation design with data visualization, design-token compliance, and Chart.js.

**Arguments:** $ARGUMENTS

## When to Use

- Marketing presentations and pitch decks
- Data-driven slides with Chart.js
- Strategic slide design with layout patterns
- Copywriting-optimized presentation content

## Mandatory Behaviors

1. Before brand-critical decks, confirm `docs/brand-guidelines.md` and `assets/design-tokens.css` exist; escalate to `brand` or `design-system` if missing (see `references/skill-escalation.md`).
2. For `create`, load `references/create.md` and follow its six-step workflow end to end.
3. Output a slide plan table before generating HTML.
4. Use CSS variables from design tokens only — no hardcoded hex or font stacks in deliverables.
5. When `design-system` is installed, use its slide search and token validator scripts; otherwise use the reference tables in this skill.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **create** | "create slides", "pitch deck", "presentation", "investor pitch", "sales deck", "HTML presentation" | `references/create.md` |
| **SkillEscalation** | scope boundary, delegation, adjacent design/token/brand work | `references/skill-escalation.md` |

Parse the first token of `$ARGUMENTS` as the subcommand (default `create` when omitted). Load the matching reference file, then execute with remaining arguments.

## References

| Topic | File |
|-------|------|
| Creation workflow | `references/create.md` |
| Layout patterns | `references/layout-patterns.md` |
| HTML template | `references/html-template.md` |
| Copywriting formulas | `references/copywriting-formulas.md` |
| Slide strategies | `references/slide-strategies.md` |
| Skill boundaries | `references/skill-escalation.md` |

Boundary and delegation rules: `references/skill-escalation.md` (owns / does not own / escalation map).

## Examples

**Example 1: Investor pitch**

```
User: /slides create "10-slide YC seed deck for a B2B SaaS product"
Actions:
1. Load references/create.md
2. Select strategy from references/slide-strategies.md (or design-system search)
3. Plan slides, generate token-compliant HTML, validate if design-system available
Result: Single navigable .html deck with keyboard navigation and progress bar
```

**Example 2: Short sales demo**

```
User: /slides create "5-slide product demo for enterprise buyers"
Actions:
1. Match Sales Pitch or Product Demo strategy
2. Plan layout and copy formula per slide
3. Deliver HTML using references/html-template.md
Result: Five-slide HTML presentation ready to open in a browser
```
