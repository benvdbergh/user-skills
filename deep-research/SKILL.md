---
name: deep-research
description: >-
  Multi-agent deep research engine that decomposes complex queries into parallel
  research branches, executes iterative assess-act-observe-refine loops, resolves
  source conflicts, self-critiques for completeness, and produces structured
  cited reports. Use when deep research, comprehensive research, thorough
  analysis, multi-source investigation, research report, deep dive, exhaustive
  research, OR user needs a long-running research task with citations.
license: MIT
metadata:
  author: PAI
  version: 1.0.0
---

# deep-research

Multi-agent deep research engine inspired by Gemini Deep Research. Decomposes complex queries into parallel research branches using Cursor's Task sub-agents, executes iterative Assess-Act-Observe-Refine loops via WebSearch and WebFetch, cross-validates findings across sources, and produces structured multi-section reports with full citation mapping.

## How It Differs from research-analysis

| Concern | research-analysis | deep-research |
|---------|-------------------|---------------|
| Focus | Knowledge management, topic storage, lookup | Research **execution engine** |
| Depth | Single-pass parallel agents | Iterative multi-hop ReAct loops |
| Validation | Template completeness check | Conflict resolution, self-critique, re-research |
| Citations | Metadata references | Every claim mapped to a source URL |
| Duration | Seconds to minutes | 3-20 minutes (long-running) |
| Output | Topic document for knowledge base | Standalone cited research report |

Compose the two: use deep-research for execution, then store results via research-analysis's topic management.

## Architecture Overview

**Phases:** (1) **PLANNING** — decompose query into branches, present plan for user approval. (2) **EXECUTION** — spawn up to 4 parallel Task sub-agents, each running an Assess-Act-Observe-Refine loop with max 5 search hops. (3) **SYNTHESIS** — merge branch results, resolve source conflicts, self-critique and grade each section, re-research gaps, map citations. (4) **DELIVERY** — structured report with executive summary, confidence ratings, and citation appendix.

## Purpose & Scope

deep-research is a **portable, vault-agnostic execution engine**. It owns:

- **Planning and orchestration** of multi-branch, multi-hop research.
- **Tool usage** (Task/WebSearch/WebFetch/etc.) and ReAct-style reasoning.
- **Report synthesis** into a stable, cited research artifact.

It explicitly **does not own**:

- Knowledge base folder layouts or path conventions.
- Topic/category taxonomies or project naming schemes.
- Long-term persistence of research topics inside a specific vault.

Those concerns belong to **knowledge integration skills** (e.g. `research-analysis` globally, or vault-local adapters such as an Ai-Vault `vault-research-integration` skill).

## Inputs & Outputs Contract

At a high level:

- **Inputs**
  - `research_request`: user goal/question plus any constraints (time horizon, depth, regions, etc.).
  - `context`: optional prior materials (documents, topic references, links) supplied by upstream skills.
  - `kb_adapter` (optional): abstract interface providing topic/source resolution and persistence hooks.
- **Outputs**
  - `research_report`: structured, cited report (sections, claims, citations, confidence).
  - `trace_metadata`: branch-level logs (plans, hops, self-critiques) for debugging/auditing.
  - `kb_integration_calls` (optional): list of calls made to a knowledge base adapter (see below).

The **report shape** (sections + citation mapping) is stable and intended for downstream reuse by skills such as `research-analysis`, `document-deep-merge`, `web-visual`, or vault-local research skills.

## Cooperation with enterprise-modeling and diagram

deep-research **does not** perform enterprise modeling or diagramming itself. Instead, it:

- Identifies **findings and sections** where an enterprise model or structured diagrams would add value (e.g. operating model descriptions, capability definitions, architecture patterns, recurring flows).
- Suggests **follow-up actions**, such as:
  - "Call `enterprise-modeling` with these excerpts and candidate entities/relationships."
  - "Call `diagram` to visualize this flow, lifecycle, or architecture using the suggested graph skeleton."
- Leaves all **ontology, Neo4j, and ArchiMate semantics** to the `enterprise-modeling` skill.
- Leaves all **diagram semantics and formats** (draw.io, Excalidraw, Mermaid, etc.) to the `diagram` skill.

When running inside environments like Ai-Vault:

- deep-research may be composed with:
  - `enterprise-modeling` for text→model workflows (see `IntegrationPatterns-DiagramDocsEA.md` in the Ai-Vault enterprise-modeling skill).
  - `diagram` for diagram-only or model-backed visualization flows.
