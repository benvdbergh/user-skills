# Deep Research Report: {{title}}

**Research Query:** {{original_query}}
**Date:** {{date}}
**Duration:** {{duration}}
**Sources Consulted:** {{source_count}}
**Research Branches:** {{branch_count}}

---

## Executive Summary

{{executive_summary}}

**Key Findings:**

1. {{key_finding_1}}
2. {{key_finding_2}}
3. {{key_finding_3}}

**Strategic Recommendation:** {{recommendation}}

---

## Table of Contents

{{#each sections}}
- [{{this.title}}](#{{this.anchor}})
{{/each}}

---

{{#each sections}}

## {{this.number}}. {{this.title}}

**Confidence:** {{this.confidence}}

{{this.content}}

{{#if this.data_points}}

### Key Data Points

| Metric | Value | Source |
|--------|-------|--------|
{{#each this.data_points}}
| {{this.metric}} | {{this.value}} | [{{this.source_id}}] |
{{/each}}

{{/if}}

{{#if this.conflicts}}

### Data Discrepancies

{{#each this.conflicts}}
- **{{this.topic}}:** {{this.description}} — Resolution: {{this.resolution}}
{{/each}}

{{/if}}

---

{{/each}}

## Limitations and Caveats

{{#each limitations}}
- {{this}}
{{/each}}

---

## Methodology

This report was produced using a multi-agent deep research workflow:

1. **Planning:** Query decomposed into {{branch_count}} research branches
2. **Execution:** Parallel research agents conducted {{total_hops}} search hops across {{source_count}} sources
3. **Synthesis:** Findings merged with {{conflict_count}} conflicts identified and {{resolved_count}} resolved
4. **Quality Control:** Self-critique identified {{gap_count}} gaps; {{reresearch_count}} re-research cycles executed

**Confidence Rating Scale:**
- **HIGH** — 3+ independent sources agree, primary data available
- **MEDIUM** — 2 sources agree, or authoritative single source
- **LOW** — Single source, conflicting data, or inference-based

---

## Citation Appendix

{{#each citations}}
[{{this.id}}] {{this.title}}. {{this.url}}. Accessed {{this.date}}.
{{/each}}

---

## Research Metadata

- **Research Engine:** deep-research skill v1.0.0
- **Sub-Agents Spawned:** {{agents_spawned}}
- **Total Search Queries:** {{total_queries}}
- **Total Pages Fetched:** {{total_fetches}}
- **Re-Research Cycles:** {{reresearch_count}}
- **Conflicts Detected:** {{conflict_count}}
- **Conflicts Resolved:** {{resolved_count}}
