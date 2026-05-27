# Markdown Pattern → Component Map

**Analyzer contract:** read source as *meaning*, not markup. When a pattern matches, use the listed component from `component-map.md` — do not mirror markdown as unstyled `<p>` stacks.

Consult this file in **blueprint Step 3** and **compose Stage 2** (or skip Stage 2 when blueprint already mapped patterns).

## Pattern Table

| Source signal (markdown / prose) | Component | Notes |
|----------------------------------|-----------|-------|
| Title + subtitle + 1–2 sentence summary | `hero-section` | First screen; include date/tags if present |
| Executive summary / key findings list | `hero-section` + `narrative-section` | Pull top 3 findings into hero or `metric-cards` |
| Numbered action steps (3+ sequential items) | `flow-diagram` or numbered step cards | Prefer step cards with timeline rail for runbooks |
| "A calls B, B writes to C" / multi-hop integration prose | Mermaid `flowchart` (max 5/page) or `flow-diagram` | See compose CDN rules; prefer Mermaid when hops ≥ 3 |
| Table of metrics / KPI row | `metric-cards` | Max 6 above the fold on long reports |
| Time series / trend table | `data-chart` (line) | Verbalize trend in caption |
| Category comparison (2–4 columns) | `comparison-grid` | Highlight winner or recommended option |
| "Option A vs B vs C" / feature matrix | `comparison-grid` | Add ★ Recommended badge when source states one |
| "Pros / cons" / "Trade-offs" heading | Two-column pros/cons box or `comparison-grid` | Side-by-side, equal visual weight |
| Org chart / reports-to hierarchy | `hierarchy-tree` | |
| Dated milestones / release history | `timeline` | |
| Entity relationship / dependency graph | `relationship-map` or D3 | Chart.js insufficient for dense graphs |
| FAQ / Q&A pairs | `accordion` | |
| Long appendix, raw logs, code dumps | `accordion` (collapsed) | Progressive disclosure |
| Parallel views (by region, phase, persona) | `tabbed-content` | |
| Geographic regions / site list | `geo-visual` | Only when location is analytically relevant |
| Body analysis paragraphs | `narrative-section` | Max ~70ch width; use `pullquote` for one key quote per section |
| "Don't …" / "Must …" / critical warning | Callout (danger/warning) | Map to highlighted box in narrative CSS |
| Key conclusion / recommendation | Highlight box or `pullquote` | Accent border |
| Numbered citations `[1]` + references section | `citation-appendix` | Required for deep-research; inline links to `#ref-n` |
| Confidence: HIGH / MEDIUM / LOW (research) | Section badge on `<h2>` | `data-confidence` attribute; see handoff doc |
| Wide data table (>5 columns) | `comparison-grid` or scrollable table wrapper | Never shrink text below 16px on mobile |
| CSV / columnar metrics file | `metric-cards` + `data-chart` + table | Dashboard layout; see `examples.md` |

## Anti-Patterns

| Do not | Do instead |
|--------|------------|
| One `<p>` per markdown paragraph for 20+ sections | Split with subheads; use components above |
| Chart every table | Ask whether *trend* or *comparison* matters |
| >30% of sections as charts on long reports | Cap per `long-report.md` |
| Embed user HTML from untrusted markdown | Escape text; no raw `innerHTML` from source |
| Mermaid for simple 2-step flows | CSS `flow-diagram` |

## Chart vs Diagram Decision

| Need | Library |
|------|---------|
| Bar, line, pie, doughnut, radar | Chart.js (CDN) |
| Force graph, treemap, custom SVG | D3.js (CDN) |
| Process / architecture flow (3+ nodes) | Mermaid (CDN, optional) |
| KPI strip, cards, tables | No library |

CDN pins and init rules: `references/compose.md` § Chart and diagram libraries.
