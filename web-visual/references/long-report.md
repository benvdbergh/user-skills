# Long-Report Workflow

Use when source material is a **lengthy report** (typically 12+ sections, 8k+ words, or deep-research output with citation appendix). Goal: navigable, readable HTML—not a wall of text or an unmaintainable single prompt dump.

## When to Activate

Any of:

- Markdown/research file **> 50 KB** or **> 12** `##` sections
- User says: long report, research dossier, deep-research output, comprehensive analysis
- `deep-research` report with executive summary + multiple confidence-rated sections

Route: **blueprint (required)** → **compose (batched)** → **audit**.

## Industry Patterns (Grounding)

| Pattern | Source | Application in web-visual |
|---------|--------|---------------------------|
| Analyzer, not converter | [md2html](https://github.com/haidang1810/md2html) | Map prose patterns to components (flow → diagram, trade-offs → comparison-grid) |
| DocSpec / knowledge units | [ViviDoc](https://arxiv.org/html/2603.27991v1) | Blueprint lists units: text + proposed interaction |
| Generative UI + post-processors | [Google Generative UI](https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/) | Compose + audit as fix-up pass |
| Sticky TOC + scroll spy | [CSS-Tricks](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/), [scroll-target-group](https://una.im/scroll-target-group/) | Sidebar nav; CSS-first spy, IO fallback |
| `content-visibility: auto` | [Virtualization guide](https://sujeet.pro/articles/virtualization-and-windowing) | Default perf for long static pages; preserves Find-in-Page |
| Section batching | Agent skill practice | Generate HTML in logical batches to stay within context |

## Phase A: Report Spec (Blueprint Extension)

Produce a **Report Spec** inside the blueprint (not code):

```markdown
## Report Spec
- **Audience paths**: executive (5 min) | practitioner (full) | appendix-only
- **Reading time**: ~{N} min (250 wpm on narrative only)
- **Above the fold**: hero + 3–6 metric-cards + key finding callout
- **Knowledge units**: (see table)
| Section ID | Title | Component | Disclosure |
|------------|-------|-----------|------------|
| exec | Executive Summary | hero-section + narrative | visible |
| s3 | Methodology | narrative-section | visible |
| app-a | Raw tables | accordion | collapsed |
```

Rules:

- Every `##` in source maps to exactly one knowledge unit.
- At most **30%** of units use `data-chart` or `relationship-map` (avoid chart fatigue).
- Appendices, methodology detail, and citation lists → `accordion` or `tabbed-content`.

## Phase B: Page Chrome (Required for Long Reports)

**Shell:** Start compose from `assets/long-report-shell.html` (TOC, mobile drawer, reading progress, scroll spy, `content-visibility`). Do not rebuild chrome from scratch unless the blueprint documents a deliberate deviation.


### Navigation

- **Desktop**: sticky `<aside>` TOC (section links), `main` content column ~70ch max for prose.
- **Mobile**: TOC drawer (button, backdrop, ESC closes), skip link to `#main`.
- **Scroll spy**: prefer `@supports (scroll-target-group: auto)` on TOC container; fallback `IntersectionObserver` on `section[id]` (see `compose.md`).
- **Reading progress**: thin top bar bound to `scroll` (optional, respect `prefers-reduced-motion`).

### Executive layer

Before first major section:

1. `hero-section` with title, date, confidence badge if from deep-research
2. `metric-cards` for top quantitative claims (max 6)
3. One `pullquote` or highlight box for strategic recommendation

### Progressive disclosure

- Comparisons and option trade-offs → `comparison-grid` or pros/cons two-column box
- Step sequences → numbered step cards or `flow-diagram`
- Long prose blocks (> 6 paragraphs) → split with subheadings; never single unbroken column > 120 lines
- Citations → `citation-appendix` (see component-map); inline `[n]` anchors jump to appendix

## Phase C: Batched Compose

Do **not** generate the full DOM in one shot when Report Spec has **> 10** units.

1. **Shell batch**: `<!DOCTYPE>`, tokens, nav skeleton, hero, footer, shared JS (theme, scroll spy, progress).
2. **Content batches**: 3–5 knowledge units per batch; append to `<main>` in document order.
3. **Finalize batch**: citation appendix, print CSS, audit checklist.

After each batch, verify heading `id` uniqueness and TOC link targets.

## Phase D: Performance & Accessibility

```css
/* Default for long reports — prefer over list virtualization */
section[id] {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

- Use virtualization **only** if user explicitly needs 2MB+ single-page HTML and accepts Find-in-Page limits; document the trade-off in blueprint.
- Tables wider than viewport: `overflow-x: auto` wrapper, not page-scale shrink.
- Charts: lazy-init with `IntersectionObserver` (create chart when section enters viewport).
- Mermaid (optional): load CDN only if blueprint lists ≥1 diagram; max 5 diagrams per report.

## Phase E: Quality Gates (Long-Report)

Extend compose audit:

- [ ] TOC covers all `section[id]` entries
- [ ] Executive path readable without scrolling past hero + metrics on 1440×900
- [ ] No section exceeds ~400 lines of HTML without disclosure split
- [ ] Every quantitative claim in metric-cards/charts appears in source
- [ ] Citation appendix matches inline `[n]` references (deep-research)
- [ ] `content-visibility` present; no runaway chart init on load

## Anti-Patterns

- Mirroring markdown 1:1 as `<p>` stacks with no component promotion
- One giant Chart.js dashboard for the whole report
- Omitting mobile TOC for "documentation-style" pages
- Embedding user data in inline `<script>` without escaping (XSS)
