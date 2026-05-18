---
title: Skill Lab MCP Control Plane PRD and Technical Specification
type: prd-spec
product: Skill Lab
project: user-skills-repository
version: 0.1.0
status: draft
created: 2026-05-18
updated: 2026-05-18
owner: skill-set
scale_profile: growth
---

# Skill Lab MCP Control Plane PRD and Technical Specification

## Executive Summary

Skill Lab is a Git-backed web dashboard and MCP control plane for managing the user-level and project-level Agent Skills ecosystem. It turns the existing skill repository from a collection of `SKILL.md` prompt packages plus utility scripts into a governed capability catalog with searchable metadata, relationship visualization, validation scorecards, AI-assisted improvement workflows, and reviewable Git diffs.

The core design principle is to keep individual skills portable and standards-compliant while giving agents and humans a shared control plane over the repository. The MCP server code should live inside the owning `skill-set` skill folder so it can read the same source prompts, references, catalog files, maps, and scripts that define the skill lifecycle. The browser UI should consume the same domain services as the MCP server, avoiding divergent logic between agent-facing and human-facing experiences.

## Product Vision

Skill Lab provides a single local or self-hosted interface where the user can:

- see all user-level and project-level skills;
- understand how skills relate, overlap, wrap, or depend on each other;
- inspect discovery metadata, trigger phrases, workflows, references, scripts, and MCP/tool dependencies;
- run skill lifecycle checks defined by `skill-set`;
- ask AI to propose improvements to skills, indexes, and relationships;
- review generated changes as Git diffs before committing.

The product should feel like a focused internal developer portal for personal and project skills: Backstage-style catalog governance, Obsidian/Neo4j-style graph exploration, LangSmith/Promptfoo-style quality evaluation, and MCP-native agent access.

## Problem Statement and Opportunity

The current repository already has strong lifecycle foundations:

- `skill-index.json` provides machine-readable discovery metadata.
- `skill-set/catalog/environment-skill-index-map.json` lists known environments.
- `skill-set/catalog/ai-vault-skill-inventory.json` captures project-level inventory.
- `skill-set/maps/skill-relationships.json` captures curated relationship edges and high-risk refactor sequences.
- `skill-set/references/*.md` defines synthesize, lint, validate, optimize, and canonicalize workflows.
- `skill-set/scripts/update_skill_index.py` and `skill-set/scripts/update_relationship_map.py` keep selected artifacts synchronized.

However, the current experience is file- and agent-driven. It lacks a visual way to understand the ecosystem, detect stale catalog state, validate skill quality at a glance, and safely coordinate AI-assisted skill improvements across user and project levels.

Skill Lab addresses this by exposing the repository as both:

1. an MCP server for agents, and
2. a browser-based dashboard for human review and governance.

## Scope and Scale Profile

### Scale profile

Use the **growth** profile from the `specification` skill:

- one user now, but multiple project environments and increasing integration complexity;
- consistent requirement IDs and traceability are needed;
- explicit NFR thresholds are required for local reliability and safe mutation;
- Git-backed review is mandatory for write operations.

The architecture should remain simple enough for local use but structured enough to become self-hosted later.

### In scope

- Repository-backed skill catalog ingestion.
- MCP server hosted from inside the `skill-set` skill folder.
- Shared backend/domain layer used by both MCP tools and browser API routes.
- Browser dashboard for catalog, graph, skill detail, validation reports, and change proposals.
- Read-only operations by default.
- Controlled write operations that produce reviewable diffs.
- Integration with existing `skill-set` scripts and references.
- Extensible data model for future project-level skill indexes.

### Out of scope for initial implementation

- Replacing the Agent Skills standard.
- Making every skill its own MCP server.
- Running every skill as a long-lived service.
- Cloud multi-tenant hosting.
- Production telemetry from Claude/Cursor sessions unless a future runtime integration provides reliable events.
- Silent auto-commit or auto-push of AI-generated changes.
- Full visual workflow execution builder comparable to Dify, Flowise, or LangGraph Studio.

