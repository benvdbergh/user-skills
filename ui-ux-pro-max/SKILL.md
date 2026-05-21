---
name: ui-ux-pro-max
description: >-
  UI/UX design intelligence for web and mobile: 50+ styles, 161 color palettes,
  57 font pairings, 99 UX guidelines, 25 chart types, and stack-specific guidance
  (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn, HTML/CSS).
  Use when planning or reviewing UI/UX, choosing style/color/typography, building landing
  pages or dashboards, fixing accessibility or layout, or when the user mentions design
  system, color palette, font pairing, glassmorphism, dark mode, responsive layout, or
  UI best practices. Does not install components or define brand tokens — escalate to
  ui-styling or brand.
license: MIT
metadata:
  author: NextLevelBuilder
  version: "2.1.0"
---

# UI/UX Pro Max — Design Intelligence

Searchable design database and CLI for style, color, typography, UX rules, charts, and stack guidance.

> Run all commands from this skill root (`ui-ux-pro-max/`). Use `python` or `python3` as available on the host.

## When to Apply

**Use when** the task changes how a feature looks, feels, moves, or is interacted with.

**Skip** for pure backend/API work, infrastructure, or non-visual scripts.

## Mandatory Behaviors

Before generating UI code or design decisions:

1. Run `--design-system` first for prioritized style/color/typography recommendations.
2. Check accessibility (contrast 4.5:1, 44×44pt targets, keyboard nav) — see `references/ux-quick-reference.md` §1.
3. Pass `--stack <stack>` when the target implementation stack is known.
4. Run through `references/pre-delivery-checklist.md` before delivering UI code.

## Workflow Routing

| User intent | Action | Reference |
|-------------|--------|-----------|
| New page / product design system | `python scripts/search.py "<query>" --design-system` | — |
| Persist design system across sessions | Add `--persist` and optional `--page` | — |
| Style, color, font, UX, chart lookup | `python scripts/search.py "<query>" --domain <domain>` | Domain table below |
| Framework-specific guidance | `python scripts/search.py "<query>" --stack <stack>` | Stack table below |
| Full UX rule set (§1–§10) | Read reference | `references/ux-quick-reference.md` |
| Pre-delivery QA | Read reference | `references/pre-delivery-checklist.md` |
| Icons, interaction, light/dark layout | Read reference | `references/app-interaction-rules.md` |
| Ownership / handoff to other skills | Read reference | `references/skill-escalation.md` |

## How to Use

| Scenario | Start from |
|----------|------------|
| New project / page | Design system → domain search |
| New component | Domain search (`style`, `ux`) |
| Style / color / font choice | `--design-system` |
| Review existing UI | `references/ux-quick-reference.md` |
| Stack best practices | `--stack <stack>` |

### Step 1: Analyze requirements

Extract product type, audience, style keywords, and target stack.

### Step 2: Design system (do this first)

```bash
python scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

Optional persistence (creates `design-system/MASTER.md` and `design-system/pages/`):

```bash
python scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

Check `design-system/pages/<page>.md` first; fall back to `design-system/MASTER.md`.

### Step 3: Domain search

```bash
python scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

### Step 4: Stack search

```bash
python scripts/search.py "<keyword>" --stack <stack>
```

### Output formats

```bash
python scripts/search.py "fintech crypto" --design-system
python scripts/search.py "fintech crypto" --design-system -f markdown
```

## Prerequisites

```bash
python --version
```

Install Python 3.10+ if missing (platform package manager or python.org).

## Search domains

| Domain | Use for | Example keywords |
|--------|---------|------------------|
| `product` | Product type recommendations | SaaS, e-commerce, healthcare |
| `style` | UI styles, effects | glassmorphism, minimalism, dark mode |
| `typography` | Font pairings | elegant, professional, modern |
| `color` | Palettes by product type | saas, fintech, beauty |
| `landing` | Page structure, CTAs | hero, testimonial, pricing |
| `chart` | Chart types, libraries | trend, funnel, comparison |
| `ux` | Best practices, anti-patterns | accessibility, animation, z-index |
| `google-fonts` | Google Fonts lookup | sans serif, variable font |
| `react` | React/Next.js performance | suspense, memo, bundle |
| `web` | Mobile app interface rules | touch targets, safe areas |
| `icons` | Icon style guidance | — |

Run `python scripts/search.py --help` for the authoritative domain and stack lists.

## Stacks

| Stack | Focus |
|-------|-------|
| `react` | Components, hooks, performance |
| `nextjs` | App router, SSR, caching |
| `vue` | Composition API, Pinia |
| `svelte` | Runes, stores |
| `astro` | Islands, content |
| `swiftui` | Views, navigation |
| `react-native` | Components, lists, navigation |
| `flutter` | Widgets, Material/Cupertino |
| `nuxtjs` | Nuxt 3 patterns |
| `nuxt-ui` | Nuxt UI components |
| `html-tailwind` | Utility-first HTML |
| `shadcn` | shadcn/ui patterns (install via `ui-styling`) |
| `jetpack-compose` | Compose UI |
| `threejs` | 3D scenes |
| `angular` | Components, RxJS |
| `laravel` | Blade, Livewire |

## Rule priorities

Follow priority 1→10 for UX focus areas. Full rules and anti-patterns: `references/ux-quick-reference.md`.

| Priority | Category | Domain |
|----------|----------|--------|
| 1 | Accessibility | `ux` |
| 2 | Touch & interaction | `ux` |
| 3 | Performance | `ux` |
| 4 | Style selection | `style`, `product` |
| 5 | Layout & responsive | `ux` |
| 6 | Typography & color | `typography`, `color` |
| 7 | Animation | `ux` |
| 8 | Forms & feedback | `ux` |
| 9 | Navigation | `ux` |
| 10 | Charts & data | `chart` |

## Data layout

- `data/` — CSV corpora for BM25 search (not loaded into context by default)
- `scripts/search.py` — CLI entrypoint; `scripts/core.py` — search engine

## References

| File | Contains |
|------|----------|
| `references/ux-quick-reference.md` | Full §1–§10 UX rules |
| `references/pre-delivery-checklist.md` | Pre-delivery checklist |
| `references/app-interaction-rules.md` | Icons, interaction, layout |
| `references/skill-escalation.md` | Ownership and escalation paths |

## Examples

```
# Design system for a new SaaS dashboard
python scripts/search.py "B2B analytics SaaS trustworthy" --design-system -p "Acme"

# Style deep-dive
python scripts/search.py "glassmorphism fintech" --domain style -n 5

# React performance patterns
python scripts/search.py "waterfall suspense" --stack react
```

## Query tips

- Combine product + industry + tone: `"entertainment social vibrant content-dense"`
- Run `--design-system` first, then `--domain` for depth
- Re-run with different keywords if style/color choice is unclear

Common fixes: see `references/ux-quick-reference.md` (dark mode §6, animation §7, forms §8, navigation §9, responsive §5, performance §3).
