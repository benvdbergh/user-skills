# Component Map

Complete reference mapping content patterns to visual UI components. Used by the blueprint and compose workflows to decide **which visual metaphor best serves each piece of content**.

## Selection Principle

Choose components based on **what the user needs to understand**, not what the data looks like. A table of numbers might need a chart (if the trend matters) or might need a filterable grid (if comparison matters).

## Component Catalog

### narrative-section

**Use when**: Long-form text, explanations, conclusions, analysis paragraphs
**Content signals**: Multiple paragraphs, no structured data, prose-heavy

```html
<section class="narrative" id="{slug}">
  <h2>{Section Title}</h2>
  <p class="lead">{Opening paragraph — larger text}</p>
  <p>{Body paragraphs}</p>
  <blockquote class="pullquote">{Key quote or insight}</blockquote>
</section>
```

**Styling**: Large readable type, generous line-height (1.6+), max-width ~70ch, pull quotes offset in accent color.

---

### hero-section

**Use when**: Page title, executive summary, top-level context setting
**Content signals**: First section, contains title + brief overview

```html
<header class="hero">
  <div class="hero__content">
    <h1>{Title}</h1>
    <p class="hero__subtitle">{Subtitle or tagline}</p>
    <p class="hero__summary">{1-2 sentence summary}</p>
  </div>
  <div class="hero__meta">
    <span class="tag">{Category}</span>
    <time>{Date}</time>
  </div>
</header>
```

**Styling**: Full-width, gradient or accent background, large title, subtle entrance animation.

---

### metric-cards

**Use when**: KPIs, key numbers, summary statistics, performance indicators
**Content signals**: Numeric values with labels, percentages, counts, scores

```html
<div class="metrics-grid">
  <div class="metric-card">
    <span class="metric-card__value">{Value}</span>
    <span class="metric-card__label">{Label}</span>
    <span class="metric-card__trend metric-card__trend--{up|down|neutral}">{+/-X%}</span>
  </div>
  <!-- repeat -->
</div>
```

**Styling**: 2-4 column grid, prominent numbers, small labels below, color-coded trend indicators. Optional sparkline via inline SVG.

---

### comparison-grid

**Use when**: Side-by-side comparison of items, feature matrices, product comparisons
**Content signals**: Table data with comparable attributes across items, pros/cons lists

```html
<div class="comparison">
  <div class="comparison__controls">
    <input type="search" placeholder="Filter..." class="comparison__filter">
  </div>
  <div class="comparison__grid">
    <div class="comparison__item">
      <h3>{Item Name}</h3>
      <dl class="comparison__attributes">
        <dt>{Attribute}</dt>
        <dd>{Value}</dd>
      </dl>
    </div>
    <!-- repeat -->
  </div>
</div>
```

**Styling**: Card-based grid or responsive table. Highlight differences with color. Optional filter/sort JS.

---

### data-chart

**Use when**: Quantitative data that tells a story through trends, distributions, or proportions
**Content signals**: Time series, grouped numerics, percentages that sum to 100%

**Chart type selection**:

| Data Pattern | Chart Type | Library |
|---|---|---|
| Trend over time | Line chart | Chart.js |
| Category comparison | Bar chart (horizontal for many categories) | Chart.js |
| Part-of-whole | Doughnut chart (prefer over pie) | Chart.js |
| Distribution | Histogram or box plot | Chart.js |
| Multi-dimensional | Radar chart | Chart.js |
| Scatter / correlation | Scatter plot | Chart.js |
| Complex / custom | Custom SVG | D3.js |

```html
<figure class="chart-container">
  <figcaption class="chart-container__title">{Chart Title}</figcaption>
  <div class="chart-container__wrapper">
    <canvas id="chart-{id}" role="img" aria-label="{Accessible description}">
      {Fallback text description of the data}
    </canvas>
  </div>
  <p class="chart-container__caption">{Verbalized insight about this data}</p>
</figure>
```

**Styling**: Responsive container with `maintainAspectRatio: false`, themed colors from design tokens. Caption below explains the key takeaway.

---

### flow-diagram

**Use when**: Processes, workflows, decision trees, step-by-step procedures
**Content signals**: Sequential steps, if/then logic, numbered procedures

```html
<div class="flow">
  <div class="flow__step flow__step--{active|complete|pending}" data-step="{n}">
    <div class="flow__step-number">{n}</div>
    <div class="flow__step-content">
      <h3>{Step Title}</h3>
      <p>{Description}</p>
    </div>
    <div class="flow__connector"></div>
  </div>
  <!-- repeat -->
</div>
```

**Styling**: Vertical on mobile, horizontal on desktop. Connected by lines/arrows via CSS borders or SVG. Active step highlighted, completed steps muted with checkmark.

---

### timeline

