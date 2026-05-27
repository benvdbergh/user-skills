# Additional Examples

Supplement to `SKILL.md` (three primary examples). Use when the scenario matches but is not listed in the hub.

## Example 4: Audit a generated page

```
User: "Check if the dashboard is accessible and mobile-friendly"
→ audit workflow on existing {slug}.html
→ Scores per dimension; optional {slug}.audit.md beside HTML
→ Offer refine fixes if user confirms
```

## Example 5: CSV dashboard

```
User: "Turn this CSV into an interactive dashboard"
→ compose: parse columns → metric-cards + data-chart + comparison-grid
→ Chart.js via CDN; source-adjacent {slug}.html
→ audit checklist (tooltips, responsive charts)
```

## Example 6: Refine existing visualization

```
User: "Add dark mode and bigger charts"
→ refine: token-level CSS + chart config
→ audit contrast and breakpoints
```

## Example 7: KION-branded dossier (vault)

```
User: "Visualize this ITS spec as a KION HTML dossier"
→ Escalate tokens to kion-design if brand colors required
→ long-report workflow + compose
→ Return to web-visual for HTML delivery
```
