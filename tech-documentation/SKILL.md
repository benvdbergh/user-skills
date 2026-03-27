---
name: tech-documentation
description: >-
  Global orchestrator for technical and professional documentation workflows
  with Markdown as the canonical source of truth. Use when the user wants to
  create, reshape, enrich, or audit technical docs across vaults, and to route
  into subskills such as doc coauthoring, technical writing, diagrams,
  enterprise architecture views, and research-backed content, including Office
  artifact export (Word/PDF/PPTX) via the `office-*` skills.
license: MIT
metadata:
  scope: global
  tier: core
  version: 1.0.0
---

# tech-documentation

Global, vault-agnostic **technical documentation orchestrator** for Markdown-first documents, with explicit routing to specialized skills (coauthoring, research, diagrams, enterprise modeling, DOCX export).

This skill is the **primary entry point** for technical documentation workflows; vault-local documentation skills (such as Ai-Vault `documentation`) SHOULD call this skill for core behavior and only add environment-specific conventions.

---

## Overview & Positioning

- **Scope**: Technical and professional documentation (design docs, specs, runbooks, capability and architecture docs, reports, guides, READMEs, knowledge articles).
- **Source of truth**: **Markdown is canonical**. All deep structure, meaning, and iterative editing happen in Markdown or equivalent text-first formats.
- **Role**: High-level **orchestrator**:
  - Chooses and configures workflow modes (create, edit, enrich, audit, impact-analysis, import, export, sync).
  - Delegates specialized subtasks to other skills (research, architecture modeling, diagrams, DOCX handling).
  - Keeps vault-specific rules **outside** this global skill; callers provide local conventions (paths, doc types, templates).

### When to use `tech-documentation`

Activate this skill whenever the user:

- Wants to **create or reshape** a substantial technical/professional document.
- Asks for **structure-first** drafting (outlines, sections, headings) before prose.
- Requests **visuals** (tables, diagrams) that should be consistent and reusable.
- Needs **research-backed** content or integration with architecture/capability views.
- Mentions **Word/PDF exports** but without specifying how to run the low-level DOCX tools.
- Works across **multiple vaults** and wants consistent documentation behavior.

---

## Scope & Assumptions

- **Global & vault-agnostic**:
  - No hard-coded paths or repository structures.
  - Callers provide vault-specific conventions (folder layout, naming, doc taxonomies).
- **Markdown-first**:
  - Docs are maintained primarily as Markdown (or compatible text formats with front matter).
  - Word/PDF/PPTX are **derivative exports** owned by `office-docx` / `office-pptx` (and related Office skills).
- **Orchestration, not duplication**:
  - This skill describes **what to orchestrate** (high-level workflows, integration patterns).
  - Subskills implement **how** (detailed prompts, MCP usage, scripts).

Assume:

- Callers can provide:
  - Current doc content or path.
  - Purpose, audience, and success criteria.
  - Any relevant standards/templates (or references to vault-local docs).
- Subskills such as `deep-research`, `diagram`, and `enterprise-modeling` are available when needed, but this skill must degrade gracefully if some are absent (e.g., no enterprise model).

---

## Workflow Modes

The orchestrator exposes the following **workflow modes**, which should be mapped by callers to their own commands or prompts:

- **create**: New document from scratch.
  - Capture purpose, scope, audience, constraints.
  - Design outline and doc-type-specific scaffolding.
  - Draft section-by-section, with optional research and diagrams.

- **edit**: Targeted revisions to an existing document.
  - Local edits (sentence/section level) with global integrity checks as needed.
  - Optionally coordinate with research/architecture updates.

- **enrich**: Visuals and structure.
  - Add or improve tables, lists, diagrams, examples, and cross-references.
  - Delegate diagram creation to `diagram` and architecture views to `enterprise-modeling` where appropriate.

- **audit**: Quality and coherence review.
  - Check structure, tone, terminology, gaps, redundancies.
  - Propose actionable change sets, grouped by severity.

- **impact-analysis**: Purpose/audience/scope shifts.
  - Compare current doc intent vs. new target.
  - Propose a migration plan (sections to add/remove/merge/rewrite).
  - Optionally leverage `deep-research` for updated context.

- **import**: Bring external formats into Markdown.
  - For **PDF** sources: delegate to `office-pdf` (PDF → Markdown ingestion workflow).
  - For **`.docx`** sources: delegate to `office-docx` to convert and clean into Markdown.
  - Ensure the new Markdown becomes the canonical working source.

- **export**: Produce `.docx` / PDF / `.pptx` artifacts.
  - Delegate to `office-docx` for Word exports, and `office-pptx` for decks.
  - Preserve Markdown as canonical; do not apply semantic edits only in DOCX/PDF.

- **sync**: Reconcile Markdown vs. Word/PDF divergences.
  - Use `office-docx` to detect differences.
  - Prefer applying substantive edits in Markdown and re-exporting.

