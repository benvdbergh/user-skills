# Slides Creation

Slide and presentation creation is handled by the dedicated `slides` skill.

## Routing

When the user asks to create slides, a pitch deck, or a presentation, route to the `slides` skill:

- The `slides` skill owns: strategy selection, per-slide layout/copy/chart decisions, HTML generation with Chart.js, design token compliance
- This `design` skill provides: brand identity context, design tokens, and visual asset context that `slides` can consume

## Integration

Before invoking `slides` for a brand-critical presentation:
1. Ensure `docs/brand-guidelines.md` exists (use `brand` skill if not)
2. Ensure `assets/design-tokens.css` exists (use `design-system` skill if not)
3. Then invoke `slides` — it will import the tokens and produce on-brand HTML slides

## Quick Reference

For slide creation, use the `slides` skill directly:
```
/slides create "10-slide investor pitch for [ProductName]"
/slides create "5-slide product demo for [audience]"
```
