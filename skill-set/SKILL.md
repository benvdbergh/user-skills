---
name: skill-set
description: >-
  Lifecycle management for agent skills: create, validate, optimize, lint, and
  canonicalize. Includes authoring best practices (description design, token
  efficiency, patterns, anti-patterns). Use when creating a new skill,
  validating skill effectiveness, reviewing skill quality, refining skills from
  feedback, canonicalizing existing skills, fixing skill compliance issues, or
  migrating skills to the Agent Skills standard. Do not use for one-off prompts
  or project rules; use for skill lifecycle only.
license: MIT
metadata:
  author: PAI
  version: 2.8.0
---

# skill-set

Skill lifecycle framework for all skill creation, validation, optimization, and migration.

## Authoritative Source

**Before ANY skill operation, READ:** `references/standard-reference.md`.

This defines the required structure, naming conventions (kebab-case), and directory layout for all skills.

**For catalog and map operations** (inventory refresh, environment map, scope conventions, relationship map), also read `catalog/README.md` for schema and update rules.

## Tool Integration Protocol

When creating a skill that requires external actions (API, DB, Shell, MCP tools), follow this protocol:

### 1. Discover: MCP Capability Audit

**Required step** when the skill involves any external side-effects:
- Run `list_mcp_resources` to discover available MCP servers and tools
- Map skill requirements to available MCP capabilities
- Identify gaps: If required MCP tools are missing, inform user and halt creation
- Document discovered MCP servers and tools in the new skill

### 2. Map: Tool Usage Documentation

In the new skill's `SKILL.md`, explicitly document MCP integration:

```markdown
## MCP Dependencies
- **Server**: `{server-name}`
- **Primary Tools**: `{tool1}`, `{tool2}`, `{tool3}`
- **Usage**: Brief description of how each tool is used

## Tool Usage Mapping
| Workflow Step | MCP Tool | Purpose | Safety Level |
|---------------|----------|---------|--------------|
| Step 1 | `tool_name` | Create resource | Safe |
| Step 2 | `tool_name` | Delete resource | Requires Confirmation |
```

### 3. Guardrail: Tool Safety Policy

Define specific constraints for MCP tool usage:

```markdown
## Tool Safety Policy
- **Safe Operations**: When tools can run automatically
- **Requires Confirmation**: When user input is needed
- **Never Allowed**: Operations that should be blocked
```

## MCP Integration Best Practices

### Architecture Principle

**MCPs are the "capabilities" and Skills are the "orchestrators."**

- Skills define the workflow and orchestration logic
- MCP tools provide the actual execution capabilities
- Skills must explicitly map which MCP tools are used for which steps

### Prevention of Hallucination

By embedding `list_mcp_resources` into the skill creation workflow, we ensure:
- Every skill is grounded in reality
- No "hallucinated" capabilities that don't exist
- Clear gap identification when MCPs are missing
- User is informed if required MCP must be installed first

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **synthesize** | "create a new skill", "new skill", "build skill" | `references/synthesize.md` |
| **validate** | "validate skill", "review skill quality", "is this skill effective?", "deep review", "effectiveness assessment", "quality analysis" | `references/validate.md` (workflow); [effectiveness-assessment.md](references/effectiveness-assessment.md) (report synthesis / quality narrative) |
| **optimize** | "optimize skill", "improve skill", "refine skill" | `references/optimize.md` |
| **lint** | "lint skill", "check skill structure", "check compliance" | `references/lint.md` |
| **canonicalize** | "canonicalize", "migrate skill", "fix skill" | `references/canonicalize.md` |
| **vendor-skills** | "third-party skill", "vendor skill", "embed upstream skill", "sync skill from github" | `references/vendor-skills.md` |

**Quick Reference:** See `references/standard-reference.md` for the Agent Skills standard rules at a glance.

**Authoring best practices:** For description design (third person, WHAT + WHEN), token efficiency, common patterns, and anti-patterns, see `references/authoring-guide.md`. Use when writing or refining skill content.

**Scripts in skills:** For LLM-vs-script division of labor, one runtime per skill, `scripts/lib/`, `--help` on entrypoints, and stdout shaped for agents, see `references/skill-scripts.md`.

**Lint vs. Validate:** Lint checks structural compliance (naming, frontmatter, files). Validate evaluates content effectiveness (instruction quality, token efficiency, ecosystem fit) and, on a full run, appends an **effectiveness assessment** (domain quality bar, ecosystem map, goals→design, proposed shape—see `references/effectiveness-assessment.md`). The **workflow steps** are in `references/validate.md`; the **assessment template** is in `references/effectiveness-assessment.md`. Run lint first, then validate.

**Post-change hygiene (quality + efficiency):**

