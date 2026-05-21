---
name: design
description: >-
  Orchestrates brand, design tokens, UI styling, logo generation (55 styles, Gemini),
  corporate identity (50 deliverables), icons, and social photos. Use when the user
  says design logo, create CIP, generate mockups, brand identity, design system,
  social photos, generate icon, or corporate identity. For presentations use slides;
  for banners use banner-design; for brand voice use brand; for tokens use design-system;
  for shadcn/Tailwind UI use ui-styling.
argument-hint: "[design-type] [context]"
license: MIT
metadata:
  author: claudekit
  version: "2.3.0"
---

# Design

Unified design orchestration: routes to peer skills and runs built-in logo, CIP, icon, and social-photo workflows.

## When to Use

- Logo design and AI generation
- Corporate identity program (CIP) deliverables
- SVG icon sets and AI icon generation
- Social photos (HTML → screenshot, multi-platform)
- End-to-end brand packages (logo → CIP → deck handoff)
- Choosing which design skill to activate

Do **not** use this skill as the primary handler for banner/ad design, slide decks, brand voice docs, token architecture, or React UI implementation — see `references/skill-escalation.md`.

## Mandatory Behaviors

1. Load `references/skill-escalation.md` before routing; honor escalation paths for peer-owned work.
2. Run scripts from this skill directory (paths below are relative to `design/`).
3. On Windows, use `python` if `python3` is unavailable.
4. When scripts fail, attempt to fix them before reporting the error.

## Sub-skill Routing

| Task | Sub-skill | Details |
|------|-----------|---------|
| Brand identity, voice, assets | `brand` | External skill |
| Tokens, specs, CSS vars | `design-system` | External skill |
| shadcn/ui, Tailwind, code | `ui-styling` | External skill |
| Presentations, pitch decks | `slides` | External skill — `references/slides.md` |
| Banners, covers, headers | `banner-design` | External skill |
| Logo creation, AI generation | Logo (built-in) | `references/logo-design.md` |
| CIP mockups, deliverables | CIP (built-in) | `references/cip-design.md` |
| Social media images/photos | Social Photos (built-in) | `references/social-photos-design.md` |
| SVG icons, icon sets | Icon (built-in) | `references/icon-design.md` |

## Workflow Routing

| Workflow | Primary | Reference / action |
|----------|---------|-------------------|
| Route any design request | This skill | `references/design-routing.md` |
| Ownership and handoffs | This skill | `references/skill-escalation.md` |
| Logo brief, search, generate | Built-in | `references/logo-design.md` |
| CIP brief, search, mockups | Built-in | `references/cip-design.md` |
| Icon generate (SVG) | Built-in | `references/icon-design.md` |
| Social photo pipeline | Built-in | `references/social-photos-design.md` |
| Presentation / pitch deck | `slides` | Activate `slides` skill |
| Banner / ad / cover | `banner-design` | Activate `banner-design` skill |
| Brand voice / style guide | `brand` | Activate `brand` skill |
| Design tokens / CSS vars | `design-system` | Activate `design-system` skill |
| React UI / shadcn | `ui-styling` | Activate `ui-styling` skill |
| UX palette / style review | `ui-ux-pro-max` | Activate `ui-ux-pro-max` skill |

## Logo Design (Built-in)

55+ styles, 30 color palettes, 25 industry guides. Gemini Nano Banana models.

### Logo: Generate Design Brief

```bash
python scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"
```

### Logo: Search Styles/Colors/Industries

```bash
python scripts/logo/search.py "minimalist clean" --domain style
python scripts/logo/search.py "tech professional" --domain color
python scripts/logo/search.py "healthcare medical" --domain industry
```

### Logo: Generate with AI

Generate all output logo images with a white background.

```bash
python scripts/logo/generate.py --brand "TechFlow" --style minimalist --industry tech
python scripts/logo/generate.py --prompt "coffee shop vintage badge" --style vintage
```

After generation, ask the user about an HTML preview via `AskUserQuestion`. If yes, activate `ui-ux-pro-max` for a gallery layout.

## CIP Design (Built-in)

50+ deliverables, 20 styles, 20 industries. Gemini Nano Banana (Flash/Pro).

### CIP: Generate Brief

```bash
python scripts/cip/search.py "tech startup" --cip-brief -b "BrandName"
```

### CIP: Search Domains

```bash
python scripts/cip/search.py "business card letterhead" --domain deliverable
python scripts/cip/search.py "luxury premium elegant" --domain style
python scripts/cip/search.py "hospitality hotel" --domain industry
python scripts/cip/search.py "office reception" --domain mockup
```

### CIP: Generate Mockups

```bash
# With logo (RECOMMENDED)
python scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --deliverable "business card" --industry "consulting"

# Full CIP set
python scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --industry "consulting" --set

# Pro model (4K text)
python scripts/cip/generate.py --brand "TopGroup" --logo logo.png --deliverable "business card" --model pro

# Without logo
python scripts/cip/generate.py --brand "TechFlow" --deliverable "business card" --no-logo-prompt
```

