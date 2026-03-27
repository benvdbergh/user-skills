---
name: web-visual
description: >-
  Transform text content, research reports, and structured data into polished,
  interactive single-file HTML5 visualizations. USE WHEN generate HTML page,
  create visualization, interactive report, web visual, visual report, data
  dashboard, content to HTML, generative UI, interactive page, visual summary,
  HTML export, web presentation, data visualization.
license: MIT
metadata:
  author: PAI
  version: 1.0.0
---

# web-visual

Generative UI skill that transforms textual content into polished, self-contained HTML5 + CSS3 + JavaScript visualizations. Inspired by the Gemini Generative UI pipeline: the agent stops acting like a writer and starts acting like a full-stack developer and UI designer.

## Core Pipeline

Every visualization follows a four-stage transformation:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  INGEST     │ →  │  DESIGN     │ →  │  CODE       │ →  │  CRITIQUE   │
│             │    │             │    │             │    │             │
│ Parse       │    │ Select UI   │    │ Generate    │    │ Validate    │
│ structure,  │    │ metaphors,  │    │ HTML/CSS/JS │    │ a11y, perf, │
│ verbalize   │    │ map intent  │    │ single-file │    │ responsive  │
│ data trends │    │ to layout   │    │ output      │    │ layout      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Stage 1: Structural Analysis & Verbalization (Ingest)

- Parse content hierarchy: headers, sections, data points, conclusions
- Identify data types: quantitative, categorical, temporal, relational, geographic
- **Verbalize** complex data: annotate trends, comparisons, and key takeaways
  so the design stage understands what to highlight
- Build an internal "content graph" of entities and their relationships

### Stage 2: Intent-to-Interface Mapping (Design)

Select visual components based on content semantics, not generic templates:

| Content Pattern | Visual Metaphor | Component |
|----------------|-----------------|-----------|
| Comparison data | Side-by-side cards, filterable table | `comparison-grid` |
| Process / workflow | Interactive flowchart, stepper | `flow-diagram` |
| Timeline / history | Horizontal timeline, scroll-reveal | `timeline` |
| Hierarchical data | Tree diagram, nested accordions | `hierarchy-tree` |
| Quantitative data | Bar/line/pie charts | `data-chart` |
| Key metrics | KPI cards with sparklines | `metric-cards` |
| Narrative text | Typography-first sections, pull quotes | `narrative-section` |
| Relationships | Network graph, connection diagram | `relationship-map` |
| Geographic data | Styled map with markers | `geo-visual` |

Full mapping reference: `references/component-map.md`

### Stage 3: Code Generation (Code)

Generate a **single self-contained HTML file** with:

- **HTML5** semantic markup (`<article>`, `<section>`, `<nav>`, `<figure>`)
- **CSS3** using custom properties, Grid/Flexbox, `@media` queries for responsive design
- **JavaScript** for animations, interactivity, and data-driven rendering
- **No external dependencies by default** — inline everything for portability
- When charts are needed: embed Chart.js or D3.js via CDN `<script>` tag
- Design tokens from `assets/design-tokens.md` for consistent styling

### Stage 4: Refinement & Self-Critique (Critique)

Automated quality pass before delivering output:

- Accessibility: semantic HTML, ARIA labels, color contrast, keyboard navigation
- Responsiveness: test layout at 320px, 768px, 1024px, 1440px breakpoints
- Performance: minimize DOM nodes, defer non-critical JS, optimize animations
- Code quality: no console errors, clean structure, commented non-obvious logic
- Visual polish: consistent spacing, typography scale, color harmony

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **blueprint** | "analyze content for visualization", "what visuals would work", "design plan", "visual blueprint" | `references/blueprint.md` |
| **compose** | "create visualization", "generate HTML", "build interactive page", "visualize this" | `references/compose.md` |
| **audit** | "validate visualization", "check accessibility", "audit HTML", "quality check" | `references/audit.md` |
| **refine** | "update visualization", "improve layout", "change style", "add section", "modify chart" | `references/refine.md` |

### Lifecycle Flow

```
blueprint → compose → audit → refine → audit
    ↑                           │
    └───── (new content) ───────┘
```

