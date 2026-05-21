---
skill: ui-ux-pro-max
type: skill-escalation
---

# Skill Escalation — ui-ux-pro-max

## Owns

- UI/UX style selection and design system generation (50+ styles, 161 color palettes, 57 font pairings)
- Accessibility auditing and UX rule enforcement (99 guidelines)
- Multi-stack implementation guidance (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, shadcn/ui, Tailwind, HTML/CSS)
- Design system persistence (MASTER.md + page overrides pattern)
- Chart type recommendations and data visualization guidance

## Does Not Own

- Brand identity and voice → escalate to `brand`
- Design token architecture (CSS variables, DTCG JSON) → escalate to `design-system`
- shadcn/ui component installation and code scaffolding → escalate to `ui-styling`
- Logo, banner, CIP, or social image generation → escalate to `design` or `banner-design`
- Slide / presentation generation → escalate to `slides`
- General front-end architecture → escalate to `software-architecture`

## Escalation Paths

| Request | Escalate To |
|---|---|
| "Update brand colors / tone of voice" | `brand` |
| "Create design tokens / CSS variables" | `design-system` |
| "Install and configure shadcn/ui" | `ui-styling` |
| "Generate a logo / banner / CIP" | `design` |
| "Create a pitch deck / slides" | `slides` |
| "App architecture / tech stack decisions" | `software-architecture` |

## Upstream Consumers

- `ux-designer` skill uses this skill as an upstream dependency for UX data and recommendations
- `design` skill invokes this for HTML gallery generation after logo/social photo creation

## Script CLI Contract

```bash
python scripts/search.py --help
```

Run from the `ui-ux-pro-max/` skill root. Returns usage, domains, stacks, and flags.
