---
skill: brand
type: skill-escalation
---

# Skill Escalation — brand

## Owns
- Brand voice definition and tone-of-voice framework
- Visual identity standards (logo usage, color palette, typography)
- Messaging framework and tagline development
- Asset organization, naming conventions, and approval workflow
- Brand consistency audit and review
- Syncing brand guidelines to design tokens (`sync-brand-to-tokens.cjs`)

## Does Not Own
- Token architecture and CSS variable generation → escalate to `design-system`
- UI component implementation (React, shadcn/ui) → escalate to `ui-styling`
- Logo AI generation (Gemini) → escalate to `design`
- Banner and social media visual production → escalate to `banner-design`
- UX quality review and style recommendations → escalate to `ui-ux-pro-max`
- Slide / presentation generation → escalate to `slides`

## Escalation Paths
| Request | Escalate To |
|---|---|
| "Generate a logo with AI" | `design` |
| "Create design tokens / CSS variables" | `design-system` |
| "Build a shadcn/ui component" | `ui-styling` |
| "Design a banner / social image" | `banner-design` |
| "Create a presentation / pitch deck" | `slides` |
| "UX audit / style recommendations" | `ui-ux-pro-max` |

## Dependencies
- `design-system` must be installed for `sync-brand-to-tokens.cjs` (it calls design-system's generate-tokens script internally)
- `docs/brand-guidelines.md` must exist in the project; copy `assets/brand-guidelines-starter.md` from this skill to bootstrap it
