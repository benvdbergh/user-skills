# Skill Escalation — design

Related: `../SKILL.md`

## Ownership

- **Owns**
  - Logo design: AI generation (55+ styles, Gemini), search, brief generation
  - Corporate Identity Program (CIP): 50+ deliverables, mockup generation
  - Icon design: SVG icons, 15 styles, AI generation
  - Social photo sets: multi-platform HTML→screenshot pipeline
  - Routing and orchestration of design requests to the correct skill
- **Does not own**
  - Banner and display ad design → `banner-design`
  - Slide / presentation creation → `slides`
  - Brand voice, tone, and style guide management → `brand`
  - Design token architecture and CSS variable generation → `design-system`
  - shadcn/ui + Tailwind UI implementation → `ui-styling`
  - UX guidelines and design quality review → `ui-ux-pro-max`

## Escalation Map

| Concern | Primary here? | Escalate to | Escalation trigger |
|---------|---------------|-------------|-------------------|
| Logo / CIP / icon / social photos | Yes | — | User asks for these deliverables |
| Banner / ad / cover / hero creative | No | `banner-design` | "banner", "cover", "header", "display ad", platform-specific ad sizes |
| Presentation / pitch deck / slides | No | `slides` | "slides", "deck", "pitch", "presentation", Chart.js HTML deck |
| Brand voice / messaging / style guide | No | `brand` | "brand voice", "tone", "style guide", "brand guidelines" |
| Design tokens / CSS variables | No | `design-system` | "design tokens", "CSS variables", "token architecture" |
| React UI / shadcn components | No | `ui-styling` | "shadcn", "Tailwind", "implement UI", component code |
| UX audit / palette / style pick | No | `ui-ux-pro-max` | "UX review", "color palette", "which style fits" |

## Composition Rules

1. Load this file before routing; built-in scripts apply only to logo, CIP, icon, and social photos.
2. When a request matches a peer skill in the map, activate that skill instead of duplicating its workflow in `design`.
3. For full brand packages, run built-in logo and CIP here, then hand off decks to `slides`.
4. Call `brand` upstream when brand context is required for on-brand generation.

## Dependencies

- `GEMINI_API_KEY` for AI generation (logo, CIP, icon)
- Python: `google-genai`, `pillow` (see Setup in `SKILL.md`)
- Peer skills: `ui-ux-pro-max` (galleries/research), `brand` (context), `chrome-devtools` or browser MCP (social photo export)

## Notes for Relationship Analysis

- Overlaps `banner-design` and `slides` on presentation/marketing visuals; `design` orchestrates and defers execution.
- Shares Gemini image tooling patterns with other claudekit design skills; CSV data lives in `data/` (logo, CIP).
