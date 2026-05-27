---
name: web-visual
description: >-
  Transform text content, research reports (including deep-research outputs), and
  structured data into polished, interactive single-file HTML5 visualizations.
  USE WHEN generate HTML page, create visualization, interactive report, web visual,
  visual report, long report HTML, research dossier page, data dashboard, content to
  HTML, generative UI, interactive page, visual summary, HTML export, web presentation,
  data visualization.
license: MIT
metadata:
  author: PAI
  version: 1.3.0
---

# web-visual

Generative UI skill: turn textual or research content into polished, self-contained HTML5 pages. Pipeline summary: **ingest → design → compose → critique** — full steps in `references/compose.md`.

## Mandatory Behaviors

1. **Resolve output path** per Output Convention before writing any file.
2. **Classify input**: short page | long report | deep-research | CSV/dashboard — route per table below.
3. **Long-report triggers** → require **blueprint** with Report Spec; never single-pass wall-of-text HTML.
4. **deep-research input** → read `references/deep-research-handoff.md` before compose.
5. **Promote prose semantically** using `references/markdown-patterns.md` (analyzer, not 1:1 markdown mirror).
6. **End compose** with Stage 4 checklist; run `audit` workflow when the user asks for quality validation.
7. **Escalate** decks, diagrams, research, or product UI per `references/skill-escalation.md`.

## Input Routing

| Input signal | Workflow |
|--------------|----------|
| User wants a plan first, or complex mixed content | `blueprint` → `compose` |
| Long report / dossier / 12+ sections / deep-research output | `long-report` (blueprint required) → batched `compose` |
| Direct “generate HTML” on short content | `compose` (internal ingest if no blueprint) |
| Change existing `.html` | `refine` → `audit` |
| Quality check only | `audit` |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **blueprint** | "visual blueprint", "what visuals would work", "design plan" | `references/blueprint.md` |
| **compose** | "generate HTML", "visualize", "build interactive page" | `references/compose.md` |
| **audit** | "audit HTML", "check accessibility", "quality check" | `references/audit.md` |
| **refine** | "update visualization", "change layout", "add section" | `references/refine.md` |
| **long-report** | "research dossier", "long report HTML", "deep-research HTML" | `references/long-report.md` |

### Lifecycle

```
blueprint → compose → audit → refine → audit
```

- **blueprint** may be skipped for **short** pages only (compose runs ingest internally).
- **long reports**: blueprint is **required** (`references/long-report.md`).
- **audit** runs at end of compose/refine unless the user opts out.

## Output Convention

**Do not** hard-code a fixed folder (e.g. `web-visuals/` at repo root).

1. **Explicit path** — user-named folder or file path.
2. **Source-adjacent** — `{source-dir}/{slug}.html` plus optional `{slug}.blueprint.md` / `{slug}.audit.md`.
3. **Task context** — next to the primary note or spec; ask once if unclear.

Preview: open `.html` in a browser or IDE preview; no IDE-specific tools required.

## Design Principles

1. Content-first — visualization serves the story.
2. Progressive enhancement — readable HTML, then CSS, then JS.
3. Single-file portability — one `.html`, no build step.
4. Responsive and WCAG 2.1 AA baseline.

## Examples

**Example 1: Research report**
```
User: "Visualize this market analysis report"
→ compose (or blueprint if 12+ sections)
→ markdown-patterns + component-map → single HTML beside source
→ audit checklist before delivery
```

**Example 2: Long deep-research dossier**
```
User: "Turn this deep-research report into an interactive dossier"
→ blueprint (Report Spec) + deep-research-handoff
→ compose from assets/long-report-shell.html in batches
→ citation-appendix + TOC; audit long-report gates
```

**Example 3: Blueprint then compose**
```
User: "What would this product roadmap look like as a page?"
→ blueprint → user approves → compose from assets/base-template.html
```

More scenarios: `references/examples.md`.

## Integration

| Skill | Role |
|-------|------|
| **deep-research** | Upstream cited reports → `deep-research-handoff.md` |
| **research-analysis** | Upstream topic notes |
| **enterprise-architecture** | Upstream EA artifacts (present only; do not author models) |
| **specification** | Upstream PRD/spec markdown |
| **diagram** | Standalone diagrams when not inline HTML |
| **slides** | Pitch decks — not scrollable dossiers |

Boundaries: `references/skill-escalation.md`.

## References

| File | Purpose |
|------|---------|
| `references/compose.md` | Full ingest → code → critique pipeline |
| `references/markdown-patterns.md` | Prose pattern → component (analyzer rules) |
| `references/component-map.md` | Component catalog and HTML patterns |
| `references/long-report.md` | Long dossier workflow (SSoT for batching/TOC) |
| `references/deep-research-handoff.md` | Research report → HTML contract |
| `references/blueprint.md` | Pre-code design plan |
| `references/audit.md` | Standalone quality validation |
| `references/refine.md` | Incremental HTML edits |
| `references/skill-escalation.md` | Owns / does not own / escalate |
| `references/examples.md` | Additional use-case walkthroughs |
| `assets/base-template.html` | Short-page shell |
| `assets/long-report-shell.html` | Dossier shell (TOC, drawer, progress) |
| `assets/design-tokens.md` | CSS custom properties |
