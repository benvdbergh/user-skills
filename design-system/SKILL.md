---
name: design-system
description: Token architecture, component specifications, and CSS variable generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, Tailwind theme configuration, and slide token validation. Use when user says "create design tokens", "set up CSS variables", "define component specs", "generate a Tailwind config", "build a design system", "implement dark mode tokens", "audit for hardcoded values", or "validate slide tokens".
argument-hint: "[component or token]"
license: MIT
metadata:
  author: claudekit
  version: "1.1.1"
---

# Design System

Token architecture, component specifications, systematic design, slide generation.

## When to Use

- Design token creation
- Component state definitions
- CSS variable systems
- Spacing/typography scales
- Design-to-code handoff
- Tailwind theme configuration
- Slide/presentation token validation and slide-data search

## Skill boundaries

Ownership and escalation: `references/skill-escalation.md`

## Token Architecture

Load: `references/token-architecture.md`

### Three-Layer Structure

```
Primitive (raw values)
       ↓
Semantic (purpose aliases)
       ↓
Component (component-specific)
```

**Example:**
```css
/* Primitive */
--color-blue-600: #2563EB;

/* Semantic */
--color-primary: var(--color-blue-600);

/* Component */
--button-bg: var(--color-primary);
```

## Quick Start

**Generate tokens:**
```bash
node scripts/generate-tokens.cjs --config templates/design-tokens-starter.json -o assets/design-tokens.css
```

**Validate usage:**
```bash
node scripts/validate-tokens.cjs --dir src/
```

Run commands from this skill directory (the folder containing `SKILL.md`).

## Workflow Routing

| User intent | Action | Reference |
|---|---|---|
| Generate tokens from JSON config | Run `node scripts/generate-tokens.cjs` | — |
| Audit project for hardcoded values | Run `node scripts/validate-tokens.cjs` | — |
| Define component states/variants | Output spec tables | `references/component-specs.md` |
| Tailwind theme configuration | Output `tailwind.config.ts` extension | `references/tailwind-integration.md` |
| Understand token architecture | Read reference | `references/token-architecture.md` |
| Validate slide HTML for tokens | Run `python scripts/slide-token-validator.py` | — |
| Search slide strategies/layouts | Run `python scripts/search-slides.py` | — |
| Adjacent brand, slides, or UI work | Read escalation map | `references/skill-escalation.md` |

## References

| Topic | File |
|-------|------|
| Skill boundaries | `references/skill-escalation.md` |
| Token Architecture | `references/token-architecture.md` |
| Primitive Tokens | `references/primitive-tokens.md` |
| Semantic Tokens | `references/semantic-tokens.md` |
| Component Tokens | `references/component-tokens.md` |
| Component Specs | `references/component-specs.md` |
| States & Variants | `references/states-and-variants.md` |
| Tailwind Integration | `references/tailwind-integration.md` |

## Component Spec Pattern

| Property | Default | Hover | Active | Disabled |
|----------|---------|-------|--------|----------|
| Background | primary | primary-dark | primary-darker | muted |
| Text | white | white | white | muted-fg |
| Border | none | none | none | muted-border |
| Shadow | sm | md | none | none |

## Scripts

| Script | Purpose |
|--------|---------|
| `generate-tokens.cjs` | Generate CSS from JSON token config |
| `validate-tokens.cjs` | Check for hardcoded values in code |
| `embed-tokens.cjs` | Inline `assets/design-tokens.css` for standalone HTML |
| `search-slides.py` | BM25 search over slide strategy/layout/copy databases |
| `slide-token-validator.py` | Validate slide HTML for token compliance |
| `html-token-validator.py` | Unified HTML token compliance validator |
| `fetch-background.py` | Fetch images from Pexels/Unsplash |

## Templates & assets

| Path | Purpose |
|------|---------|
| `templates/design-tokens-starter.json` | Starter JSON with three-layer structure |
| `assets/design-tokens.json` | Canonical token source (edit or sync from `brand`) |
| `assets/design-tokens.css` | Generated CSS variables for slides and UI |
| `data/*.csv` | Slide strategy, layout, copy, and chart lookup tables |

Regenerate `assets/design-tokens.css` after changing `assets/design-tokens.json`.

## Integration

**With brand:** Extract primitives from brand colors/typography
**With ui-styling:** Component tokens → Tailwind config

**Skill Dependencies:** brand, ui-styling
**Primary Agents:** ui-ux-designer, frontend-developer

## Slide Integration

Slide and presentation generation is handled by the dedicated `slides` skill.

This skill provides:
- `assets/design-tokens.css` — CSS variables imported by slide templates
- `scripts/slide-token-validator.py` — validates slide HTML for token compliance
- `scripts/search-slides.py` — BM25 search over slide strategy/layout/copy databases

The `slides` skill consumes these as dependencies for its creation workflow.

## Best Practices

1. Reference tokens in components — avoid raw hex in component CSS
2. Semantic layer enables theme switching (light/dark)
3. Component tokens enable per-component customization
4. Use HSL format for opacity control when defining primitives
5. Document every token's purpose
6. Slides import `assets/design-tokens.css` and use `var()` exclusively — see `slides` skill

## Examples

```
User: "Generate CSS variables from our design-tokens.json and audit src/ for hardcoded colors"
→ Run generate-tokens.cjs, then validate-tokens.cjs on the project directory

User: "Define hover and disabled states for our primary button component"
→ Load references/component-specs.md and references/states-and-variants.md; output spec tables

User: "Validate this pitch-deck HTML uses design tokens"
→ Run python scripts/slide-token-validator.py path/to/deck.html
```
