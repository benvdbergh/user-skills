# Skill scope and project-based conventions

This document is the **single source of truth** for distinguishing user-level (global) skills from project-based (vault/workspace-specific) skills, and for the functional cluster taxonomy used when mapping to the Agent Graph. It is owned by the skill-set skill and consumed by Stories 01-04 (scope analysis) and 01-05 (relationships). Do not redefine scope in those stories; reference this document.

**Related artifacts:** `environment-skill-index-map.json`, `ai-vault-skill-inventory.json`, Agent Graph spec: `self/spec/northstart-agent_graph_architecture.md`.

---

## 1. User-level skills

**Definition:** Skills that are reusable across vaults and workspaces, with no binding to a specific project, repo, or domain.

**Location:** `~/.claude/skills` (or the equivalent global `.claude` root; see `environment-skill-index-map.json` where `scope: "user"`).

**Place a capability here when:**

- The capability is **domain-agnostic** or **general-purpose** (e.g. documentation authoring, research, diagramming, coding standards).
- It does **not** depend on project-specific conventions, folder layouts, or tooling (e.g. no hard-coded paths, no project-only MCPs).
- Multiple vaults or workspaces can use it without duplication (e.g. “how to write a spec”, “how to run deep research”).
- Ownership and versioning are at **user** level (one copy per user/machine).

**Conventions:**

- User-level skills are discovered via the **user** environment’s `skill_index_path` in `environment-skill-index-map.json`.
- Naming and structure follow the skill-set standard (e.g. `SKILL.md`, references under `references/`).

---

## 2. Project-based skills

**Definition:** Skills that are vault- or workspace-specific: they encode project conventions, domain knowledge, or tooling tied to a single project.

**Location:** A project’s `.claude/skills` (e.g. `<workspace_root>/.claude/skills`). Each such project is an **environment** in the catalog with `scope: "vault"` and its own `skill_index_path` in `environment-skill-index-map.json`.

**Place a capability here when:**

- The capability is **tied to this vault/workspace** (e.g. “how we document in this repo”, “how we sync to this Confluence space”).
- It depends on **project-specific** paths, config, MCPs, or conventions (e.g. `.cursor/rules`, project-only tools).
- It implements **domain or process** that only makes sense in this project (e.g. “enterprise modeling for this company’s Neo4j + Obsidian setup”).
- You want **project-owned** versioning and changes without affecting other vaults.

**Conventions:**

- Project-based skills are discovered via each vault environment’s `skill_index_path` in `environment-skill-index-map.json`.
- The same skill-set standard applies (SKILL.md, references, etc.); only the **root** and **scope** differ from user-level.

---

## 3. Functional clusters (hubs) and Agent Graph mapping

A small set of **functional clusters** is used to group skills for analysis and for mapping to the Agent Graph. Keep the set small to avoid overfitting.

| Cluster | Inclusion criteria | Agent Graph mapping |
|--------|---------------------|----------------------|
| **Documentation** | Authoring, structuring, enriching, or syncing documents (specs, reports, guides, Markdown/Word); quality and format handling. | **Skill nodes** — reusable procedures for document workflows. |
| **Research** | Deep research, multi-source analysis, topic lookup, framework comparison, synthesis with citations. | **Skill nodes** — research procedures and workflows. |
| **Architecture** | Software/system design, architecture decisions, topology, patterns, EA/ArchiMate, diagramming for architecture. | **Skill nodes** — design and modeling procedures. |
| **Orchestration** | Workflow design, project planning, epics/stories, multi-step coordination, agent/skill composition. | **Skill nodes** — orchestration and planning procedures. |
| **Governance** | Validation, compliance, permissions, safety, version control of artifacts, auditability. | **Skill nodes** — governance and validation procedures. |
| **Context (sources)** | *Not a skill cluster.* Represents **sources of information** agents can perceive: docs, repos, KBs, vector stores, APIs. | **Context nodes** (Agent Graph §5.5) — context sources, not skills. |

**Agent Graph reference:** In `self/spec/northstart-agent_graph_architecture.md`:

- **Skill nodes** (§5.2): encapsulate reusable capabilities/procedures; invoked by Agents; relationships such as `SKILL_USES_WORKFLOW`, `SKILL_MAY_USE_TOOL`. The clusters above (documentation, research, architecture, orchestration, governance) map to **Skill** nodes when we model capabilities in the graph.
- **Context nodes** (§5.5): represent **context sources** (documentation repos, Git repos, knowledge bases, vector DBs, external APIs). These are *what* an agent can perceive, not *what* it can do. Mapping: project-or-user **context sources** (e.g. “this repo”, “this Confluence space”) → Context nodes; **capabilities** (our SKILL.md procedures) → Skill nodes.

So: **clusters = grouping of skills → Skill nodes**; **context sources (docs, repos, KBs) → Context nodes**. Scope (user vs project) is orthogonal: both user-level and project-based skills can belong to any cluster and still map to Skill nodes; the difference is only where they live and when they are loaded.

---

## 4. Stability for downstream stories

- **Story 01-04 (scope analysis):** Use §1 and §2 to classify each skill as user-level or project-based; use §3 only for optional cluster tags.
- **Story 01-05 (relationships):** Use §1 and §2 for scope when defining skill–skill or skill–context relationships; use §3 when attaching skills to Agent Graph Skill/Context regions.
- Do **not** redefine “user-level”, “project-based”, or cluster semantics in 01-04 or 01-05; cite this document instead.

---

*Last updated: 2026-03-11. Owner: skill-set catalog.*
