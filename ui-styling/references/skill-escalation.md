---
skill: ui-styling
type: skill-escalation
---

# Skill Escalation — ui-styling

## Owns
- shadcn/ui component installation, configuration, and composition patterns
- Tailwind CSS utility-first styling, responsive design, dark mode
- Canvas-based visual design (posters, brand materials, canvas compositions)
- CSS variable theming and shadcn/ui theme customization
- Accessible component patterns (Radix UI primitives)
- Python automation scripts for shadcn component installation and Tailwind config generation

## Does Not Own
- Brand identity, voice, or color source of truth → escalate to `brand`
- Design token architecture (primitive/semantic/component layers) → escalate to `design-system`
- UX guidelines, style recommendations, color palettes → escalate to `ui-ux-pro-max`
- Logo or banner generation → escalate to `design` or `banner-design`
- General front-end architecture decisions → escalate to `software-architecture`

## Escalation Paths
| Request | Escalate To |
|---|---|
| "What UI style fits my product?" | `ui-ux-pro-max` |
| "Set up design tokens / CSS variables" | `design-system` |
| "Update brand colors or typography" | `brand` |
| "Generate a logo / banner" | `design` or `banner-design` |
| "Architecture for a large React app" | `software-architecture` |

## Relationship to Adjacent Skills
- `ui-ux-pro-max`: provides upstream UX guidelines and style recommendations; `ui-styling` implements them in code
- `design-system`: provides token architecture; `ui-styling` implements the resulting Tailwind/CSS configuration
- `design` (ckm:design): routes "UI styling with shadcn/ui + Tailwind" requests to this skill