## Key Architectural Decision

### Decision: keep service code under `skill-set/mcp-server/`, not `skill-set/scripts/`

The MCP server and web backend should live in:

```text
skill-set/
  mcp-server/
    package.json
    src/
      domain/
      repositories/
      mcp/
      http/
      ai/
      git/
      prompts/
    tests/
    README.md
```

Rationale:

- `scripts/` should remain reserved for deterministic, agent-callable command-line utilities such as index updates, lint scans, and relationship-map synchronization.
- A long-running MCP server/backend has different lifecycle needs: process startup, request handling, shared services, tests, HTTP routes, MCP tools/resources, and optional UI serving.
- The Agent Skills standard allows additional files/directories inside a skill folder; the required portable skill artifact remains `SKILL.md` plus referenced resources.
- Keeping the service inside `skill-set/` lets it use `skill-set` as the owner of lifecycle governance without copying prompts or policy text elsewhere.

### Consequence

`skill-set/SKILL.md` should eventually document:

- that `mcp-server/` is a long-lived service package, not an agent-callable script;
- how to start it locally;
- which MCP tools/resources it exposes;
- which operations are read-only and which require explicit review.

## Proposed Repository Layout

```text
skill-set/
  SKILL.md
  references/
    standard-reference.md
    authoring-guide.md
    synthesize.md
    lint.md
    validate.md
    optimize.md
    canonicalize.md
    skill-scripts.md
  catalog/
    README.md
    environment-skill-index-map.json
    ai-vault-skill-inventory.json
    scope-and-conventions.md
  maps/
    skill-relationships.json
  scripts/
    update_skill_index.py
    update_relationship_map.py
  mcp-server/
    package.json
    src/
      domain/
        SkillCatalogService.ts
        SkillGraphService.ts
        SkillHealthService.ts
        SkillValidationService.ts
        ChangeProposalService.ts
      repositories/
        FileSystemSkillRepository.ts
        SkillIndexRepository.ts
        RelationshipMapRepository.ts
        EnvironmentMapRepository.ts
      prompts/
        PromptSourceService.ts
        SkillReferenceSource.ts
      mcp/
        server.ts
        tools.ts
        resources.ts
        prompts.ts
      http/
        api.ts
        routes/
      git/
        GitDiffService.ts
        GitStatusService.ts
      ai/
        SkillImprovementAdvisor.ts
        RelationshipSuggestionAdvisor.ts
      cli.ts
    tests/
    README.md
```

The browser UI may be either:

1. colocated under `skill-set/mcp-server/web/` for a single package, or
2. placed under `skill-set/skill-lab-ui/` if UI complexity grows.

Initial recommendation: colocate under `skill-set/mcp-server/web/` until build complexity justifies separation.

## Source Prompt and Reference Reuse Model

The MCP server and web backend must not copy lifecycle prompts or rules from `skill-set/references/`. They should read them as source artifacts through a shared prompt/reference loader.

### Required behavior

- `PromptSourceService` reads canonical source content from:
  - `skill-set/SKILL.md`
  - `skill-set/references/*.md`
  - `skill-set/assets/*.md`
  - target skill `SKILL.md` files
  - target skill references, scripts metadata, and assets metadata
- MCP prompts expose stable prompt templates derived from those files.
- HTTP endpoints use the same source loader for AI-assisted actions.
- Any AI proposal cites the source file and section that informed it.

### Non-goal

The server must not maintain a second prompt registry that diverges from the skill repository.

## User Personas

### Primary user: skill repository owner

Needs to inspect, improve, and govern personal and project skills across environments.

### Secondary user: coding agent

Needs structured access to skill metadata, relationships, validation workflows, and safe mutation tools through MCP.

### Future user: project maintainer

Needs project-specific skill inventory, wrappers, and impact analysis without editing global skills accidentally.

## User Stories

### Catalog browsing