**Use when**: Chronological events, version history, project milestones, roadmaps
**Content signals**: Dated entries, sequential events, phases with time boundaries

```html
<div class="timeline">
  <div class="timeline__item timeline__item--{left|right}">
    <div class="timeline__marker"></div>
    <div class="timeline__content">
      <time class="timeline__date">{Date}</time>
      <h3>{Event Title}</h3>
      <p>{Description}</p>
    </div>
  </div>
  <!-- repeat, alternating left/right -->
</div>
```

**Styling**: Central vertical line, alternating left/right cards on desktop, all-left on mobile. Markers color-coded by category. Scroll-reveal animation.

---

### hierarchy-tree

**Use when**: Organizational structures, category taxonomies, nested groupings
**Content signals**: Parent-child relationships, nested lists, org charts

```html
<div class="tree">
  <details class="tree__node" open>
    <summary class="tree__label">{Parent}</summary>
    <div class="tree__children">
      <details class="tree__node">
        <summary class="tree__label">{Child}</summary>
        <!-- nested children -->
      </details>
    </div>
  </details>
</div>
```

**Styling**: Indented with connecting lines via CSS borders. `<details>` elements provide native expand/collapse. Icons for node types.

---

### relationship-map

**Use when**: Network connections, entity relationships, system interactions
**Content signals**: Entities with bidirectional connections, graph-like structures

Implementation options:
- **Simple (< 15 nodes)**: CSS Grid with SVG connection lines
- **Complex (15+ nodes)**: D3.js force-directed graph

```html
<div class="relationship-map" id="rel-map-{id}">
  <svg class="relationship-map__svg"></svg>
  <div class="relationship-map__tooltip" hidden></div>
</div>
```

**Styling**: Interactive — drag nodes, hover for details, zoom/pan for large graphs. Color-code node types, vary line thickness by relationship strength.

---

### tabbed-content

**Use when**: Multiple parallel views of the same data, categorized sections, detail panels
**Content signals**: Content that can be grouped into discrete, switchable categories

```html
<div class="tabs">
  <div class="tabs__list" role="tablist">
    <button class="tabs__tab" role="tab" aria-selected="true" aria-controls="panel-{id}">{Tab Label}</button>
    <!-- repeat -->
  </div>
  <div class="tabs__panel" role="tabpanel" id="panel-{id}">
    {Content}
  </div>
</div>
```

**Styling**: Underlined active tab, smooth fade transition between panels. ARIA attributes for screen reader compatibility.

---

### accordion

**Use when**: FAQ-style content, expandable details, dense information that benefits from progressive disclosure
**Content signals**: Question/answer pairs, sections with optional detail depth

```html
<div class="accordion">
  <details class="accordion__item">
    <summary class="accordion__header">{Title}</summary>
    <div class="accordion__body">{Content}</div>
  </details>
  <!-- repeat -->
</div>
```

**Styling**: Smooth height transition via CSS `interpolate-size: allow-keywords`, chevron rotation indicator, subtle background change on open state.

---

### citation-appendix

**Use when**: Deep-research reports, footnoted analysis, any page with numbered `[n]` references
**Content signals**: Citation appendix, references section, URL list at document end

```html
<section class="citations" id="references" aria-labelledby="references-heading">
  <h2 id="references-heading">References</h2>
  <ol class="citations__list">
    <li id="ref-1"><a href="{url}" rel="noopener noreferrer">{title}</a> — {publisher}, {date}</li>
  </ol>
</section>
```

**Styling**: Smaller type, break-all URLs, back-to-content links optional. Inline `[n]` in prose link to `#ref-n`.

---

### reading-progress

**Use when**: Long reports (12+ sections) where orientation helps
**Content signals**: Activated by `long-report` workflow

```html
<div class="reading-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
  <div class="reading-progress__bar"></div>
</div>
```

**Styling**: Fixed top, 2–3px height, accent color; update width from scroll %. Disable animation when `prefers-reduced-motion: reduce`.

---

## Component Composition

Most pages use 3-6 components in combination. Typical compositions:

| Page Type | Component Stack |
|---|---|
| Research report | hero → metric-cards → narrative-section → data-chart → comparison-grid → narrative-section → citation-appendix |
| Long / deep-research dossier | hero → metric-cards → narrative (exec) → [batched sections + TOC] → accordion (appendix) → citation-appendix |
| Product roadmap | hero → timeline → tabbed-content (per phase) → flow-diagram |
| Dashboard | metric-cards → data-chart (×2-3) → comparison-grid → accordion (details) |
| Process documentation | hero → flow-diagram → tabbed-content → accordion (FAQ) |
| Competitive analysis | hero → comparison-grid → data-chart → narrative-section |
| Team/org overview | hero → hierarchy-tree → metric-cards → timeline |
