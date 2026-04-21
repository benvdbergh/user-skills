# Compose Workflow

Full end-to-end pipeline that transforms content into a self-contained, interactive HTML5 visualization. This is the primary generation workflow.

## When to Use

- User wants to generate a visualization directly
- A blueprint has been approved and is ready for code generation
- User says "create", "generate", "visualize", "build" an HTML page

## Inputs

One of:
- **Source content**: Markdown file, text, CSV data, or structured content
- **Approved blueprint**: Output from the blueprint workflow (skips Stage 1-2)

## Workflow Steps

### Stage 1: Structural Analysis (skip if blueprint exists)

Parse the source content into a structured representation:

1. **Read** the source file(s)
2. **Identify hierarchy**: Section tree with depth, content type per node
3. **Extract data**: Tables → arrays, metrics → key-value pairs, lists → enumerable items
4. **Verbalize trends**: Annotate what each data point means in context
5. **Build content graph**: Map relationships between sections

Output: Internal content model (not saved to file)

### Stage 2: Intent-to-Interface Mapping (skip if blueprint exists)

Select visual components using `references/component-map.md`:

1. **Map each content block** to a visual component type
2. **Determine layout**: Section order, grid structure, responsive breakpoints
3. **Select interactivity**: Which elements need JS (charts, toggles, filters)
4. **Identify dependencies**: Does this need Chart.js? D3.js? Pure CSS is enough?

Output: Internal design plan (not saved to file)

### Stage 3: Code Generation

Generate the HTML file following these strict rules:

#### File Structure

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{Page Title}</title>
    <!-- CDN dependencies (only if needed) -->
    <style>
        /* Design tokens (from assets/design-tokens.md) */
        /* Component styles */
        /* Responsive breakpoints */
        /* Animations */
        /* Print styles */
    </style>
</head>
<body>
    <!-- Navigation -->
    <!-- Main content sections -->
    <!-- Footer -->
    <script>
        /* Interactivity */
        /* Chart rendering */
        /* Theme toggle */
        /* Scroll animations */
    </script>
</body>
</html>
```

#### CSS Rules

1. **Use CSS custom properties** for all design tokens (colors, spacing, typography)
2. **Apply design tokens** from `assets/design-tokens.md` as the `:root` variables
3. **Use CSS Grid** for page layout, **Flexbox** for component-level alignment
4. **Mobile-first responsive**: Base styles for mobile, `@media` queries for larger screens
5. **Define breakpoints**: 768px (tablet), 1024px (desktop), 1440px (wide)
6. **Implement dark mode** via `[data-theme="dark"]` selector overriding custom properties
7. **Use `clamp()`** for fluid typography: `clamp(1rem, 2.5vw, 1.25rem)`
8. **Add print styles**: `@media print` that removes navigation, forces light theme

#### HTML Rules

1. **Semantic elements**: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
2. **Heading hierarchy**: Strict H1 → H2 → H3 nesting, never skip levels
3. **ARIA landmarks**: `role` attributes where semantic elements aren't sufficient
4. **Alt text**: Every image and chart has descriptive alt text
5. **Link text**: Descriptive labels, never "click here"
6. **Language attribute**: `<html lang="en">` (adjust to content language)

#### JavaScript Rules

1. **Vanilla JS only** (except for chart libraries loaded via CDN)
2. **DOMContentLoaded**: All JS runs after DOM is ready
3. **Theme toggle**: Persist preference in `localStorage`
4. **Scroll animations**: Use `IntersectionObserver` for scroll-triggered reveals
5. **Chart rendering**: If using Chart.js, configure responsive and accessible defaults
6. **No console.log** in production output
7. **Error handling**: Wrap chart/data operations in try-catch

#### Chart Library Usage

When data visualization is needed:

**Chart.js** (preferred for standard charts):
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
```
- Use for: bar, line, pie, doughnut, radar charts
- Configure: `responsive: true`, `maintainAspectRatio: false`
- Accessibility: Include `<canvas>` fallback text

**D3.js** (for custom/complex visualizations):
```html
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
```
- Use for: force-directed graphs, treemaps, custom SVG visualizations
- Prefer Chart.js when a standard chart type suffices

**No library needed** for:
- Simple metric cards, progress bars, comparison grids
- CSS-only animations and transitions
- Flowcharts built with CSS Grid + borders

### Stage 4: Self-Critique Pass

Before saving, run these automated checks:

```
Quality Checklist:
- [ ] HTML validates (no unclosed tags, proper nesting)
- [ ] All sections from content are represented
- [ ] No hardcoded colors (all via CSS custom properties)
- [ ] Responsive at 320px, 768px, 1024px, 1440px
- [ ] Dark mode toggle works and persists
- [ ] Charts render with sample data
- [ ] No JavaScript console errors
- [ ] Keyboard navigation works (Tab through interactive elements)
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Print stylesheet hides nav, forces light theme
- [ ] Scroll animations are smooth (prefer CSS transitions over JS)
- [ ] File size reasonable (< 500KB without images)
```

Fix any issues found before proceeding to output.

### Stage 5: Output

1. **Resolve output directory** using the Output Convention in `SKILL.md` (explicit path → source-adjacent → task context → ask once if still ambiguous). Do **not** assume a fixed folder such as `web-visuals/`.
2. **Create parent directories** if they do not exist for the chosen path.
3. **Save HTML file**: `{resolved-dir}/{slug}.html`
4. **Preview in browser**: Use `cursor-ide-browser` tools to open and verify the result
5. **Report to user**: Summarize what was generated, key design decisions, and the **full** file path

## Post-Compose

After generation, inform the user they can:
- **Preview**: Open in Cursor's browser panel
- **Audit**: Run the audit workflow for detailed quality analysis
- **Refine**: Request specific changes via the refine workflow
- **Export**: Copy the HTML file anywhere — it's fully self-contained