- **US-001**: As the repository owner, I can view all user-level skills from `skill-index.json` so that I understand the current global capability set.
- **US-002**: As the repository owner, I can view project-level skills from catalog inventories so that I understand which skills are project-specific.
- **US-003**: As the repository owner, I can filter skills by scope, tier, cluster, project, health status, and lifecycle state so that large catalogs remain navigable.

### Skill detail

- **US-004**: As the repository owner, I can open a skill detail page showing frontmatter, trigger phrases, workflows, references, scripts, assets, and known relationships so that I can evaluate the skill in context.
- **US-005**: As the repository owner, I can see whether a skill has a `references/skill-escalation.md` file so that boundary compliance is visible.
- **US-006**: As the repository owner, I can see broken or missing file references from `SKILL.md` so that maintenance issues are actionable.

### Graph exploration

- **US-007**: As the repository owner, I can view a global graph of skills, tools, MCP servers, environments, and relationship edges so that I can understand the skill ecosystem.
- **US-008**: As the repository owner, I can view a local graph centered on one skill with configurable depth so that I can assess impact before changing it.
- **US-009**: As the repository owner, I can filter graph edges by relationship type so that dependency, overlap, and specialization views are distinct.
- **US-010**: As the repository owner, I can highlight high-risk refactor sequences so that risky changes are visible before editing.

### Health and validation

- **US-011**: As the repository owner, I can run a catalog health scan so that stale indexes, invalid paths, count mismatches, and relationship endpoint issues are surfaced.
- **US-012**: As the repository owner, I can run structural lint checks on one skill or all skills so that standards compliance is measurable.
- **US-013**: As the repository owner, I can run a content validation workflow that scores instruction quality, token economics, tool/context fitness, prompt engineering, and ecosystem fitness so that skill quality is trackable.
- **US-014**: As the repository owner, I can compare validation results before and after edits so that improvements can be verified.

### AI-assisted improvement

- **US-015**: As the repository owner, I can ask AI to improve a skill description for trigger accuracy so that automatic skill activation improves.
- **US-016**: As the repository owner, I can ask AI to generate a missing `references/skill-escalation.md` proposal so that ownership boundaries become explicit.
- **US-017**: As the repository owner, I can ask AI to suggest relationship edges with evidence quotes so that the graph improves without relying on unsupported guesses.
- **US-018**: As the repository owner, I can ask AI to detect overlapping skills and propose scope changes so that duplication is managed.
- **US-019**: As the repository owner, I can review AI-generated patches as Git diffs before accepting them so that the repository remains controlled.

### MCP agent access

- **US-020**: As an agent, I can call `list_skills` to retrieve skill summaries without parsing the repository manually.
- **US-021**: As an agent, I can call `get_skill_detail` to retrieve a normalized view of a target skill.
- **US-022**: As an agent, I can call `graph_neighbors` to understand upstream and downstream relationships.
- **US-023**: As an agent, I can call `check_catalog_health` before making catalog edits.
- **US-024**: As an agent, I can call `propose_skill_patch` and receive a patch proposal rather than directly mutating files.

## Functional Requirements

### Catalog ingestion

- **FR-001**: The system shall read user-level skills from `<skills-root>/skill-index.json`.
- **FR-002**: The system shall read environment definitions from `skill-set/catalog/environment-skill-index-map.json`.
- **FR-003**: The system shall read project-level inventories from catalog files such as `skill-set/catalog/ai-vault-skill-inventory.json`.
- **FR-004**: The system shall tolerate missing project inventories by showing a warning and continuing with user-level data.
- **FR-005**: The system shall normalize Windows and POSIX path strings into a path model that can report whether each path is resolvable in the current runtime.

### Skill parsing

- **FR-006**: The system shall parse `SKILL.md` frontmatter for `name`, `description`, `license`, `compatibility`, `allowed-tools`, and `metadata`.
- **FR-007**: The system shall extract trigger phrases using the same or stricter logic than `update_skill_index.py`.
- **FR-008**: The system shall extract workflow references from `SKILL.md` routing tables and direct links.
- **FR-009**: The system shall identify referenced files under `references/`, `scripts/`, and `assets/`.
- **FR-010**: The system shall report missing referenced files as health findings.