Models: `flash` (default, `gemini-2.5-flash-image`), `pro` (`gemini-3-pro-image-preview`)

### CIP: Render HTML Presentation

```bash
python scripts/cip/render-html.py --brand "TopGroup" --industry "consulting" --images /path/to/cip-output
```

**Tip:** If no logo exists, run Logo Design above first.

## Slides (Escalate)

Presentation and pitch-deck work is owned by the `slides` skill. See `references/slides.md` for routing. Do not duplicate the slides workflow here.

## Banner Design (Escalate)

Banner, cover, and display-ad work is owned by the `banner-design` skill. Do not duplicate banner workflows here.

## Icon Design (Built-in)

15 styles, 12 categories. Gemini 3.1 Pro Preview generates SVG text output.

### Icon: Generate Single Icon

```bash
python scripts/icon/generate.py --prompt "settings gear" --style outlined
python scripts/icon/generate.py --prompt "shopping cart" --style filled --color "#6366F1"
python scripts/icon/generate.py --name "dashboard" --category navigation --style duotone
```

### Icon: Generate Batch Variations

```bash
python scripts/icon/generate.py --prompt "cloud upload" --batch 4 --output-dir ./icons
```

### Icon: Multi-size Export

```bash
python scripts/icon/generate.py --prompt "user profile" --sizes "16,24,32,48" --output-dir ./icons
```

**Model:** `gemini-3.1-pro-preview` — text-only output (SVG is XML text).

Load `references/icon-design.md` for styles and categories.

## Social Photos (Built-in)

Multi-platform social image design: HTML/CSS → screenshot export. Uses `ui-ux-pro-max`, `brand`, `design-system`, and browser screenshot tooling.

Load `references/social-photos-design.md` for sizes, templates, and the full workflow.

## Workflows

### Complete Brand Package

1. **Logo** → `scripts/logo/generate.py` → Generate logo variants
2. **CIP** → `scripts/cip/generate.py --logo ...` → Create deliverable mockups
3. **Presentation** → Activate `slides` skill for the pitch deck

### New Design System

1. **Brand** (`brand` skill) → Define colors, typography, voice
2. **Tokens** (`design-system` skill) → Create semantic token layers
3. **Implement** (`ui-styling` skill) → Configure Tailwind, shadcn/ui

## Examples

```
/design logo for a fintech startup named Ledgerly, minimalist geometric style
/design CIP business card and letterhead for TopGroup consulting with logo at ./logo.png
/design generate icon set: settings, user, dashboard — outlined style, #6366F1
/design social photos for Instagram post and story — product launch, brand colors from brand skill
```

Escalation examples (activate peer skill, do not run built-in banner/slides flows here):

```
User: design a LinkedIn cover banner → activate banner-design
User: build a 10-slide investor pitch deck → activate slides
```

## References

| Topic | File |
|-------|------|
| Skill boundaries | `references/skill-escalation.md` |
| Design Routing | `references/design-routing.md` |
| Logo Design Guide | `references/logo-design.md` |
| Logo Styles | `references/logo-style-guide.md` |
| Logo Colors | `references/logo-color-psychology.md` |
| Logo Prompts | `references/logo-prompt-engineering.md` |
| CIP Design Guide | `references/cip-design.md` |
| CIP Deliverables | `references/cip-deliverable-guide.md` |
| CIP Styles | `references/cip-style-guide.md` |
| CIP Prompts | `references/cip-prompt-engineering.md` |
| Slides routing | `references/slides.md` |
| Social Photos Guide | `references/social-photos-design.md` |
| Icon Design Guide | `references/icon-design.md` |

Legacy slide/banner reference copies remain under `references/slides-*.md` and `references/banner-sizes-and-styles.md` for migration only; prefer `slides` and `banner-design` skills.

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/logo/search.py` | Search logo styles, colors, industries |
| `scripts/logo/generate.py` | Generate logos with Gemini AI |
| `scripts/logo/core.py` | BM25 search engine for logo data |
| `scripts/cip/search.py` | Search CIP deliverables, styles, industries |
| `scripts/cip/generate.py` | Generate CIP mockups with Gemini |
| `scripts/cip/render-html.py` | Render HTML presentation from CIP mockups |
| `scripts/cip/core.py` | BM25 search engine for CIP data |
| `scripts/icon/generate.py` | Generate SVG icons with Gemini 3.1 Pro |

## Setup

```bash
export GEMINI_API_KEY="your-key"  # https://aistudio.google.com/apikey
pip install google-genai pillow
```

## Integration

**External sub-skills:** `brand`, `design-system`, `ui-styling`, `slides`, `banner-design`, `ui-ux-pro-max`
**Related skills:** `frontend-design`, `ai-multimodal`, `chrome-devtools`
