---
name: banner-design
description: >-
  Designs banners for social media, ads, website heroes, and print with multiple
  art-direction options and AI-assisted visuals. Use when the user says design
  banner, create banner, generate banner, social cover, header image, display ad,
  website hero, or ad creative. Does not own logo design, full brand guides, or
  video editing.
license: MIT
metadata:
  author: claudekit
  version: "1.2.0"
---

# Banner Design

Multi-format banner workflow: requirements → art direction → HTML/CSS layout → optional AI visuals → PNG export → iteration.

**Scope:** Banner and cover design only. For logos, CIP, icons, or social photo sets, load `references/skill-escalation.md` and escalate.

## When to Use

- Banner, cover, or header design requests
- Social media covers and display ads
- Website hero visuals
- Event or print banner layouts (specs in reference)

## Workflow Routing

| Step | Action | Reference |
|------|--------|-----------|
| Escalation & boundaries | Confirm scope; hand off if out of scope | `references/skill-escalation.md` |
| Sizes & styles | Platform dimensions and 22 art directions | `references/banner-sizes-and-styles.md` |
| Requirements | Purpose, platform, content, brand, style, option count | (this file — Step 1) |
| Design intelligence | Palette, typography, UX patterns | `ui-ux-pro-max` skill |
| HTML/CSS layout | Accessible layout, tokens, responsive rules | `ui-styling` skill |
| Brand context | Colors, fonts, voice from guidelines | `brand` skill |
| Export | Screenshot HTML at exact px dimensions | Browser / Playwright (see Step 4) |

## Integration

- **Escalation:** `references/skill-escalation.md` (owns, does-not-own, handoffs)
- **Overlap:** `design` includes a banner subsection; prefer this skill for dedicated banner requests
- **Skills root:** Resolve paths from the installed skills directory (e.g. `brand/scripts/…`), not hardcoded home paths

## Workflow

### Step 1: Gather Requirements

Collect:

- **Purpose** — social cover, ad, website hero, print, or campaign asset
- **Platform or dimensions** — or custom size
- **Content** — headline, subtext, CTA, logo placement
- **Brand** — activate `brand`; run `node brand/scripts/inject-brand-context.cjs` when guidelines exist
- **Style** — user preference or pick 2–3 directions from `references/banner-sizes-and-styles.md`
- **Options** — default 3 variants

### Step 2: Research & Art Direction

1. Activate `ui-ux-pro-max` for palette, typography, and product-appropriate style.
2. Optionally gather visual references (Pinterest, Dribbble, or in-repo examples).
3. Select 2–3 complementary styles from `references/banner-sizes-and-styles.md`.

### Step 3: Design & Generate Options

For each art direction:

1. **HTML/CSS banner** — use `ui-styling` (layout, contrast, type scale); match exact dimensions from the size reference; keep critical content in the central 70–80% safe zone; max 2 typefaces; one CTA; ≥4.5:1 contrast.
2. **Visual assets** — prefer the **GenerateImage** tool for backgrounds and hero art (no text in the image prompt; overlay text in HTML). If `ai-multimodal` is installed, its batch scripts may be used for higher-resolution or batch runs (see that skill’s docs).
3. **Compose** — overlay headline, CTA, and logo on the visual in HTML/CSS.

### Step 4: Export to PNG

1. Serve HTML locally (e.g. `python -m http.server` or project dev server).
2. Capture at exact platform width × height (browser devtools, Playwright, or an installed screenshot skill).
3. Save under `assets/banners/{campaign}/` with kebab-case names: `{style}-{width}x{height}.png`.

### Step 5: Present & Iterate

Present variants side-by-side with style name, rationale, path, and dimensions. Refine from feedback until approved.

## Design Rules (summary)

- Safe zones, CTA, typography, text ratio, print specs: `references/banner-sizes-and-styles.md`
- Inject brand context via `brand` before finalizing colors and type

## Examples

**Social cover**

> "Design a LinkedIn cover for a B2B SaaS launch, modern minimalist"

→ Platform LinkedIn 1584×396, 3 HTML options, export PNGs

**Display ad**

> "Google Display ad for a fintech app, dark glassmorphism, 300×250"

→ Size from reference, 3 options with generated background + HTML overlay
