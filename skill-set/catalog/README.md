# skill-set catalog

This directory is the **skill-set catalog**: the canonical place for skill-set’s view of the agentic ecosystem. It is owned by the skill-set skill (`skills/skill-set/SKILL.md`).

## Contents

**Durable artifacts** (governed by skill-set; see `skills/skill-set/SKILL.md` § Catalog and Maps):

| File | Purpose |
|------|--------|
| `environment-skill-index-map.json` | Single source of truth listing every **environment** (each place the agent runs) and the path to that environment’s local `skill-index.json`. |
| `ai-vault-skill-inventory.json` | Project-level skill inventory for Ai-Vault: name, path, purpose, triggers, workflows, tier, indication. Canonical list for this vault. |
| `scope-and-conventions.md` | Scope and project-based skill conventions: user-level vs project-based placement, functional clusters (hubs), and Agent Graph Skill/Context mapping. Reference this when classifying scope; do not redefine elsewhere. |
| `README.md` | This file; documents schema and usage. |

**Relationship map** (in `skills/skill-set/maps/`):

| File | Purpose |
|------|--------|
| `maps/skill-relationships.json` | Skill Relationship Map: relationship types (e.g. may_call_or_wrap, shares_mcp_tool_script), edges, and high-risk refactor sequences. Use when planning refactor order. |

**Temporary / analysis outputs** (not governed as durable catalog; may be regenerated):

- `scope-analysis.json` — per-skill scope analysis and recommendations.
- `agent-graph-coherence.md` — coherence report vs Agent Graph spec.

## Schema: `environment-skill-index-map.json`

Machine-readable JSON. Root fields:

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Schema version (currently 1). |
| `updated` | string (ISO 8601) | Last update timestamp. |
| `description` | string | Human-readable purpose of the file. |
| `environments` | array | List of environment objects. |

Each **environment** object:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Stable identifier (e.g. `user`, `ai-vault`). Used by scripts and downstream stories. |
| `scope` | string | No | `user` = global/user-level; `vault` = project/workspace-level. Optional, for filtering. |
| `path` | string | Yes | Absolute path to the environment root (e.g. `~/.claude` or workspace root). |
| `skill_index_path` | string | Yes | Absolute path to that environment’s local `skill-index.json`. |
| `display_name` | string | No | Human-readable name for UI or reports. |

Paths are stored as absolute paths so that tooling can resolve them without extra config. On Windows, backslashes are escaped in JSON (`\\`).

## Usage

- **Story 01-02, 01-06** and skill-set workflows (e.g. inventory refresh) **MUST** read this file to discover all environments and their skill indexes.
- To add an environment: add a new object to `environments` with `id`, `path`, and `skill_index_path` (and optionally `scope`, `display_name`).
- To remove an environment: delete its entry from `environments` and bump `updated`.

## Discovery note

Environments are: (1) the global/user-level `.claude` (single skill-index), and (2) each project or workspace root that has a local `.claude/skills/skill-index.json`. There is no requirement for a `~/.claude/projects` directory; workspace roots (e.g. Ai-Vault) are discovered by convention.