- **Structure:** For skills with several subject areas, use **topic-scoped** `references/*.md` files (examples, market-standards, frameworks, no-gos, links per topic) and keep **workflow routing + topic map + agent steps** in `SKILL.md`—avoid a duplicate hub file under `references/`. Details: `references/authoring-guide.md` (*Topic-scoped reference files*).
- **Boundary standard:** Every new skill MUST include `references/skill-escalation.md` describing ownership boundaries (`owns` / `does not own`) and explicit escalation paths to adjacent skills.
- **Grounding:** Prefer **citable external specs/guides** for “best practices” content; extend `prior-art` (or equivalent) when adding major sources.
- **Discovery metadata:** After changing frontmatter `name`/`description`, adding/removing a skill folder, or reshaping workflows—run `scripts/update_skill_index.py` on the correct `<skills-root>`; use `--with-relationship-map` (`-R`) to refresh `skill-set/maps/skill-relationships.json` skill lists.
- **Versioning:** Bump the skill’s `metadata.version` when behavior or structure changes materially.
- **Git:** Commit from the repository that **contains** `<skills-root>` (often a dedicated `skills` repo; do not assume the parent `.claude/` folder is the git root).

## Catalog and Maps

The skill-set **catalog** (`catalog/`) and **relationship map** (`maps/`) are the single source of truth for skill-set’s view of the ecosystem: which environments exist, where their skill indexes live, project-level inventories, scope conventions, and skill-to-skill relationships. All catalog and map artifacts are owned by skill-set; create or update them only via the workflows below. Analysis outputs and documents under ../temp/ are temporary and are not governed as durable catalog artifacts.

### Durable artifacts

| Location | Artifact | Purpose |
|----------|----------|---------|
| `catalog/` | `environment-skill-index-map.json` | Lists every environment and the path to its local `skill-index.json`. Single source for “where the agent runs.” |
| `catalog/` | `ai-vault-skill-inventory.json` | Project-level skill inventory for Ai-Vault (name, path, purpose, triggers, workflows, tier, indication). Canonical list for this vault. |
| `catalog/` | `scope-and-conventions.md` | User-level vs project-based scope rules and functional clusters (hubs) for Agent Graph mapping. Do not redefine scope elsewhere; reference this. |
| `catalog/` | `third-party-skills.json` | Upstream skills (git clone/submodule) with sidecar paths under `vendor/`. |
| `catalog/` | `README.md` | Catalog schema and usage. Read before creating or updating any catalog file. |
| `vendor/` | `<folder>/` | Ecosystem-only files (`skill-escalation.md`, `integration.md`) for third-party skills; safe across upstream pulls. |
| `maps/` | `skill-relationships.json` | Skill Relationship Map: relationships (e.g. may_call_or_wrap, shares_mcp_tool_script, overlaps, specialized_version_of) and high-risk refactor sequences. |

Schema and update rules for each artifact are in `catalog/README.md`.

### Regenerating `skill-index.json`

After adding or removing a top-level skill folder, or changing discovery-relevant YAML (`name`, `description`, optional load `metadata.tier`), regenerate that environment’s `skill-index.json` so it stays aligned with Agent Skills L1 (see `references/standard-reference.md`).

**Script:** `scripts/update_skill_index.py`

- **Default (user or project):** run from anywhere; the script infers the skills root as the parent of `skill-set/` (i.e. the `.claude/skills` directory that contains `skill-set`).
- **Explicit path:** `python scripts/update_skill_index.py --skills-root "C:/path/to/.claude/skills"` (or `-s`). Use for a project vault’s `.claude/skills` when you do not rely on the default layout, or when the script file was copied elsewhere.

Output is always `<skills-root>/skill-index.json`.

Optional **`--with-relationship-map`** (`-R`): after a successful index write, runs `scripts/update_relationship_map.py` with the same `--skills-root`. If `<skills-root>/skill-set/maps/skill-relationships.json` exists, that file is targeted; otherwise the relationship script uses its default path next to the installed scripts (see note printed on stderr).

### Updating `maps/skill-relationships.json`

`skill-relationships.json` is the **Skill Relationship Map**: typed edges between skills (and sometimes MCP/tool nodes), evidence quotes, confidence, optional Agent Graph edge hints, and **high-risk refactor sequences**. It supports refactor planning and Story-01-05–style alignment; see `maps/skill-relationships.json` header and `catalog/README.md`.

- **Not auto-generated in full:** Curated `relationships[]` and `high_risk_refactor_sequences[]` require human judgment (and occasional updates when skills are renamed).
- **Partially automated:** `scripts/update_relationship_map.py` syncs `skills.user_level` from `<skills-root>/skill-index.json`, `skills.project_level_ai_vault` from `skill-set/catalog/ai-vault-skill-inventory.json` when present (override with `--project-inventory`, or `--no-project-inventory` to leave the project list unchanged), refreshes `sources` paths and `updated`, and prints **warnings** when an edge endpoint is missing from those lists (MCP-style names like `user-mcp-atlassian` are ignored).

```bash
python scripts/update_relationship_map.py
python scripts/update_relationship_map.py --check-only
python scripts/update_relationship_map.py -s C:/path/to/.claude/skills -p C:/path/to/ai-vault-skill-inventory.json
```

