# Document Deep-Merge Workflow

Integrate one or more sub-documents (sub-researches, extensions, deep-dives) into a main document so the main reflects all core learnings as if they had been known during the original research.

## Guiding Question

**What would the main document have looked like if the findings from the sub-document(s) had been known upfront or during the main research?**

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| **Main document** | Yes | Path or content of the base/global report (e.g. capability map, strategy doc, PRD). |
| **Sub-document(s)** | Yes (≥1) | Path(s) or content of documents that extend or specialize part of the main. |
| **Output path** | Optional | Where to write the integrated document. Default: new file (e.g. main name + `_integrated` or user-specified). |
| **Diagram assets** | Optional | Paths to diagrams to update when merging; triggers composition with diagram skill. |

## Steps

### Step 1: Ingest

1. Read the **main document** in full (or in structured chunks if very long).
2. Read each **sub-document** in full.
3. If the user indicated **diagram** content (or paths to .drawio, .excalidraw, etc.), list those for Step 5.
4. Confirm scope: main + list of sub-docs + optional diagram list.

### Step 2: Extract and Map

1. From each sub-document, extract:
   - **Core learnings**: 3–7 key findings or concepts that should affect the main.
   - **Taxonomy/terminology**: New or changed terms, categories, or hierarchies.
   - **Evidence**: Tables, numbers, or citations that belong in the main.
   - **Narrative shifts**: Any reframing (e.g. "manual vs autonomous" boundary, role of WES).
2. Map each learning to the **main document**:
   - Which section(s) or headings they relate to.
   - Whether they **add**, **refine**, or **contradict** existing content.
   - Whether they imply **structural** change (new section, reorder, rename, merge).

### Step 3: Classify Impact and Choose Strategy

| Impact type | Meaning | Typical strategy |
|------------|--------|-------------------|
| **Additive** | New content fits existing structure | Add-only |
| **Refining** | Nuance, correction, or clarification in place | Add-only or light restructure |
| **Structural** | Outline, TOC, or emphasis must change | Restructure |
| **Reframing** | Main narrative or taxonomy shifts | Full integration / restructure |

Choose one:

- **Add-only**: Only add or expand sections; do not reorder or rewrite existing structure.
- **Restructure**: Change section order, headings, or TOC; rewrite summary or key sections as needed.
- **Full integration**: Weave sub-learnings throughout; may rewrite executive summary, intro, and multiple sections for coherence.

Produce a **change plan** (bulleted list):

- Sections/headings to **add** or **expand** (with source sub-doc).
- Sections to **edit in place** (what changes).
- Sections to **move**, **split**, or **rename** (if restructure).
- **Executive summary / key messages** changes (if any).

Present the change plan to the user and proceed when confirmed (or when user has asked to run without confirmation).

### Step 4: Generate Integrated Document

1. Apply the change plan to the main document:
   - Preserve main voice and formatting conventions.
   - Insert or expand content from sub-docs; avoid duplication; merge tables or lists where it improves clarity.
   - Update TOC, cross-references, and citation list if present.
2. Write the integrated document to the **output path** (or proposed path if not given).
3. Optionally produce a short **integration summary**:
   - What was merged (which sub-docs, which sections).
   - What changed (additions, refinements, structural changes).
   - Where sub-sourced content appears (section names or headings).

### Step 5: Optional — Diagram Integration

If diagram assets were identified:

1. For each diagram that should reflect the merged content:
   - Use the **diagram** skill: **Interpret** to get current structure, then **Revise** with the list of changes (e.g. add FMS, RTLS, BMS under warehouse layer).
2. Write updated diagram to a new path or overwrite per user preference.
3. In the integrated document, ensure references to the diagram point to the updated file and that surrounding text matches the diagram.

## Outputs

- **Integrated document**: Single coherent document (main + sub learnings applied).
- **Integration summary** (optional): What was merged and what changed.
- **Updated diagram(s)** (optional): If diagram skill was used.

## Edge Cases

- **Conflicting claims**: If sub contradicts main, note in change plan and prefer sub (or ask user); apply one version and flag the conflict in the summary.
- **Very long main**: Process in sections; run impact analysis per section; keep a single change plan and one integrated output.
- **Multiple sub-docs overlapping**: Merge learnings first (deduplicate, reconcile terminology), then one change plan for the main.
- **Diagram not in repo**: If diagram is only in the doc as description, use diagram skill to **Author** a new diagram from the merged description, then reference it in the integrated doc.

## Prior Art (Summary)

- Hierarchical report generation (e.g. SRAG-style): outline → refinement → content → section integration. This workflow adopts a similar phased approach (extract → map → strategy → apply).
- Document pipelines: ingestion, extraction with structure, verification. Here, verification is the change plan and optional user confirmation before overwrite.
- No MCP is required for the core workflow; diagram composition uses the same agent’s diagram skill (no extra MCP).