---

## Workflow Routing

| Workflow        | Typical trigger phrases                                                                 | Primary downstream skills / artifacts                |
|-----------------|-----------------------------------------------------------------------------------------|------------------------------------------------------|
| **create**      | "create/write new document", "draft spec/report/guide", "new design doc"               | Markdown doc, optional diagrams and research         |
| **edit**        | "revise section", "improve this chapter", "tighten wording", "fix this doc"            | Markdown doc                                         |
| **enrich**      | "add table/diagram/figure", "make this more visual", "better examples"                 | `diagram`, tables, examples                          |
| **audit**       | "review this document", "documentation audit", "check for gaps"                        | Findings + proposed edits                            |
| **impact-analysis** | "retarget for executives", "change scope", "repurpose this doc"                    | Change plan + revised doc                            |
| **import**      | "import this Word", ".docx to Markdown"                                                | `office-docx`, cleaned Markdown                      |
| **import**      | "convert PDF to Markdown", "import this PDF", "start from this PDF"                    | `office-pdf`, cleaned Markdown                       |
| **export**      | "export to Word", "produce .docx", "send as PDF"                                       | `office-docx`, Word export                           |
| **export**      | "create a deck", "export to PPTX", "PowerPoint", "presentation"                        | `office-pptx`, PPTX export                           |
| **sync**        | "sync Word and Markdown", "reconcile this Word export with the source"                 | `office-docx`, diff report + reconciled docs         |

Callers should adapt this routing table to their environment (e.g., mapping to keybindings or scripts) without changing the orchestration semantics.

---

## Integration with Other Skills

### Architecture & EA Integration (enterprise-modeling + diagram)

`tech-documentation` **orchestrates** but does not reimplement enterprise modeling or diagramming. For all flows below, treat `IntegrationPatterns-DiagramDocsEA.md` as the **canonical reference**.

#### A. Architecture / Capability Docs (model-backed)

Use the **Architecture / Capability Docs Flow** pattern:

- **Inputs to `enterprise-modeling`**:
  - Curated enterprise text (strategy notes, capability catalogs, architecture notes, operating model descriptions).
  - Topic / viewpoint request (e.g. "capability view for Payments", "application cooperation for Order Management").
- **Outputs from `enterprise-modeling` to `tech-documentation`**:
  - Viewpoint-oriented text (capability, organization, application cooperation, value streams, etc.).
  - Diagram-ready graph slices (nodes, edges, clusters, diagram kind) with **stable entity IDs** (Neo4j-backed).
- **Calls from `tech-documentation` to `diagram`**:
  - Semantic graph slices from `enterprise-modeling` (nodes, edges, clusters, diagram kind).
  - Desired diagram format (draw.io default; Excalidraw/Mermaid or others when requested).
  - Usage context (inline Markdown image, linked `.drawio`/`.excalidraw` file, or embed-ready XML/JSON).
- **Doc assembly responsibilities**:
  - Embed viewpoint text and diagrams in the Markdown document.
  - Preserve and surface stable IDs in captions, labels, or references so docs stay aligned with the enterprise model.

#### B. Diagram-Only Flows (no enterprise model)

Use the **Diagram-Only Flow** pattern when **no enterprise model is present or desired**:

- **Inputs to `diagram`**:
  - Plain-language description of flows, structures, or relationships (e.g. UI flows, API call sequences, non-archimate process diagrams).
  - Requested diagram type (flowchart, sequence diagram, state machine, swimlane, etc.).
  - Output format preference and embedding context (inline vs. separate file).
- **Outputs from `diagram`**:
  - Diagram artifacts only (draw.io XML, Excalidraw JSON, Mermaid, etc.).
- **Constraints**:
  - `enterprise-modeling` is **not** involved; no Neo4j IDs are assumed.
  - If the caller later wants model alignment, they must explicitly call `enterprise-modeling` with relevant text and then re-bind diagrams.

#### C. Model-Driven Diagram Refresh (enterprise-modeling as source of truth)

Use the **Model-Driven Diagram Refresh Flow** pattern when the underlying enterprise model has changed:

- **Trigger / inputs**:
  - Known or suspected changes in the enterprise model (e.g. new capabilities, changed ownership, additional applications).
  - References from docs to existing diagrams and/or model views (e.g. stored artifact refs).
- **Calls to `enterprise-modeling`**:
  - Request updated viewpoints for the impacted scope.
  - Request updated diagram-ready graph slices for those viewpoints, preserving stable IDs.
- **Calls to `diagram`**:
  - Updated semantic graph slices from `enterprise-modeling`.
  - Existing diagram binding or layout hints when available (to preserve layout where formats allow).
- **Outputs / responsibilities**:
  - Regenerated or incrementally updated diagrams that remain bound to the same stable IDs.
  - Updated doc sections that reference the refreshed diagrams, keeping narrative and visuals consistent with the current model.