### Graph model

- **FR-011**: The system shall load relationships from `skill-set/maps/skill-relationships.json`.
- **FR-012**: The system shall represent skills, MCP/tool nodes, environments, workflows, references, and scripts as typed graph nodes.
- **FR-013**: The system shall represent relationship map entries as typed graph edges with evidence, confidence, notes, and approximate mapping flags.
- **FR-014**: The system shall support graph filters by node type, relationship type, scope, project, confidence range, and health status.
- **FR-015**: The system shall display high-risk refactor sequences as first-class graph overlays or panels.

### Health checks

- **FR-016**: The system shall detect index count mismatches, including `totalSkills`, `alwaysLoadedCount`, and `deferredCount` inconsistencies.
- **FR-017**: The system shall detect relationship endpoints that are not present in known skill lists unless they match known external endpoint patterns.
- **FR-018**: The system shall detect stale generated files by comparing modification timestamps and generated timestamps where available.
- **FR-019**: The system shall detect invalid or non-resolvable environment paths for the current machine.
- **FR-020**: The system shall detect missing `references/skill-escalation.md` files for skills governed by the current standard.

### Validation and lifecycle actions

- **FR-021**: The system shall expose a read-only catalog health scan through both MCP and HTTP.
- **FR-022**: The system shall expose index regeneration by invoking or reimplementing `skill-set/scripts/update_skill_index.py`.
- **FR-023**: The system shall expose relationship-map synchronization by invoking or reimplementing `skill-set/scripts/update_relationship_map.py`.
- **FR-024**: The system shall support validation report persistence under a generated, reviewable output location.
- **FR-025**: The system shall keep generated reports separate from durable catalog artifacts unless the user explicitly promotes them.

### AI proposals

- **FR-026**: The system shall support AI-assisted skill improvement requests that return proposed changes, rationale, and source citations.
- **FR-027**: The system shall support relationship suggestion requests that include evidence quotes and confidence scores.
- **FR-028**: The system shall support trigger conflict analysis across selected skills.
- **FR-029**: The system shall produce patch proposals in a format that can be reviewed and applied through Git.
- **FR-030**: The system shall require explicit user confirmation before writing any AI-generated change to disk.

### Git workflow

- **FR-031**: The system shall expose current Git status for the skill repository.
- **FR-032**: The system shall show diffs for proposed changes before applying or committing.
- **FR-033**: The system shall not commit, push, or create PRs automatically in initial versions.
- **FR-034**: The system shall preserve unrelated working tree changes and warn when a proposed patch overlaps dirty files.

### MCP server

- **FR-035**: The MCP server shall expose tools for catalog query, graph query, health checks, validation, and proposal generation.
- **FR-036**: The MCP server shall expose resources for skill details, skill indexes, relationship maps, environment maps, and validation reports.
- **FR-037**: The MCP server shall expose reusable prompts for skill improvement, validation, relationship suggestion, and skill synthesis.
- **FR-038**: The MCP server shall share domain services with the HTTP backend.

### Browser dashboard

- **FR-039**: The dashboard shall provide catalog, graph, skill detail, health, validation, and proposals views.
- **FR-040**: The dashboard shall call the shared backend API rather than parsing files directly in the browser.
- **FR-041**: The dashboard shall allow switching between user-level and project-level environments.
- **FR-042**: The dashboard shall show source file links for every displayed catalog or graph fact.

## Non-Functional Requirements

