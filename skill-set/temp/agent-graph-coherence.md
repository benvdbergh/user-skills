---
title: Agent Graph Coherence Report
type: report
epic_id: epic-01-skill-inventory-map
stories:
  - story-01-01-catalog-environment-map
  - story-01-02-inventory-project-level
  - story-01-03-scope-project-based-conventions
  - story-01-04-scope-analysis
  - story-01-05-capture-relationships-dependencies
  - story-01-06-coherence-analysis-agent-graph
generated: 2026-03-11
owner: skill-set
---

# Agent Graph Coherence Report (Epic-01)

## 1. Inputs and Method

This report synthesizes the following Epic-01 artifacts:

- **Environment map**: `environment-skill-index-map.json`
- **Project-level inventory**: `ai-vault-skill-inventory.json`
- **Scope & conventions**: `scope-and-conventions.md`
- **Scope analysis**: `scope-analysis.json`
- **Skill relationship map**: `maps/skill-relationships.json`
- **Agent Graph spec**: `self/spec/northstart-agent_graph_architecture.md`

Method:

- Treat the Agent Graph spec as the reference model for **node types** (Agents, Skills, Tools, Workflows, Context, Memory, Events, Schedulers) and their **relationships**.
- Check whether the catalog artifacts give a coherent, minimally redundant view of skills and their relationships across **user** and **project** scopes.
- Identify where the current landscape is **compatible** with the Agent Graph and where additional structure or refactors are needed (gaps, mismatches).

## 2. High-Level Coherence Assessment

**Overall verdict:** The current skill landscape is **broadly cohesive and compatible** with the Agent Graph vision at the **Skill/Tool/Workflow** layer, but:

- Several **project-scoped skills** are flagged as **generic-capability-globalizable** or **thin-wrapper** in the scope analysis and should be moved or split toward **user-level** scope.
- The catalog primarily models **Skills** and their relationships; there is **no explicit modeling** yet of **Agents, Context nodes, Memory, Events, or Schedulers** as first-class graph elements.
- The relationship map uses **approximate Skill→Skill and Skill→Tool edge types** that conceptually match Agent Graph edges, but the **edge vocabulary is not yet normalized** to the spec.

The artifacts are sufficient for Epic 2 to plan refactors and for an initial Agent Graph import focused on **Skill and Tool nodes**, but additional work is required to:

- Normalize **scope placement** (user vs project) where analysis recommends changes.
- Introduce **graph identifiers and edge fields** into inventories and relationships.
- Model **Agents, Context, and governance** explicitly rather than implicitly.

## 3. Detailed Findings

### 3.1 Environment Map and Inventories

**Alignment**

- `environment-skill-index-map.json` cleanly distinguishes:
  - `user` environment → global `.claude` skills.
  - `ai-vault` environment → project/vault-level skills.
- `ai-vault-skill-inventory.json` documents each Ai‑Vault skill with:
  - `name`, `path`, `purpose_summary`, `primary_triggers`, `workflows`, `tier`, `standard_version`, and `indication`.
- This matches Epic-01 objectives and is **compatible** with Agent Graph **Skill nodes**:
  - Each inventory entry can become a Skill node with attributes derived from this schema.

**Gaps / Mismatches**

- The inventory does **not yet include**:
  - A stable **graph identifier** (e.g. `graph_id` or `skill_id`) for importing into an Agent Graph.
  - Explicit reference to **Agent Graph role** (e.g. `Skill`, `Workflow`, `Tool-wrapper`, `Governance`) even though this is captured in `scope-analysis.json`.
  - Direct linkage to **relationship edges** (e.g. a list of outgoing relationship ids or types per skill).
- Some Ai‑Vault skills (e.g. `documentation`, `market-segmentation-research`, `search-company-knowledge`) are marked as:
  - `indication: "generic-capability-globalizable"` or
  - recommended `move-to-user` / `split` in `scope-analysis.json`.
  These are **scope mismatches** relative to the conventions.

### 3.2 Scope & Conventions vs Scope Analysis

**Alignment**

- `scope-and-conventions.md`:
  - Clearly distinguishes **user-level** vs **project-based** placement.
  - Defines **functional clusters** (documentation, research, architecture, orchestration, governance) and how they map to **Agent Graph Skill vs Context nodes**.
