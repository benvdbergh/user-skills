# Deep-Research → web-visual Handoff

Use when the source artifact is a **`deep-research` report** (or equivalent: executive summary, confidence-rated sections, numbered citations, optional structured hooks).

## Input Contract (Conceptual)

| Report region | web-visual treatment |
|---------------|----------------------|
| Executive summary | `hero-section` + short `narrative-section` |
| Key findings (numbered) | `metric-cards` or highlight list in hero |
| Each main section | `narrative-section` + section-specific component from content |
| **Confidence:** HIGH/MEDIUM/LOW | Badge on section `<h2>` (`data-confidence`) |
| Quantitative claims | `data-chart` or `metric-cards` with source in `title` tooltip |
| Conflicts / limitations | `accordion` titled "Sources & caveats" |
| Citation appendix | `citation-appendix` component |
| `suggested_visualizations[]` | Blueprint rows; prefer `diagram` skill if user wants standalone diagram files |
| `implications_for_enterprise_model` | Do **not** render as EA diagram here; link to follow-up with `enterprise-architecture` |

## Section Mapping Rules

1. Read **Table of Contents** from report; each TOC entry = one `section[id]`.
2. Preserve **confidence** visually (color token: high=success, medium=warning, low=muted)—never hide LOW sections; label them.
3. Inline citations `[1]` must link to `#ref-1` in appendix.
4. If two sources conflict, use a callout box citing both URLs (from report conflict notes).

## Blueprint Additions

When ingesting deep-research output, blueprint MUST include:

```markdown
## Deep-Research Metadata
- Query: {original_query}
- Sources consulted: {count}
- Branches: {branch_count}
- Confidence summary: {high count} HIGH / {medium} MEDIUM / {low} LOW
```

## Compose Order

1. Hero + executive metrics (from summary only)
2. Optional "Research at a glance" `comparison-grid` (branches vs confidence)—only if ≥3 branches
3. Body sections in TOC order (batched per `long-report.md`)
4. Citation appendix
5. Footer: "Generated from deep-research" + date (no false provenance)

## Escalation

- Missing citations for quantitative claims → stop compose; ask to re-run `deep-research` or trim claims
- User wants interactive EA model → `enterprise-architecture` / vault adapters, not HTML-only