- **NFR-001 Startup time**: Local server startup shall complete in under 3 seconds for 100 skills on a typical developer laptop, excluding dependency installation.
- **NFR-002 Catalog scan latency**: A full read-only catalog health scan shall complete in under 5 seconds for 250 skills and 1,000 relationship edges.
- **NFR-003 UI responsiveness**: Primary catalog and skill detail views shall render first meaningful content in under 1 second after API response for 250 skills.
- **NFR-004 Graph scale**: The graph UI shall remain usable with at least 250 skill/tool/workflow nodes and 1,000 edges through filtering and local graph views.
- **NFR-005 Portability**: The server shall run on Linux, macOS, and Windows with documented setup commands.
- **NFR-006 Source of truth**: Repository files shall remain the source of truth. The system shall not require a database for initial operation.
- **NFR-007 Safety**: All write-capable actions shall be disabled by default or require explicit confirmation.
- **NFR-008 Auditability**: Every write action shall produce a human-readable change summary and Git diff.
- **NFR-009 Security**: The server shall not expose arbitrary filesystem access outside configured skills roots.
- **NFR-010 Secret handling**: The server shall never display or persist environment variables or credentials except as redacted diagnostics.
- **NFR-011 MCP compatibility**: MCP tools and resources shall use stable JSON schemas and avoid UI-specific response shapes.
- **NFR-012 Prompt reuse**: Lifecycle prompt/reference content used by AI actions shall be loaded from source files, not duplicated in server code.

## MCP Interface Draft

### Tools

| Tool | Purpose | Writes? |
|------|---------|---------|
| `list_skills` | Return normalized skill summaries across configured environments. | No |
| `search_skills` | Search by name, trigger, workflow, reference, script, or description. | No |
| `get_skill_detail` | Return parsed detail for one skill. | No |
| `get_skill_graph` | Return graph nodes and edges with filters. | No |
| `graph_neighbors` | Return local graph around one node. | No |
| `check_catalog_health` | Run catalog/index/map/path health checks. | No |
| `lint_skill` | Run structural checks for one skill. | No by default |
| `validate_skill` | Generate validation analysis for one skill. | Optional report write |
| `suggest_relationship_edges` | Propose relationship edges with evidence quotes. | No |
| `detect_trigger_conflicts` | Analyze overlapping trigger phrases and ambiguous descriptions. | No |
| `propose_skill_patch` | Generate a reviewable patch proposal for a target skill. | No direct write |
| `apply_approved_patch` | Apply a previously reviewed patch token. | Yes, gated |
| `regenerate_skill_index` | Run index regeneration for a configured skills root. | Yes, gated |
| `sync_relationship_map` | Run relationship-map list synchronization. | Yes, gated |

### Resources

```text
skill-lab://environments
skill-lab://skill-index/user
skill-lab://skill-index/{environmentId}
skill-lab://skills/{environmentId}/{skillName}
skill-lab://relationships
skill-lab://graph
skill-lab://health/latest
skill-lab://validation/{environmentId}/{skillName}/latest
```

### Prompts

```text
skill-lab/improve-skill-description
skill-lab/create-skill-escalation
skill-lab/validate-skill-effectiveness
skill-lab/suggest-relationships
skill-lab/analyze-trigger-conflicts
skill-lab/synthesize-new-skill
```

Each prompt must be generated from or explicitly cite `skill-set` source references.

