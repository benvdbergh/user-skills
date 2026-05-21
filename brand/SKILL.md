---
name: brand
description: Provides brand voice, visual identity, messaging frameworks, asset management, and brand consistency. Use when the user says "brand guidelines", "brand voice", "update brand colors", "style guide", "brand consistency", "brand compliance", or "tone of voice".
argument-hint: "[update|review|create] [args]"
metadata:
  author: claudekit
  version: "1.2.0"
---

# Brand

Brand identity, voice, messaging, asset management, and consistency frameworks.

## When to Use

- Brand voice definition and content tone guidance
- Visual identity standards and style guide development
- Messaging framework creation
- Brand consistency review and audit
- Asset organization, naming, and approval
- Color palette management and typography specs

## Mandatory Behaviors

Before any brand work:
1. Check if `docs/brand-guidelines.md` exists in the project. If absent, copy `assets/brand-guidelines-starter.md` to create it first.
2. Run `bun scripts/inject-brand-context.cjs --json` from the project root (or pass the guidelines path) to load current brand state before generating branded content.
3. After updating any brand element, run `bun scripts/sync-brand-to-tokens.cjs` to keep design tokens in sync.
4. For any new asset, run `bun scripts/validate-asset.cjs <path>` before delivering to the user.
5. Read `references/skill-escalation.md` when the request may belong to another skill (logo generation, UI components, banners, slides).

## Quick Start

**Inject brand context into prompts:**
```bash
bun scripts/inject-brand-context.cjs
bun scripts/inject-brand-context.cjs --json
```

**Validate an asset:**
```bash
bun scripts/validate-asset.cjs <asset-path>
```

**Extract/compare colors:**
```bash
bun scripts/extract-colors.cjs --palette
bun scripts/extract-colors.cjs <image-path>
```

## Brand Sync Workflow

```bash
# 1. Edit docs/brand-guidelines.md (or use /brand update)
# 2. Sync to design tokens
bun scripts/sync-brand-to-tokens.cjs
# 3. Verify
bun scripts/inject-brand-context.cjs --json
```

**Files synced:**
- `docs/brand-guidelines.md` → Source of truth
- `assets/design-tokens.json` → Token definitions
- `assets/design-tokens.css` → CSS variables

## Workflow Routing

| Intent / trigger | Action | Reference |
|------------------|--------|-----------|
| `update` subcommand or "update brand colors" | Run update workflow and sync tokens | `references/update.md` |
| Voice, tone, personality | Apply voice framework | `references/voice-framework.md` |
| Logo, colors, typography, visual rules | Apply visual identity | `references/visual-identity.md` |
| Taglines, messaging hierarchy | Apply messaging framework | `references/messaging-framework.md` |
| Brand audit, drift check | Run consistency checklist | `references/consistency-checklist.md` |
| New brand doc structure | Use guideline template | `references/brand-guideline-template.md` |
| Asset folders, naming | Follow asset organization | `references/asset-organization.md` |
| Palette changes | Follow color management | `references/color-palette-management.md` |
| Type scale and fonts | Follow typography specs | `references/typography-specifications.md` |
| Logo placement and misuse | Follow logo usage rules | `references/logo-usage-rules.md` |
| Sign-off before publish | Run approval checklist | `references/approval-checklist.md` |
| Adjacent skills (design-system, banners, slides) | Escalate per boundaries | `references/skill-escalation.md` |

**Routing steps:**
1. Parse subcommand from `$ARGUMENTS` (first word), if present.
2. If subcommand is `update`, load `references/update.md` and execute with remaining arguments.
3. Otherwise match user intent to the table and load the corresponding `references/*.md`.
4. Run mandatory scripts when guidelines or assets change.

## References

| Topic | File |
|-------|------|
| Skill boundaries | `references/skill-escalation.md` |
| Voice Framework | `references/voice-framework.md` |
| Visual Identity | `references/visual-identity.md` |
| Messaging | `references/messaging-framework.md` |
| Consistency | `references/consistency-checklist.md` |
| Guidelines Template | `references/brand-guideline-template.md` |
| Asset Organization | `references/asset-organization.md` |
| Color Management | `references/color-palette-management.md` |
| Typography | `references/typography-specifications.md` |
| Logo Usage | `references/logo-usage-rules.md` |
| Approval Checklist | `references/approval-checklist.md` |
| Brand update workflow | `references/update.md` |

## Scripts

Run from the **project root** (where `docs/brand-guidelines.md` lives). Each script supports `--help`.

| Script | Purpose |
|--------|---------|
| `scripts/inject-brand-context.cjs` | Extract brand context for prompt injection |
| `scripts/sync-brand-to-tokens.cjs` | Sync brand-guidelines.md → design-tokens.json/css |
| `scripts/validate-asset.cjs` | Validate asset naming, size, format |
| `scripts/extract-colors.cjs` | Extract and compare colors against palette |

## Assets

| Asset | Purpose |
|-------|---------|
| `assets/brand-guidelines-starter.md` | Starter template for new brands |

## Examples

**Bootstrap brand guidelines**
```
User: "Set up brand guidelines for our startup"
→ Copy assets/brand-guidelines-starter.md to docs/brand-guidelines.md, customize, then run bun scripts/inject-brand-context.cjs --json
```

**Update colors and sync tokens**
```
User: "/brand update — primary #2563EB, accent emerald"
→ Load references/update.md, edit docs/brand-guidelines.md, run bun scripts/sync-brand-to-tokens.cjs
```

**Validate a marketing asset**
```
User: "Check this banner before we publish"
→ bun scripts/validate-asset.cjs assets/banners/campaign_hero_20260521.png
```