### When to use the catalog

- **Before creating or refreshing an inventory:** Read `catalog/environment-skill-index-map.json` to discover all environments and their `skill_index_path`. Use those paths to read the corresponding `skill-index.json` and produce or update `catalog/ai-vault-skill-inventory.json` (or other per-environment inventories).
- **Before classifying a skill’s scope (user vs project):** Read `catalog/scope-and-conventions.md`. Use it when adding skills to an inventory or when documenting scope.
- **Before refactoring or reordering skills:** Read `maps/skill-relationships.json` for dependency edges and high-risk refactor sequences. Use it to plan move/split/merge order.
- **When adding or removing an environment:** Update `catalog/environment-skill-index-map.json` (add/remove entry, bump `updated`).

### Catalog and map workflow triggers

| Trigger | Action | Artifact(s) |
|---------|--------|-------------|
| "Refresh inventory", "update project inventory", "sync skill index to catalog" | Regenerate project-level (or user-level) inventory from the environment’s `skill-index.json`. | Read `environment-skill-index-map.json`; read target `skill-index.json`; write/update `ai-vault-skill-inventory.json` (or equivalent). |
| "Add environment", "register new workspace", "add skill index" | Add one environment to the map. | Read `environment-skill-index-map.json`; add entry with `id`, `path`, `skill_index_path`; bump `updated`. |
| "Update scope conventions", "change scope rules", "update skill hubs" | Revise user vs project rules or functional clusters. | Edit `scope-and-conventions.md`; keep consistent with `standard-reference.md`. |
| "Update relationship map", "document skill dependencies", "update skill relationships" | Add or change relationships or high-risk sequences. | Read inventories and skill-indexes as needed; edit `maps/skill-relationships.json`. |
| "Regenerate skill index", "refresh skill-index.json" | Rebuild `skill-index.json` from all `*/SKILL.md` frontmatter. | Run `scripts/update_skill_index.py` (optional `--skills-root` for project-level trees). |
| "Sync relationship map skill lists", "refresh skill-relationships lists" | Align `maps/skill-relationships.json` skill ID lists with indexes; validate edges. | Run `scripts/update_relationship_map.py` (`--check-only` to validate without writing). |

## Examples

**Example 1: Create a new skill (no MCP)**
```
User: "Create a skill for managing my recipes"
→ Invokes synthesize workflow
→ Reads skill-set references/standard-reference.md for structure
→ Plans 2-3 use cases, selects category (Document/Asset Creation)
→ Searches for prior art: "recipe management agent skill", "recipe workflow automation"
→ Finds community pattern for ingredient parsing → adopts into use cases
→ No external actions required, skips MCP discovery
→ Creates skill with kebab-case naming: recipe-manager/
→ Generates SKILL.md with standard frontmatter
```

**Example 2: Create a skill with MCP integration**
```
User: "Create a skill for ArchiMate modeling"
→ Invokes synthesize workflow
→ Phase 1: Searches prior art → finds ArchiMate automation patterns, existing MCP servers
→ Phase 1: Runs list_mcp_resources → discovers lobehub-archimate server
→ Phase 2: Maps tools (create_element, create_relationship, export_diagram)
→ Phase 3: Documents MCP dependencies in SKILL.md
→ Phase 4: Creates skill with explicit tool mapping and safety policy
→ Output: archimate-modeling/ with MCP Dependencies section
```

**Example 3: Lint an existing skill (structural)**
```
User: "Lint the enterprise-modeling skill"
→ Invokes lint workflow
→ Checks structural, syntax, security, and portability rules
→ Generates compliance score and actionable fix list
```

**Example 4: Validate a skill (content effectiveness)**
```
User: "Validate the research-analysis skill"
→ Invokes validate workflow (validate.md) + effectiveness-assessment.md for report synthesis
→ Reads skill + all references + prompting standards
→ Benchmarks against industry: searches "research automation agent best practices"
→ Finds established RAG patterns the skill partially implements
→ Analyzes instruction quality, token efficiency, tool usage, ecosystem fit
→ Identifies: description lacks third-person voice, 2 redundant paragraphs,
   missed RAG chunking pattern from prior art, overlapping triggers with prompting skill
→ Generates effectiveness score (74/100) with prioritized recommendations + effectiveness assessment sections
```

**Example 5: Refresh project inventory (catalog workflow)**
```
User: "Refresh the Ai-Vault skill inventory in the catalog"
→ Invokes catalog workflow (see § Catalog and Maps)
→ Reads catalog/environment-skill-index-map.json to get ai-vault skill_index_path
→ Reads that skill-index.json and builds/updates catalog/ai-vault-skill-inventory.json
→ Keeps catalog in sync with the vault skill index
```

**More examples:** Optimize from feedback, canonicalize/migrate a skill, and create with missing MCP are in [references/examples.md](references/examples.md).