- `scope-analysis.json`:
  - Applies these conventions consistently, assigning each analyzed skill:
    - `scope`, `assessment` (yes/no/unclear),
    - `recommendation` (e.g. `move-to-user`, `split`, `reformat`),
    - and **Agent Graph role** (e.g. `Skill`, `Workflow`, `Tool-wrapper`, `Governance`).
- Together, they provide a **coherent rationale** for where each capability should live and how it will eventually map into Agent Graph **Skill nodes**.

**Gaps / Mismatches**

- Recommendations in `scope-analysis.json` are **not yet reflected** in:
  - The **Ai‑Vault inventory** schema (no explicit fields for `agent_graph_role`, `scope_assessment`, or `planned_action`).
  - Any **migration plan** or **backlog** for moving / splitting / reformatting skills in Epic 2.
- The conventions explicitly call out **Context nodes** as non-skill clusters, but:
  - There is **no separate catalog** of Context sources (e.g. repositories, Confluence spaces, Neo4j graph, MCP servers).
  - Context currently appears only **implicitly** via skills’ descriptions and MCP references.

### 3.3 Relationship/Dependency Map

**Alignment**

- `maps/skill-relationships.json`:
  - Defines a **relationship type catalog** (`may_call_or_wrap`, `shares_mcp_tool_script`, `overlaps_or_duplicates_capability`, `specialized_version_of`).
  - For each relationship type, maps to **candidate Agent Graph edge types** (often `SKILL_MAY_USE_TOOL`, `SKILL_USES_WORKFLOW`, or `depends_on`).
  - Captures concrete relationships with **evidence**, **confidence scores**, and explicit **high-risk refactor sequences** (e.g. around `deep-research`, Atlassian MCP, `diagram` + branding).
- This aligns well with the Agent Graph’s focus on:
  - Explicit **Skill→Tool** edges (`SKILL_MAY_USE_TOOL`).
  - **Dependency structure** for planning safe refactor sequences.

**Gaps / Mismatches**

- The Agent Graph spec does **not yet define**:
  - A formal **Skill→Skill edge vocabulary** (e.g. `DEPENDS_ON`, `SPECIALIZES`, `OVERLAPS_WITH`).
  - This is handled via a generic `depends_on` placeholder in the relationship map, which is marked as **approximate**.
- High-risk sequences are captured in narrative form (arrays of `downstream_skills` and `suggested_safe_sequence`) but:
  - They are not yet represented as **edges with priorities** or **graph paths** that a planner could traverse directly.
  - There is no explicit notion of **governance nodes** or **change policies** for these high-risk areas.

### 3.4 Agent Graph Compatibility (Node/Edge Coverage)

**What is well-covered**

- **Skill nodes**: User-level and Ai‑Vault skills are well-documented; many have implied **internal workflows** and explicit Tool dependencies.
- **Tool nodes**: MCP dependencies (e.g. `neo4j`, `user-mcp-atlassian`, `user-excalidraw`, `word-document-server`) are clearly called out in skills and in the relationship map.
- **Workflow patterns**: Skills like `project-planning`, `specification`, `deep-research`, `document-deep-merge`, and `diagram` embody recognizable workflow structures that can be imported as Agent Graph **Workflow subgraphs**.

**What is partially covered or missing**

- **Agent nodes**:
  - There is no explicit catalog of Agents (e.g. `ArchitectAgent`, `ResearchAgent`, `PlannerAgent`) and which Skills they own (`AGENT_HAS_SKILL`).
- **Context nodes**:
  - Context sources (repos, Obsidian vaults, Confluence spaces, Neo4j graph) are referenced only via skill descriptions and MCP references.
  - There is no list of **Context nodes** with `CONTEXT_AVAILABLE_TO` relationships.
- **Memory nodes**:
  - Skills like `research-analysis` imply structured memory but there is no explicit **Memory node catalog**.
- **Events / Schedulers**:
  - No current artifacts describe **event triggers** or **recurring automation** (`EVENT_TRIGGERS`, `SCHEDULER_RUNS`).
- **Governance**:
  - Skills such as `skill-set` and `version-control` clearly play a **Governance** role, but there is no explicit governance model (nodes/edges) in the catalog.

## 4. Gaps, Mismatches, and Implications

### 4.1 Scope Placement Issues

From `scope-analysis.json`:

- **Should likely move to user-level**:
  - `documentation`
  - `market-segmentation-research`
  - `search-company-knowledge`
- **Should likely be split** (user-level + project-level context/config):
  - `kion-design`
  - `obsidian-confluence-sync`
