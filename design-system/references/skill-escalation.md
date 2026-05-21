---
skill: design-system
type: skill-escalation
---

# Skill Escalation — design-system

## Owns
- Three-layer token architecture (primitive → semantic → component)
- CSS custom property generation from W3C DTCG JSON
- Component state specifications (hover, active, disabled, focus)
- Tailwind theme configuration and CSS variable integration
- Token compliance validation (detecting hardcoded values in code)
- Slide token validation and slide-strategy/layout/copy BM25 search

## Does Not Own
- Brand color source of truth → escalate to `brand`
- Slide HTML generation and narrative strategy → escalate to `slides`
- shadcn/ui component installation and usage → escalate to `ui-styling`
- UI/UX style recommendations and color palettes → escalate to `ui-ux-pro-max`
- Logo, banner, or social image generation → escalate to `design`

## Escalation Paths
| Request | Escalate To |
|---|---|
| "Update brand colors / typography" | `brand` |
| "Create a pitch deck / slides" | `slides` |
| "Add a shadcn/ui component" | `ui-styling` |
| "What color palette fits my product?" | `ui-ux-pro-max` |
| "Generate a logo / banner" | `design` |

## Dependencies
- `brand` skill: upstream source of primitive color/typography values
- `slides` skill: downstream consumer of `design-tokens.css` and slide search scripts
- Node.js for `generate-tokens.cjs` and `validate-tokens.cjs`
- Python 3.x for `search-slides.py` and `slide-token-validator.py`