### Deep-Research / Research-Analysis (Research-Backed Docs)

For sections that must be **research-backed**:

- Use `deep-research` to execute multi-source research tasks when:
  - The user asks for up-to-date facts, comparisons, or external evidence.
  - A document section needs rigorous sourcing (e.g., market analysis, design trade-off analysis).
- Use `research-analysis` to:
  - Store and organize research by topic.
  - Reuse prior research across multiple documents.

`tech-documentation` is responsible for:

- Deciding **when** to invoke research skills during a documentation workflow.
- Translating research outputs into doc-ready content (summaries, citations, sidebars).
- Ensuring that citations and claims are consistent with the document’s structure and tone.

### Office artifact handling via `office-docx`, `office-pdf`, and `office-pptx`

- **PDF → Markdown (import):** Delegate to **`office-pdf`**.
- **`.docx` → Markdown (import):** Delegate to **`office-docx`**.
- **Markdown → `.docx` (export):** Delegate to **`office-docx`**.
- **Markdown / outline → `.pptx` (export):** Delegate to **`office-pptx`**.
- **Sync / diff** Markdown ↔ Word: Delegate to **`office-docx`**.

`tech-documentation` SHOULD NOT call low-level DOCX MCP tools or markdrop directly; instead it:

- Describes **what** conversion/sync behavior is needed.
- For PDF import: invokes `office-pdf`; for DOCX import/export/sync: passes Markdown, templates, and intent to `office-docx`; for PPTX creation/editing: passes intent and artifacts to `office-pptx`.

### Future Skills (Hooks)

`tech-documentation` is designed to integrate with additional documentation-adjacent skills as they mature:

- **code-discovery-for-docs** (planned):
  - Discover code, tests, and configuration relevant to a document’s topic.
  - Provide code-based evidence or examples for design/architecture docs.
- **product-knowledge-catalog** (planned):
  - Surface product and capability definitions, customer journeys, and feature catalogs.
- **documentation-governance** (planned):
  - Enforce documentation standards, review gates, and lifecycle rules across documents.

Callers SHOULD treat these as optional enhancements and not hard dependencies.

---

## MCP / Script Dependencies

`tech-documentation` itself is **MCP-agnostic** and does not bind to any particular server; instead, it:

- Expects **subskills** (e.g., `docx-documentation`, `diagram`, `enterprise-modeling`) to document and handle their own MCP dependencies.
- May interact with host-side scripts (e.g., Markdown linters, local conversion scripts) when available, but SHOULD NOT hardcode paths.

When documenting MCP usage in downstream skills:

- Follow the **Agent Skills standard** and the `skill-set` MCP mapping pattern:
  - Explicit **MCP Dependencies** section.
  - **Tool Usage Mapping** tables.
  - **Tool Safety Policy** with Safe / Requires Confirmation / Never Allowed operations.

---

## Examples

### Example 1: New Technical Design Doc (Global Context)

1. User: "Create a technical design document for our new service."
2. `tech-documentation`:
   - Collects purpose, scope, audience, constraints.
   - Chooses appropriate doc type and outline.
   - Drafts sections iteratively in Markdown.
   - Suggests diagrams and delegates to `diagram` if the user agrees.
   - Suggests research and delegates to `deep-research` for risk and trade-off sections.

### Example 2: Architecture Capability Doc (With Enterprise Model)

1. User: "Create a capability overview for our Payments domain."
2. A vault-local documentation skill calls `tech-documentation` with:
   - Vault-specific pathing and CAI/enterprise modeling context.
3. `tech-documentation` orchestrates:
   - Calls `enterprise-modeling` to retrieve relevant capabilities and viewpoints.
   - Calls `diagram` with model-derived graph slices to render capability maps.
   - Assembles narrative sections plus diagrams into a Markdown document.

### Example 3: Import Word and Clean Up

1. User: "Import this .docx runbook and clean it up into Markdown."
2. `tech-documentation`:
   - Routes to the `import` workflow.
   - Delegates conversion and cleanup to `office-docx`.
   - Receives cleaned Markdown, then:
     - Normalizes structure.
     - Proposes doc-specific audits and improvements.

### Example 4: Export to Word and PDF

1. User: "Export this architecture doc to Word and PDF."
2. `tech-documentation`:
   - Ensures Markdown is coherent and complete.
   - Delegates export to `office-docx` with template/style hints.
   - Returns paths/handles to the generated `.docx` and `.pdf` while preserving Markdown as canonical.

---

## Design Principles

- **Markdown as source of truth** for all technical documentation.
- **Orchestration over implementation**: this skill coordinates specialized capabilities rather than re-implementing them.
- **Composability** with research, modeling, diagramming, and governance skills.
- **Vault-agnostic defaults** with clear extension points for vault-local wrappers (e.g. Ai-Vault `documentation`).

