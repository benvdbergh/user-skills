---
skill: slides
type: skill-escalation
---

# Skill Escalation — slides

## Owns
- HTML presentation generation from a strategy + audience prompt
- Slide-by-slide layout, copywriting formula, and chart-type selection
- Chart.js integration and navigation scaffolding
- CSS design token compliance in slide output

## Does Not Own
- Design token architecture or CSS variable definitions → escalate to `design-system`
- Brand identity, colors, typography source of truth → escalate to `brand`
- Banner or social media image creation → escalate to `banner-design`
- UI component implementation (React, shadcn) → escalate to `ui-styling`
- UX guidelines and style recommendations → escalate to `ui-ux-pro-max`

## Escalation Paths
| Request | Escalate To |
|---|---|
| "Define design tokens / CSS variables" | `design-system` |
| "Update brand colors or typography" | `brand` |
| "Create a banner / social image" | `banner-design` |
| "Build a React UI component" | `ui-styling` |
| "What UI style fits my product?" | `ui-ux-pro-max` |

## Composition Rules

1. Run this skill for HTML deck delivery; escalate token definition to `design-system` and brand source of truth to `brand`.
2. Use `design-system` scripts when present; otherwise select strategy, layout, and copy from `references/*.md` tables.
3. Do not route banner, social image, or React component work here — use the escalation table above.

## Dependencies

- `design-system` — optional BM25 search (`search-slides.py`) and token validation (`slide-token-validator.py`) under `.claude/skills/design-system/scripts/`
- `brand` — optional `docs/brand-guidelines.md` and token sync before brand-critical decks