- Vault-local adapters such as `vault-research-integration` are responsible for actually **calling** those skills and managing paths/notes; deep-research only **signals** where such calls are useful.

## Structured Output Hooks for Downstream Skills

To make cooperation with `enterprise-modeling`, `diagram`, `tech-documentation`, and vault-local adapters reliable, deep-research SHOULD expose additional, structured hooks inside `research_report`. These are **schema contracts**, not hard API types:

- `implications_for_enterprise_model` (optional)
  - Purpose: Provide candidates that `enterprise-modeling` can treat as input hints when building or updating the enterprise model.
  - Shape (conceptual):
    - `scope`: short description of what part of the enterprise is affected (e.g. "Customer Onboarding", "Payments capabilities").
    - `candidate_entities`: list of objects with fields such as:
      - `label`: human-readable name.
      - `description`: summary of role/meaning.
      - `suggested_archimate_type`: when guessable (e.g. BusinessCapability, BusinessProcess, ApplicationComponent).
      - `confidence_score`: 0–1, how confident the engine is in this candidate.
      - `assumptions`: free-text list of key assumptions behind the suggestion.
    - `candidate_relationships`: list of objects with fields such as:
      - `source_candidate_ref`: reference to a candidate entity (by local ID or label).
      - `target_candidate_ref`: reference to another candidate entity.
      - `relationship_type_hypothesis`: textual description or suggested ArchiMate relation.
      - `confidence_score`: 0–1.
      - `assumptions`: free-text notes.
    - `notes_for_modeler`: free-text guidance for a human or `enterprise-modeling` about how to interpret these hints.

- `suggested_visualizations` (optional)
  - Purpose: Provide diagram suggestions that `diagram` (and documentation skills) can use to generate visuals.
  - Shape (conceptual):
    - `diagram_type`: e.g. "capability map", "sequence diagram", "customer journey", "context diagram", "flowchart".
    - `scope`: narrative description of what the diagram should cover.
    - `key_nodes`: list of node descriptors (labels, brief descriptions, optional tags such as role/system/activity).
    - `key_edges`: list of edge descriptors (from/to node refs, relation description, optional direction).
    - `priority`: relative importance (e.g. high/medium/low or 1–5) to help downstream orchestration pick which diagrams to generate first.
    - `related_sections`: references into the `research_report` (e.g. section IDs or headings) where this visualization is most relevant.

Downstream skills MAY:

- Ignore these hooks entirely (preserving backward compatibility).
- Consume them directly (e.g. `vault-research-integration` passing `implications_for_enterprise_model` into `enterprise-modeling` workflows).
- Transform them into vault-specific structures (e.g. tech docs sections, EA modeling tasks, diagram generation requests).

## KB Integration Abstraction

deep-research assumes **no concrete file paths or vault layouts**. Instead, when a knowledge base is available, it interacts through a thin abstraction (conceptual API, not literal code):

- `resolve_topic(request) -> topic_handle?`
  - Given a `research_request`, return an existing topic handle if one already exists, or `null`/`undefined` if this is new ground.
- `find_seed_sources(topic_handle | request) -> [source_descriptor]`
  - Locate seed documents/links (internal or external) relevant to the topic.
- `expand_sources(seed_sources, options) -> [source_descriptor]`
  - Optional: broaden the source set (e.g. related topics, prior projects, adjacent domains).
- `fetch_document_content(source_descriptor) -> { content, metadata }`
  - Retrieve full text and metadata needed inside the research loop.
- `store_research_result(result) -> persisted_handle`
  - Persist the final `research_report` (or a transformed variant) into the knowledge base.

Where:

- `topic_handle` is an opaque identifier that downstream skills (e.g. `research-analysis`, vault-local adapters) understand.
- `source_descriptor` is a lightweight pointer (path, URL, MCP resource id, etc.) plus minimal metadata.

In practice:

- **Global user-level flows** typically surface this abstraction via `research-analysis` (topic and knowledge management).
- **Vault-local flows** (e.g. Ai-Vault) should implement the same conceptual operations in a **vault-specific integration skill** such as `vault-research-integration`.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **research** | "deep research on X", "research X thoroughly", "comprehensive analysis of X" | `references/research-workflow.md` |

**Supporting references:** Sub-agent prompt templates are in `references/agent-prompts.md`. Output templates are in `assets/report-template.md` and `assets/research-plan-template.md`.

## Tool Capabilities

