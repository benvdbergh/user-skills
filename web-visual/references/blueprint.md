# Blueprint Workflow

Analyze content structure and produce a visual design plan **without generating code**. This is the "think before you build" phase — it produces a design blueprint that the user can review, modify, and approve before compose runs.

## When to Use

- User wants to understand what visualizations would work before committing
- Content is complex with mixed data types requiring careful UI decisions
- User explicitly asks for a "plan", "blueprint", or "what would this look like"

## Workflow Steps

### Step 1: Content Ingestion

Read and parse the source content. Identify:

```
Content Inventory:
- [ ] Title and subject matter
- [ ] Section hierarchy (H1 → H2 → H3 depth)
- [ ] Data elements (tables, lists, metrics, percentages)
- [ ] Narrative blocks (paragraphs, conclusions, recommendations)
- [ ] Relationships between sections (sequential, comparative, hierarchical)
- [ ] Temporal data (dates, timelines, version history)
- [ ] Categorical groupings (tags, types, statuses)
```

### Step 2: Data Verbalization

For each data element, generate a human-readable annotation that describes **what the data means**, not just what it contains:

| Data Element | Raw | Verbalized Annotation |
|---|---|---|
| Revenue table | Q1: 10M, Q2: 12M, Q3: 14.4M | "Revenue shows consistent ~20% QoQ growth, accelerating trend" |
| Feature list | 12 items, 4 marked "done" | "33% completion rate across features, majority still pending" |
| Comparison | Product A: 4.2★, Product B: 3.8★ | "Product A leads by 10% in user satisfaction" |

These annotations guide component selection — the design stage needs to know the **story** the data tells, not just its shape.

### Step 3: Component Mapping

For each content block, consult `references/component-map.md` and propose a visual component:

```markdown
## Visual Component Map

| Content Block | Data Type | Proposed Component | Rationale |
|---|---|---|---|
| Executive Summary | Narrative | `hero-section` | Sets context, deserves prominence |
| Revenue Data | Quantitative/Temporal | `data-chart` (line) | Shows growth trend over time |
| Feature Comparison | Comparative | `comparison-grid` | Side-by-side evaluation needed |
| Team Structure | Hierarchical | `hierarchy-tree` | Reports-to relationships |
| Next Steps | Sequential | `flow-diagram` | Step-by-step process |
```

### Step 4: Layout Architecture

Propose the overall page structure:

```markdown
## Page Layout

### Navigation
- Sticky top nav with section anchors
- Smooth scroll behavior

### Section Order (Information Hierarchy)
1. Hero / title section — context setting
2. Key metrics — immediate value (KPI cards)
3. Main content sections — ordered by importance
4. Supporting data — charts, tables, comparisons
5. Conclusions / next steps — call to action

### Responsive Strategy
- Desktop (1024px+): 2-3 column grid for cards/metrics
- Tablet (768px): 2 column, charts stack
- Mobile (320px): Single column, horizontal scroll for tables

### Interactivity Plan
- [ ] Scroll-triggered animations (fade-in sections)
- [ ] Chart tooltips on hover
- [ ] Expandable/collapsible detail sections
- [ ] Filter controls (if comparison data exists)
- [ ] Dark/light mode toggle
```

### Step 5: Output Blueprint Document

Save the blueprint as `{workspace}/web-visuals/{name}.blueprint.md` with this structure:

```markdown
---
title: Blueprint for {Content Title}
type: web-visual-blueprint
created: {date}
status: draft
---

# Visual Blueprint: {Content Title}

## Content Analysis
{Summary of what was found in Steps 1-2}

## Component Map
{Table from Step 3}

## Layout Architecture
{Structure from Step 4}

## Design Decisions
- Color palette: {suggested palette based on content tone}
- Typography: {suggested font pairing}
- Animation style: {subtle/moderate/expressive}

## Recommended Libraries
- {List any CDN libraries needed: Chart.js, D3.js, etc.}
- If none needed: "Pure HTML/CSS/JS — no external dependencies"

## Open Questions
- {Any ambiguities that need user input before compose}
```

### Step 6: Present to User

Present the blueprint as a concise summary. Ask the user:
1. Does the component mapping make sense?
2. Any sections to add, remove, or reprioritize?
3. Style preferences (minimal/expressive, dark/light, corporate/playful)?
4. Ready to compose, or want to adjust the blueprint?

## Transition to Compose

When the user approves the blueprint, pass it as input to the compose workflow. The compose workflow skips its own analysis phase and uses the blueprint directly.
