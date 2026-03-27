---
name: document-deep-merge
description: >-
  Deep-merges or fully integrates learnings from one or more sub-documents (sub-researches, extensions) into a main document. Answers: how do sub-document findings impact the main, and what would the main have looked like if those findings were known upfront? Use when merging sub-research into main report, integrating extended sections, consolidating research documents, or combining diagram content with prose (with diagram skill).
license: MIT
metadata:
  author: PAI
  version: 1.0.0
---

# document-deep-merge

Orchestrates the integration of sub-documents (sub-researches, deep-dives, or extensions) into a main document. The skill answers the core question: **How do the core learnings from the sub-documents impact the main document, and what would the main have looked like if those findings had been known upfront?** Integration can range from adding a section to full restructuring, depending on impact.

Applies to research reports, long-form documents, and (when composed with the diagram skill) documents that include or reference diagrams.

## Core Question

**"What would Report A have looked like if the findings from Report B (and optionally C, D…) had been known during the main research?"**

- **Add-only**: Sub-document extends one area without changing main narrative → expand or add section(s).
- **Restructure**: Sub-document shifts a main insight or taxonomy → propose and apply structural changes (sections, TOC, emphasis).
- **Full integration**: Multiple sub-documents or a sub that reframes the main → coherent single document with learnings woven throughout.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **merge** | "merge sub-research into main", "integrate findings", "deep-merge documents", "what would main report look like if sub findings were known" | `references/document-deep-merge.md` |

## Instructions

### 1. Ingest and Scope

- **Main document**: Path or content of the global/base report (e.g. capability map, strategy doc).
- **Sub-document(s)**: One or more paths or content that extend or specialize part of the main (e.g. forklift software deep-dive extending a supply chain capability map).
- **Optional**: Diagram assets; if integration involves diagrams, invoke the diagram skill for Interpret/Revise as needed.

### 2. Impact Analysis

- Extract **core learnings** from each sub-document (key findings, taxonomy changes, new concepts, corrected or refined claims).
- Map each learning to the **main document** (sections, headings, key messages).
- Classify impact:
  - **Additive**: New content that fits existing structure (new subsection, table, or paragraph).
  - **Refining**: Nuance or correction within existing sections (in-place edits).
  - **Structural**: Changes to outline, TOC, or emphasis (reorder, split, rename, elevate/demote).
  - **Reframing**: Main narrative or taxonomy shifts; may require full restructure or rewritten intro/executive summary.

### 3. Integration Strategy

- Choose strategy from: **add-only**, **restructure**, or **full integration**.
- Produce a short **change plan**: list of concrete edits (sections to add, move, merge, or rewrite) so the user can confirm before application.

### 4. Apply and Emit

- Generate the **integrated document** (or integrated document + diagram updates if diagram skill is used).
- Preserve main document voice and structure to the extent consistent with the strategy; update TOC, cross-references, and citations as needed.
- Optionally output a brief **integration summary** (what was merged, what changed, where sub-sources appear).

### 5. Optional: Diagram Composition

- When the main or sub content includes diagrams (e.g. draw.io, Excalidraw): use the **diagram** skill to Interpret (extract structure/insights) or Revise (update diagram to reflect merged content), then place or reference the updated diagram in the integrated document.

## Skill Composition

- **With diagram skill**: Use when merging document content that references or contains diagrams; diagram skill handles Interpret and Revise on diagram artifacts.
- **With deep-research / research-analysis**: Use when sub-documents are research outputs; this skill handles the merge/integration step after research is done.

## Tool Usage

- **Built-in**: Read (main + sub files), Write (integrated output). No MCP required for core merge.
- **Optional**: Diagram skill (same agent) for diagram-aware merge when user requests or when documents reference diagrams.

## Tool Safety Policy

- **Safe**: Reading and writing document files; producing change plans and integrated drafts.
- **Requires confirmation**: Overwriting the original main document (prefer writing to a new file or versioned path unless user explicitly requests overwrite).

## Examples

**Example 1: Add-only integration**
```
User: "Merge the Forklift Software in Supply Chain doc into the Supply Chain Capability Map; keep the map as main, add the forklift depth where it fits."
→ Ingest main (Capability Map) + sub (Forklift Software).
→ Impact: additive — sub extends "MANUAL & DIGITIZED FLEET MGMT" and FMS/RTLS/BMS; no taxonomy change.
→ Strategy: add-only. Change plan: expand Section 3 (or relevant layer) with FMS/RTLS/BMS detail; add optional market table from sub.
→ Emit: integrated Capability Map with new subsection(s); integration summary.
```

**Example 2: Restructure after sub-research**
```
User: "Integrate the forklift report into the main — the sub makes the manual/autonomous boundary and WES role much clearer; the main should reflect that."
→ Impact analysis: sub refines "WES" and "manual vs autonomous" framing → structural + refining.
→ Strategy: restructure. Change plan: elevate WES and manual-fleet taxonomy in TOC; rewrite Executive Summary bullet on layers; add FMS/RTLS/BMS under warehouse layer; adjust boundary section.
→ Emit: restructured main with updated summary, TOC, and sections; integration summary.
```

**Example 3: Document + diagram**
```
User: "Merge the forklift doc into the capability map and update the layer diagram so it shows FMS/RTLS/BMS in the warehouse layer."
→ Run document-deep-merge; identify diagram reference in main.
→ Invoke diagram skill: Interpret existing layer diagram → Revise (add FMS, RTLS, BMS nodes/group) → output updated diagram path.
→ Emit: integrated document with updated diagram reference; diagram file written or path noted.
```

## References

- Full workflow steps, edge cases, and output conventions: `references/document-deep-merge.md`.