This skill orchestrates built-in Cursor and Claude tools. No external MCP servers required.

| Tool | Role in Workflow |
|------|-----------------|
| `Task` (generalPurpose) | Spawn parallel research sub-agents for independent branches |
| `Task` (explore) | Quick codebase/file exploration when researching local projects |
| `WebSearch` | Live web search within ReAct loops |
| `WebFetch` | Fetch and parse full page content from discovered URLs |
| `Write` | Save research plan and final report to disk |
| `Read` | Load templates and intermediate results |

## Guardrails

- **Max 4 concurrent sub-agents** per Cursor Task limits
- **Max 5 search hops** per research branch to prevent infinite loops
- **Max 2 re-research cycles** during self-critique before accepting results
- **Plan approval gate**: present plan to user before execution begins
- **No destructive operations**: read-only sub-agents where possible

## Examples

**Example 1: Technology deep research**

```
User: "Deep research on vector database architectures for RAG systems"
→ Phase 1: Decomposes into 4 branches:
  [RESEARCH] Embedding storage strategies (HNSW, IVF, PQ)
  [RESEARCH] Top vector DBs comparison (Pinecone, Weaviate, Qdrant, Milvus)
  [RESEARCH] RAG-specific integration patterns
  [DELIVERABLE] Comparison matrix with benchmarks
→ Presents plan for approval
→ Phase 2: Spawns 4 parallel Task agents, each searching 10-20 sources
→ Phase 3: Resolves conflicting benchmark numbers, grades each section
→ Phase 4: Delivers 8-section report with 30+ citations
Duration: ~8 minutes
```

**Example 2: Market deep research**

```
User: "Comprehensive research on the autonomous mobile robot market in warehousing"
→ Phase 1: Decomposes into branches:
  [RESEARCH] Market size and growth projections
  [RESEARCH] Key players and competitive positioning
  [RESEARCH] Technology trends (navigation, fleet management)
  [RESEARCH] Customer adoption patterns and barriers
  [DELIVERABLE] Market landscape summary with data tables
→ Phase 2: Parallel execution across market data, press releases, analyst reports
→ Phase 3: Cross-validates market size figures across sources, notes discrepancies
→ Phase 4: Structured market report with confidence ratings per data point
Duration: ~12 minutes
```

**Example 3: Technical architecture research**

```
User: "Deep research on event-driven microservices patterns for IoT platforms"
→ Phase 1: Plans research across architecture patterns, message brokers,
  real-world case studies, and failure modes
→ Phase 2: Sub-agents research MQTT/Kafka/NATS patterns, cloud provider
  implementations, production postmortems
→ Phase 3: Synthesizes architecture recommendations, validates against
  multiple case studies
→ Phase 4: Architecture report with pattern recommendations and trade-off analysis
Duration: ~10 minutes
```

## Composability

| Skill | Integration |
|-------|-------------|
| **research-analysis** | Consumes deep-research reports and, when configured, acts as a topic/knowledge manager implementing the KB integration abstraction. |
| **vault-research-integration (Ai-Vault or other vault-local)** | Provides vault-specific adapters for topic resolution, KB lookups, and persistence; deep-research interacts only through the abstract operations described above. |
| **specification** | Feeds research findings into PRD/spec generation. |
| **project-planning** | Uses research reports to inform epic/story planning. |
| **architecture** | Uses research outputs to inform architecture model decisions. |

## Vault Integration

deep-research **does not assume** the presence of any particular vault. Instead:

- When **no vault-local integration skill** is available:
  - It MAY operate in a **stateless mode**, returning reports to the caller without persisting them.
  - Callers (including ad-hoc chats) are responsible for saving the report (e.g. to a file or note) if desired.
- When a **vault-local research integration skill** is available (e.g. Ai-Vault `vault-research-integration`):
  - That skill is responsible for:
    - Mapping topics/requests to vault-specific structures (folders, note types, indices).
    - Providing `resolve_topic`, `find_seed_sources`, `expand_sources`, `fetch_document_content`, and `store_research_result`.
    - Deciding whether/how deep-research outputs are written back (e.g. topic notes, intelligence dossiers, project briefs).
  - deep-research treats the adapter as an opaque collaborator and remains portable across vaults and environments.

## Quick Start

1. Invoke: "deep research on [your topic]"
2. Review the generated research plan
3. Approve (or request modifications)
4. Wait for autonomous execution (3-20 minutes)
5. Receive structured report with citations