## HTTP API Draft

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/environments` | GET | List configured environments. |
| `/api/skills` | GET | List normalized skills. |
| `/api/skills/:environmentId/:skillName` | GET | Skill detail. |
| `/api/graph` | GET | Filtered graph. |
| `/api/graph/neighbors` | GET | Local graph around a node. |
| `/api/health` | POST | Run health scan. |
| `/api/validation/:environmentId/:skillName` | POST | Run or retrieve validation report. |
| `/api/proposals/relationships` | POST | Suggest relationship edges. |
| `/api/proposals/skill-patch` | POST | Generate skill patch proposal. |
| `/api/git/status` | GET | Current Git status. |
| `/api/git/diff` | GET | Diff for current or proposed changes. |

The API should return stable domain DTOs shared with MCP response schemas where practical.

## Browser Dashboard Requirements

### Catalog view

- Search and filter skills.
- Show name, scope, project, tier, trigger count, workflow count, relationship count, and health status.
- Highlight stale or missing metadata.

### Skill detail view

- Show frontmatter and parsed metadata.
- Show trigger phrases and description length.
- Show workflows and referenced files.
- Show scripts with CLI/help compliance where detectable.
- Show incoming/outgoing relationships.
- Show validation and health findings.

### Graph view

- Global graph and local graph.
- Relationship type filters.
- Node type filters.
- Confidence and approximate-mapping indicators.
- High-risk refactor sequence overlay.

### Health view

- Catalog/index consistency checks.
- Environment path checks.
- Relationship endpoint checks.
- Missing escalation files.
- Broken file references.
- Script contract issues where detectable.

### Proposal workbench

- AI-generated recommendation text.
- Source citations.
- Proposed file changes.
- Diff preview.
- Apply/ignore/export options.

## Data Model

### SkillSummary

```json
{
  "environmentId": "user",
  "scope": "user",
  "name": "skill-set",
  "path": "skill-set/SKILL.md",
  "description": "...",
  "triggers": ["..."],
  "workflows": ["validate"],
  "tier": "deferred",
  "health": {
    "status": "warning",
    "findings": 2
  }
}
```

### SkillGraphNode

```json
{
  "id": "skill:user:skill-set",
  "type": "skill",
  "label": "skill-set",
  "scope": "user",
  "environmentId": "user",
  "sourcePath": "skill-set/SKILL.md"
}
```

### SkillGraphEdge

```json
{
  "id": "rel-0044",
  "from": "skill:user:tech-documentation",
  "to": "skill:user:documentation-governance",
  "type": "may_call_or_wrap",
  "confidence": 0.9,
  "mappingIsApproximate": true,
  "evidence": {
    "sourceFile": "tech-documentation/SKILL.md",
    "quote": "..."
  }
}
```

### HealthFinding

```json
{
  "id": "health-index-count-mismatch",
  "severity": "warning",
  "category": "index",
  "message": "deferredCount is 35 but 36 skills have tier=deferred.",
  "sourcePath": "skill-index.json",
  "recommendation": "Regenerate skill-index.json with skill-set/scripts/update_skill_index.py."
}
```

## AI Assistance and Safety Model

### AI operations allowed in initial release

- Generate skill improvement recommendations.
- Draft `SKILL.md` description changes.
- Draft missing `references/skill-escalation.md`.
- Suggest relationship edges with evidence.
- Explain graph impact.
- Summarize validation findings.

### AI operations not allowed in initial release

- Auto-apply edits without review.
- Auto-commit or push.
- Execute destructive external MCP operations.
- Rewrite multiple skills without staged proposal review.

### Proposal lifecycle

```text
request -> source loading -> AI recommendation -> patch proposal -> diff preview -> explicit apply -> health/validation rerun -> Git review
```

## Dependencies

### Internal repository dependencies

- `skill-set/SKILL.md`
- `skill-set/references/standard-reference.md`
- `skill-set/references/authoring-guide.md`
- `skill-set/references/lint.md`
- `skill-set/references/validate.md`
- `skill-set/references/optimize.md`
- `skill-set/catalog/README.md`
- `skill-set/catalog/environment-skill-index-map.json`
- `skill-set/maps/skill-relationships.json`
- `skill-set/scripts/update_skill_index.py`
- `skill-set/scripts/update_relationship_map.py`

### External technology choices

Implementation should prefer one runtime for the new service package. Recommended default:

- TypeScript for MCP server, HTTP API, and web UI.
- Python remains for existing skill-set scripts unless they are later ported intentionally.

This is an explicit exception to the "one runtime per skill scripts" guidance because `mcp-server/` is a service package, not `scripts/`. If this becomes confusing in practice, the alternative is to move the MCP service into a dedicated new skill, but the current product goal is to keep it owned by `skill-set`.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Service code bloats the `skill-set` skill folder | Medium | Keep `SKILL.md` concise; document `mcp-server/` as optional service package; do not load service code into agent context. |
| MCP and HTTP APIs diverge | High | Use shared domain services and DTO schemas. |
| AI edits corrupt skill files | High | Proposal-first lifecycle, diff preview, dirty-file checks, explicit apply only. |
| Paths in catalog are machine-specific | Medium | Add path resolution status and environment overrides. |
| Relationship suggestions hallucinate edges | High | Require evidence quote, source file, confidence score, and human approval. |
| Graph becomes too dense | Medium | Local graph, filters, clusters, and high-risk overlays. |
| UI becomes a source of truth | High | Keep Git files canonical; no hidden database required for MVP. |

## Acceptance Criteria

- **AC-001**: A developer can start the MCP/backend package from inside `skill-set/mcp-server/`.
- **AC-002**: The server can list all skills from `skill-index.json` through both MCP and HTTP.
- **AC-003**: The server can load `skill-set` references as source prompt material without duplicating them in code.
- **AC-004**: The dashboard can show catalog, skill detail, and graph views from repository data.
- **AC-005**: The health scan detects invalid environment paths, index count mismatches, missing relationship endpoints, and missing escalation files.
- **AC-006**: An AI relationship suggestion includes relationship type, endpoints, evidence quote, source file, confidence score, and rationale.
- **AC-007**: An AI skill patch proposal can be previewed as a diff before being applied.
- **AC-008**: No write operation runs without explicit confirmation.
- **AC-009**: Existing `skill-set/scripts/update_skill_index.py` and `update_relationship_map.py` remain usable.
- **AC-010**: The implementation does not require moving or rewriting existing skills.

## Quality Gates

### Gate 1: Spec Ready

- Problem statement, goals, and success metrics are measurable.
- Functional and non-functional requirements are testable.
- Scope and out-of-scope boundaries are explicit.
- Risks, dependencies, and assumptions are documented.

Status: **Pass for initial planning**.

### Gate 2: Build Ready

Required before implementation starts:

- Choose exact TypeScript framework and MCP SDK.
- Define initial JSON schemas for MCP tools and HTTP DTOs.
- Decide whether UI is colocated under `skill-set/mcp-server/web/`.
- Define local configuration file format for skills roots and environment path overrides.
- Define write-confirmation mechanism for MCP and HTTP calls.

Status: **Pending architecture decisions**.

### Gate 3: Release Ready

Required before daily use:

- Document local startup and shutdown.
- Add read-only smoke tests for catalog ingestion.
- Add fixture tests for graph loading and health checks.
- Add safety tests proving write tools reject unconfirmed mutations.
- Add Git dirty-worktree overlap detection.

Status: **Not started**.

## Open Questions

1. Should the dashboard be local-only at first, or should it support remote self-hosting in the first implementation?
2. Should validation reports be stored under `skill-set/reports/`, `temp/`, or a root-level generated folder?
3. Should project-level environment registration support relative paths in addition to absolute paths?
4. Should Skill Lab support multiple skill repositories, or only one root plus project inventories?
5. Which AI provider should power proposal generation in the first implementation?
6. Should MCP write tools be completely absent by default, or present but disabled until configured?

## Suggested Implementation Sequence

1. Create `skill-set/mcp-server/` package with shared domain services and read-only catalog ingestion.
2. Add MCP tools/resources for `list_skills`, `get_skill_detail`, `get_skill_graph`, and `check_catalog_health`.
3. Add HTTP API using the same domain services.
4. Add minimal browser UI for catalog, skill detail, graph, and health findings.
5. Add source prompt/reference loader for `skill-set` lifecycle workflows.
6. Add proposal-only AI actions for relationship suggestions and skill description improvements.
7. Add diff preview and gated apply mechanism.
8. Add validation report persistence and before/after comparison.
9. Add optional project environment path overrides and multi-environment switching.

## Notes

The long-term direction is not "one MCP server per skill." The recommended direction is:

```text
portable skill packages
  + shared skill-set-owned MCP/backend service
  + browser dashboard
  + Git-backed proposal workflow
```

This preserves skill portability while making the ecosystem visible, queryable, testable, and improvable by both humans and agents.
