---
skill: banner-design
type: skill-escalation
---

# Skill Escalation — banner-design

## Owns

- Multi-format banner design: social covers, display ads, website heroes, print banners
- HTML/CSS banner layouts with optional AI-generated visual elements
- Platform sizing and safe-zone compliance
- PNG export at exact dimensions
- Multiple art-direction options per request

## Does Not Own

- Logo design or AI logo generation → `design`
- Full brand identity, voice, or style guide → `brand`
- Corporate identity program (CIP) mockups → `design`
- Icon design → `design`
- Social photo sets (multi-platform post grids) → `design`
- UI component implementation (React, shadcn) → `ui-styling`
- UX audits and product-wide style recommendations → `ui-ux-pro-max`
- Design token architecture → `design-system`
- Strategic HTML slide decks → `slides`

## Escalation Paths

| Request | Escalate To |
|---------|-------------|
| Design a logo | `design` |
| Create a CIP / brand mockup | `design` |
| Design an icon set | `design` |
| Brand voice / style guide | `brand` |
| Create social media photo sets / posts | `design` |
| Build a React UI component | `ui-styling` |
| UX audit / style recommendations | `ui-ux-pro-max` |
| Define design tokens / CSS variables | `design-system` |
| Build a pitch deck / presentation | `slides` |

## Dependencies (in-repo)

| Skill | Role |
|-------|------|
| `ui-ux-pro-max` | Palette, typography, product-appropriate style |
| `ui-styling` | HTML/CSS layout and accessible styling patterns |
| `brand` | `scripts/inject-brand-context.cjs` for brand colors/fonts |
| `design` | Umbrella skill; defers banner work here when both match |

## Optional (external install)

| Skill / tool | Role |
|--------------|------|
| `ai-multimodal` | Batch Gemini image generation at 2K/4K |
| `chrome-devtools` or Playwright | Automated screenshot export |
| GenerateImage (agent tool) | Fast backgrounds and hero art without extra skills |

## Relationship to `design`

`design` documents banner design as a built-in subsection. **`banner-design` is the authoritative standalone skill** for banner-only requests. When both match, prefer `banner-design`.