- **blueprint** can be skipped if the user wants direct generation (compose runs its own internal analysis)
- **audit** is automatically invoked at the end of compose and refine
- **refine** can loop back through audit as many times as needed

## Output Convention

Generated files are saved to a project-local output directory:

```
{workspace}/web-visuals/
├── {name}.html           # Self-contained visualization
├── {name}.blueprint.md   # Design blueprint (if blueprint workflow was used)
└── {name}.audit.md       # Audit report (if audit workflow was used)
```

- `{name}` defaults to a slugified version of the content title
- The HTML file can be opened directly in any browser or hosted on GitHub Pages
- Preview in Cursor's built-in browser using `cursor-ide-browser` tools

## Design Principles

1. **Content-First**: The visualization serves the content, never the other way around
2. **Progressive Enhancement**: Start with readable HTML, layer on CSS, then JS interactivity
3. **Single-File Portability**: One `.html` file that works anywhere, no build step
4. **Modern Aesthetic**: Clean typography, generous whitespace, subtle animations
5. **Responsive by Default**: Every layout adapts from mobile to widescreen
6. **Accessible**: WCAG 2.1 AA compliance as a baseline, not an afterthought

## Examples

**Example 1: Research report to interactive page**
```
User: "Visualize this market analysis report"
→ Invokes compose workflow
→ Stage 1: Parses markdown, identifies 4 sections + comparison table + metrics
→ Stage 2: Maps sections to narrative-section, table to comparison-grid, metrics to metric-cards
→ Stage 3: Generates single HTML file with nav, smooth scrolling, animated charts
→ Stage 4: Self-critique passes (a11y OK, responsive OK, no console errors)
→ Output: web-visuals/market-analysis.html
```

**Example 2: Blueprint before generation**
```
User: "What's the best way to visualize this product roadmap?"
→ Invokes blueprint workflow
→ Analyzes content: timeline data + feature groups + priority indicators
→ Proposes: horizontal timeline with grouped swimlanes, filterable by priority
→ Output: web-visuals/product-roadmap.blueprint.md
→ User approves → compose workflow generates the HTML
```

**Example 3: Refine existing visualization**
```
User: "Add a dark mode toggle and make the charts bigger"
→ Invokes refine workflow
→ Reads existing HTML file
→ Adds CSS custom property theme switcher + JS toggle
→ Adjusts chart container dimensions
→ Runs audit: confirms dark mode contrast ratios pass WCAG AA
→ Output: updated web-visuals/market-analysis.html
```

**Example 4: Audit a generated page**
```
User: "Check if the dashboard is accessible and mobile-friendly"
→ Invokes audit workflow
→ Checks: semantic HTML ✅, ARIA labels ⚠️ (2 missing), color contrast ✅
→ Checks: 320px layout ⚠️ (table overflow), 768px ✅, 1024px ✅
→ Output: web-visuals/dashboard.audit.md with findings and fix suggestions
→ Optionally auto-fixes issues if user confirms
```

**Example 5: Data-heavy content**
```
User: "Turn this CSV data into an interactive dashboard"
→ Invokes compose workflow
→ Stage 1: Parses CSV, identifies columns, data types, trends
→ Stage 2: Maps to metric-cards (KPIs) + data-chart (line chart) + comparison-grid (table)
→ Stage 3: Embeds Chart.js via CDN, generates responsive dashboard layout
→ Stage 4: Validates chart rendering, tooltip accessibility, filter UX
→ Output: web-visuals/data-dashboard.html
```

## Integration Points

- **research-analysis**: Visualize research outputs and topic comparisons
- **Architecture**: Generate interactive views of architecture diagrams
- **Specification**: Visual PRD summaries and feature comparison pages
- **deep-research**: Transform multi-source research reports into navigable HTML

## References

- `references/blueprint.md` — Content analysis and visual design planning workflow
- `references/compose.md` — Full generation pipeline (ingest → design → code → critique)
- `references/refine.md` — Iterative update and feedback integration workflow
- `references/audit.md` — Accessibility, responsiveness, and quality validation workflow
- `references/component-map.md` — Complete content-to-UI component mapping reference
- `assets/design-tokens.md` — Color, typography, spacing, and animation token system
- `assets/base-template.html` — Starter HTML scaffold with design tokens pre-applied