- **Governance skill** (`skill-set`) should have a **single canonical user-level definition**; project-level variants should be treated as data/catalog, not duplicated implementations.

**Implication for Agent Graph:** without resolving these, the graph risks:

- Duplicate or overlapping Skill nodes at different scopes.
- Blurred boundaries between generic and Ai‑Vault-specific capabilities.

### 4.2 Incomplete Node Types

The current artifacts are **skill-centric**. This is acceptable for Epic 1 but:

- Agent Graph imports will initially be **limited** to Skills, Tools, and partial Workflows.
- Additional modeling work is needed in Epic 2+ to:
  - Define **Agent nodes** and attach Skills/Tools/Context to them.
  - Enumerate **Context nodes** (repos, knowledge bases, MCP servers) with clear ownership.
  - Introduce **Memory, Event, and Scheduler** nodes where appropriate.

### 4.3 Edge Vocabulary Normalization

- The relationship map uses `depends_on` as a generic placeholder for many Skill→Skill relations.
- Agent Graph will eventually need:
  - More precise edge types: e.g. `SPECIALIZES`, `OVERLAPS_WITH`, `DELEGATES_TO_SKILL`, `COMPOSES_WITH`.
  - Clear mapping between **catalog relationship types** and **graph edge types**.

Without this normalization, the graph will still be useful, but:

- Automated reasoning about refactors and topology will be less precise.

## 5. Recommendations and Follow-Ups (for Epic 2 and Agent Graph Work)

### 5.1 Inventory and Schema Enhancements

Add or refine fields in `ai-vault-skill-inventory.json` (and any future user-level inventories) to include:

- `graph_skill_id`: stable identifier for Agent Graph import.
- `agent_graph_role`: copy from `scope-analysis.json` (`Skill`, `Workflow`, `Tool-wrapper`, `Governance`).
- `scope_assessment`: reference to scope analysis outcome (`assessment`, `recommendation`).
- `relationships`: optional list of relationship ids/types from `skill-relationships.json`.
- `high_risk_refactor_tags`: optional tags referencing `high_risk_refactor_sequences` ids where the skill participates.

### 5.2 Execute Scope Refactor Plan (Epic 2)

Based on `scope-analysis.json`:

- Plan and execute moves/splits so that:
  - Generic/globalizable capabilities are **user-level**.
  - Project-level skills are reserved for **Ai‑Vault-specific** behavior or configuration.
- Ensure Ai‑Vault inventory remains accurate by:
  - Updating entries when a skill moves or splits.
  - Treating inventory records as the **source of truth** for where each skill now lives.

### 5.3 Expand Catalog Beyond Skills

Introduce small, focused catalogs for:

- **Agents** (planned): names, roles, attached skills and tools.
- **Context sources**: repos, vaults, Confluence spaces, Neo4j graph, MCP servers.
- **Governance policies**: high-level rules for tool permissioning, context isolation, and high-risk change areas.

These can live alongside the existing catalog/maps and share the same `environment_id` / scope semantics.

### 5.4 Normalize Relationship Vocabulary

- Promote the relationship-type catalog in `skill-relationships.json` into a **shared edge vocabulary** for Agent Graph imports.
- Propose new explicit graph edge types where needed (ontology extension), e.g.:
  - `SKILL_SPECIALIZES_SKILL`
  - `SKILL_OVERLAPS_SKILL`
  - `SKILL_COMPOSES_WITH_SKILL`

## 6. How to Use This Skill Map (Epic 2 & Agent Graph)

- **For Epic 2 refactoring**:
  - Use `scope-analysis.json` plus this report to prioritize:
    - Scope moves/splits (`move-to-user`, `split`, `reformat`).
    - Changes touching **high-risk sequences** (`deep-research`, Atlassian MCP, `diagram` + branding, specification→planning).
  - Treat the Ai‑Vault inventory as the **live index** to keep in sync as skills move or are re-scoped.
- **For Agent Graph modeling**:
  - Use the environment map and inventories to seed **Skill** and **Tool** nodes.
  - Use `skill-relationships.json` to seed preliminary **Skill→Skill** and **Skill→Tool** edges (with approximate types where necessary).
  - Plan separate modeling passes to introduce **Agent**, **Context**, **Memory**, **Event**, and **Scheduler** nodes.

In summary, Epic-01 has produced a coherent, skill-centric view of the environment that is **ready to feed Epic 2 refactors and initial Agent Graph imports**, with clearly documented gaps and next steps for full graph-native modeling.

