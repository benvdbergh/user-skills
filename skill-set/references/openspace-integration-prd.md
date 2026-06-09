# OpenSpace Integration PRD and Implementation Plan

## Purpose

Define how the `user-skills` repository and the `skill-set` / Skill Lab control plane can use HKUDS OpenSpace to make the skill system more self-learning while keeping OpenSpace as an independently updatable upstream runtime.

The integration goal is not to fork, rewrite, or absorb OpenSpace. OpenSpace remains a separate installable project and MCP server. `skill-set` remains the canonical owner for Agent Skills standards, catalog governance, validation, relationship maps, and Git-reviewed promotion into the shared user-level skill repository.

## Executive Summary

The current `user-skills` repository is a Git-backed canonical source for personal Agent Skills across devices. `skill-set` already manages skill lifecycle operations: synthesize, validate, optimize, lint, canonicalize, vendor-skill handling, indexes, environment maps, relationship maps, and the Skill Lab MCP/dashboard control plane.

OpenSpace adds runtime learning that the current system does not fully provide:

- task execution with skill selection and injection;
- execution recording and post-task analysis;
- per-skill runtime metrics;
- FIX / DERIVED / CAPTURED skill evolution;
- lineage tracking in SQLite;
- optional cloud skill search and sharing.

The recommended product shape is a **two-plane system**:

1. **Governance plane (`user-skills` + `skill-set` + Skill Lab)**: canonical skills, standards, catalog, graph, validation, review, Git promotion.
2. **Learning plane (OpenSpace)**: per-device execution memory, telemetry, task traces, candidate fixes, derived skills, captured patterns.

OpenSpace outputs are treated as **evidence and candidate changes**. They are promoted into the canonical repo only through Skill Lab proposals, lint, validate, relationship review, and Git review.

## Goals

1. Add runtime learning signals to skill management without weakening existing skill standards.
2. Keep OpenSpace updatable from upstream without local source modifications.
3. Support multiple devices with local OpenSpace state while preserving one shared canonical skill repo.
4. Convert OpenSpace evolutions into Skill Lab proposals instead of direct canonical writes.
5. Preserve privacy and safety by making cloud sharing and direct mutation opt-in.
6. Let Skill Lab display static quality, runtime quality, lineage, and promotion status together.

## Non-Goals

- Do not fork OpenSpace or vendor its source into `skill-set/mcp-server`.
- Do not replace `skill-set` synthesize / lint / validate / optimize workflows.
- Do not let OpenSpace silently commit, push, or overwrite canonical skills.
- Do not require OpenSpace cloud for local self-learning.
- Do not make every skill depend on OpenSpace.
- Do not sync raw recordings or SQLite databases through the canonical skill repo.
- Do not treat OpenSpace-generated skills as first-party compliant until they pass `skill-set` review.

## Current System Baseline

### `user-skills`

The repository is the canonical portable source for user-level skills. It is shared across devices through Git and contains:

- one folder per skill;
- each skill's `SKILL.md`, references, scripts, and assets;
- `skill-index.json` for discovery metadata;
- `skill-set/` as the lifecycle owner.

### `skill-set`

`skill-set` owns:

- Agent Skills standard reference and authoring guidance;
- lifecycle workflows (`synthesize`, `validate`, `optimize`, `lint`, `canonicalize`);
- catalog artifacts (`environment-skill-index-map.json`, third-party registry, scope conventions);
- relationship map (`maps/skill-relationships.json`);
- vendor skill sidecars;
- Skill Lab MCP server and dashboard.

### Skill Lab

Skill Lab is currently a local Git-backed MCP/dashboard control plane with:

- catalog browsing;
- graph and relationship exploration;
- catalog health checks;
- lint and validation reports;
- source-prompt reuse from `skill-set/references`;
- AI-assisted patch and relationship proposals;
- reviewable diffs;
- write gates and proposal-first behavior.

This is the correct place to integrate OpenSpace outputs because it already owns safety gates, schemas, prompts, and review workflows.

## OpenSpace Capability Summary

OpenSpace should be treated as an external runtime dependency with this surface:

| Capability | Relevant OpenSpace surface | Integration use |
|------------|----------------------------|-----------------|
| MCP server | `openspace-mcp` | Optional runtime connected to Cursor / host agent. |
| Host skills | `delegate-task`, `skill-discovery` | Thin skills that teach agents when to call OpenSpace tools. |
| Tools | `execute_task`, `search_skills`, `fix_skill`, `upload_skill` | Delegation, search, manual fixes, optional sharing. |
| Skill registry | `OPENSPACE_HOST_SKILL_DIRS`, `.skill_id` sidecars | Runtime discovery and stable OpenSpace skill IDs. |
| Execution recording | logs / recordings | Evidence for runtime skill quality. |
| Skill store | `.openspace/openspace.db` | Runtime metrics, lineage, analyses, tool deps. |
| Evolution | FIX / DERIVED / CAPTURED | Candidate changes for Skill Lab review. |
| Dashboard | OpenSpace frontend | Optional separate lineage/session explorer. |
| Cloud | open-space.cloud | Optional private/public skill exchange. |

## Product Principles

1. **Canonical Git wins**: approved skills live in `user-skills`; OpenSpace state is derived/local unless explicitly promoted.
2. **External upstream stays clean**: OpenSpace is installed, pinned, and updated as its own repo/package; integration code reads its APIs/artifacts instead of modifying its source.
3. **Proposal before mutation**: OpenSpace-generated changes become Skill Lab proposals before they touch canonical skills.
4. **Local-first learning**: every device may have its own OpenSpace state; cross-device learning happens through reviewed Git changes or explicit private sharing.
5. **Privacy by default**: cloud upload is disabled or private unless the user explicitly chooses to share.
6. **Standards after capture**: captured/derived skills are raw material; `skill-set` canonicalizes, validates, and adds escalation boundaries before promotion.
7. **Observable boundaries**: Skill Lab should show whether data is canonical, local runtime evidence, imported upstream content, or a pending proposal.

## Target Architecture

```text
Device A / B / C

Cursor / Claude / host agent
  |-- MCP: skill-lab -------------------------------.
  |                                                 |
  `-- MCP: openspace ----.                          |
                         |                          |
                  OpenSpace runtime                 |
                  - execute_task                    |
                  - search_skills                   |
                  - fix_skill                       |
                  - upload_skill (opt-in)           |
                         |                          |
                         v                          |
                  Local learning state              |
                  - .openspace/openspace.db         |
                  - logs/recordings                 |
                  - sandbox evolved skills          |
                         |                          |
                         v read-only / import       |
                  Skill Lab OpenSpace adapter       |
                  - metrics summaries               |
                  - lineage summaries               |
                  - evolution candidates            |
                  - patch proposal conversion       |
                         |                          |
                         v                          |
                  Skill Lab proposals               |
                  - lint / validate / graph review  |
                         |                          |
                         v                          |
                  user-skills Git repo              |
```

## Device Model

Because the user runs the same `user-skills` repo on multiple devices, OpenSpace state should be device-local by default.

| Artifact | Scope | Sync policy |
|----------|-------|-------------|
| `user-skills` repo | shared canonical | Sync through Git. |
| `skill-index.json` | shared canonical/generated | Commit when changed by approved skill edits. |
| Skill Lab `.generated/` reports/proposals | local/generated | Do not use as canonical long-term source unless explicitly exported. |
| OpenSpace install | per device | Install/update independently. |
| OpenSpace `.openspace/openspace.db` | per device | Keep local; optionally import summaries. |
| OpenSpace logs/recordings | per device | Keep local; redact before sharing. |
| OpenSpace sandbox skills | per device | Promote through Skill Lab proposals. |
| OpenSpace `.skill_id` sidecars | OpenSpace runtime identity | Keep out of canonical repo unless an explicit policy later allows them. |

## Repository Boundary Strategy

### Do not place OpenSpace source inside `skill-set/mcp-server`

Skill Lab is TypeScript/Node and has its own domain model, schemas, HTTP API, MCP tools, and React UI. OpenSpace is Python and includes an execution engine, GUI/web/MCP/shell backends, LLM clients, and SQLite persistence. Mixing source trees would make updates and dependency management brittle.

### Preferred upstream management

Use one of these external install modes:

1. **Separate clone per device**
   - Example: `~/src/OpenSpace`
   - Update with `git pull` or package upgrade.
   - Best for local experimentation and upstream tracking.

2. **Pinned package install**
   - Install from PyPI or Git ref if available.
   - Record version/ref in local environment documentation.
   - Best when stable releases are sufficient.

3. **Optional Git submodule only outside canonical skills**
   - If needed, add OpenSpace as a tooling dependency outside skill folders.
   - Avoid treating OpenSpace as a first-party skill folder.

### Host skill handling

OpenSpace's host skills (`delegate-task`, `skill-discovery`) can be integrated as external/vendor skills, but they should remain thin wrappers over OpenSpace MCP. Recommended handling:

- copy or submodule the host skills into a sandbox first;
- register them in `catalog/third-party-skills.json` only if they become part of the canonical user experience;
- add `skill-set/vendor/openspace-host-skills/` sidecars for local policy;
- do not edit upstream host skill bodies unless maintaining a fork.

## Runtime Configuration Policy

### Safe default OpenSpace MCP config

Use a sandbox skill directory, not the canonical repo:

```json
{
  "mcpServers": {
    "openspace": {
      "command": "openspace-mcp",
      "toolTimeout": 600,
      "env": {
        "OPENSPACE_HOST_SKILL_DIRS": "/path/to/openspace-skill-sandbox",
        "OPENSPACE_WORKSPACE": "/path/to/openspace-workspace",
        "OPENSPACE_BACKEND_SCOPE": "shell,mcp,web,system",
        "OPENSPACE_ENABLE_RECORDING": "true"
      }
    }
  }
}
```

### Optional advanced config

- `OPENSPACE_API_KEY`: unset by default; enables cloud functions only when the user opts in.
- `OPENSPACE_BACKEND_SCOPE`: exclude `gui` initially unless desktop automation is explicitly needed.
- `OPENSPACE_MCP_SERVERS_JSON`: use only when OpenSpace must call additional MCP servers as a client.
- `OPENSPACE_MAX_ITERATIONS`: tune per device or task class.

### Canonical repo write policy

OpenSpace must not be configured to write directly into the canonical `user-skills` root during early phases. Direct canonical writes may be considered only after:

1. proposal import is implemented;
2. path guards are verified;
3. lint/validate gates run automatically;
4. the user explicitly enables a write mode;
5. Git dirty-tree protection exists.

## Promotion Workflow

```text
1. User or agent delegates work to OpenSpace.
2. OpenSpace selects skills, executes the task, records traces.
3. OpenSpace analysis creates metrics and maybe FIX / DERIVED / CAPTURED output.
4. Skill Lab reads OpenSpace summaries from configured local workspaces.
5. User reviews candidate list in Skill Lab.
6. User converts one candidate into a Skill Lab PatchProposal or NewSkillProposal.
7. Skill Lab runs lint and validate.
8. Relationship/escalation checks run:
   - new first-party skill needs references/skill-escalation.md;
   - derived skill needs parent/overlap relationship proposal;
   - fixed skill needs index refresh if discovery metadata changed.
9. User reviews diff.
10. Approved changes are applied to canonical `user-skills`.
11. Git commit/push syncs approved learning to other devices.
```

## Functional Requirements

### FR-OS-001: Register OpenSpace runtime locations

Skill Lab shall support local configuration entries for one or more OpenSpace workspaces.

Minimum fields:

| Field | Description |
|-------|-------------|
| `id` | Stable device/runtime id, e.g. `laptop-openspace`. |
| `displayName` | Human-readable label. |
| `workspacePath` | Path to OpenSpace workspace root. |
| `dbPath` | Path to `.openspace/openspace.db`; may default from workspace. |
| `sandboxSkillDirs` | Directories where OpenSpace may write evolved skills. |
| `cloudEnabled` | Whether cloud features are configured. |
| `lastSeenAt` | Updated after successful read. |

Configuration should be local-only (`skill-lab.config.local.json`) unless the path is portable.

### FR-OS-002: Read OpenSpace SQLite summaries

Skill Lab shall read OpenSpace SQLite in read-only mode and expose summary data:

- active skill records;
- lineage origin and generation;
- parent skill IDs;
- selection/application/completion/fallback counters;
- recent execution analyses;
- unprocessed evolution candidates;
- tool dependencies.

The first adapter should be read-only and tolerate schema drift by feature-detecting tables/columns.

### FR-OS-003: Map OpenSpace skill IDs to canonical skill names

OpenSpace uses IDs such as `{name}__imp_xxxxxxxx` or `{name}__vN_xxxxxxxx`. Skill Lab shall map these to canonical `skill-index.json` names when possible:

1. exact frontmatter `name`;
2. exact folder name;
3. OpenSpace ID prefix before `__`;
4. configured alias map;
5. unresolved external/candidate skill.

Unresolved skills must be shown as runtime-only candidates, not silently merged into canonical skills.

### FR-OS-004: Display runtime quality beside static quality

Skill detail pages shall optionally show OpenSpace runtime metrics:

| Metric | Meaning |
|--------|---------|
| selections | Times OpenSpace selected the skill. |
| applied | Times the skill was judged applied. |
| completions | Times task completed when applied. |
| fallbacks | Times skill selection failed or was bypassed. |
| applied rate | `applied / selections`. |
| completion rate | `completions / applied`. |
| effective rate | `completions / selections`. |
| fallback rate | `fallbacks / selections`. |

Static validation score and runtime quality should remain separate dimensions.

### FR-OS-005: List evolution candidates

Skill Lab shall provide a view of OpenSpace evolution candidates:

- source runtime/device;
- candidate type: FIX, DERIVED, CAPTURED;
- target/parent skills;
- source task ID;
- change summary;
- content diff or generated skill path;
- runtime evidence;
- processed/promoted/rejected status in Skill Lab.

### FR-OS-006: Convert candidates into Skill Lab proposals

Skill Lab shall convert OpenSpace outputs into proposal records:

| OpenSpace output | Skill Lab proposal |
|------------------|--------------------|
| FIX | `PatchProposal` against existing canonical skill. |
| DERIVED single-parent | `NewSkillProposal` or `PatchProposal`, user chooses. |
| DERIVED multi-parent | `NewSkillProposal` plus relationship proposals to all parents. |
| CAPTURED | `NewSkillProposal` requiring canonicalization. |
| Tool degradation fix | `PatchProposal` with tool-dependency evidence. |

Existing `ChangeProposalService` should be extended rather than bypassed.

### FR-OS-007: Validate before promotion

Before applying an OpenSpace-derived proposal to canonical skills, Skill Lab shall run:

1. structural lint;
2. content validation when applicable;
3. skill-escalation requirement for new first-party skills;
4. relationship proposal checks for derived/captured skills;
5. index refresh plan if name/description/folder changes.

### FR-OS-008: Preserve OpenSpace updateability

The integration shall use OpenSpace as:

- an MCP server;
- a separate Python package/repo;
- a local SQLite data source;
- optional host skills copied or submodule-managed as vendor artifacts.

No implementation shall require modifying OpenSpace source files.

### FR-OS-009: Cloud sharing policy

Skill Lab shall surface cloud upload as a separate decision, not an automatic action.

Defaults:

- no OpenSpace API key required;
- no public upload by default;
- private upload only after explicit confirmation;
- public upload only after an additional review that checks for personal paths, secrets, project-specific details, and licensing.

### FR-OS-010: Device-local privacy controls

OpenSpace recordings and analyses may contain prompts, files, tool outputs, and paths. Skill Lab shall:

- read summaries by default;
- avoid ingesting full raw recordings unless requested;
- redact secrets and absolute paths in UI surfaces where possible;
- never commit raw OpenSpace state to the canonical repo.

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-OS-001 | OpenSpace adapter reads must be read-only by default. |
| NFR-OS-002 | Missing OpenSpace installs or DBs must not break Skill Lab startup. |
| NFR-OS-003 | Adapter schema drift should degrade gracefully with a health finding. |
| NFR-OS-004 | Candidate listing should be paginated and bounded. |
| NFR-OS-005 | Full recording reads should be explicit and size-limited. |
| NFR-OS-006 | No cloud upload path may run without explicit user intent. |
| NFR-OS-007 | Canonical writes must pass existing Skill Lab path guards. |
| NFR-OS-008 | Device-specific paths belong in local config, not committed shared config. |
| NFR-OS-009 | OpenSpace dependencies must not be added to Skill Lab's Node package. |
| NFR-OS-010 | Promotion should produce reviewable Git diffs. |

## Proposed Data Contracts

### OpenSpace runtime config

```ts
type OpenSpaceRuntimeConfig = {
  id: string;
  displayName: string;
  workspacePath: string;
  dbPath?: string;
  sandboxSkillDirs: string[];
  cloudEnabled?: boolean;
};
```

### Runtime skill summary

```ts
type OpenSpaceSkillRuntimeSummary = {
  runtimeId: string;
  skillId: string;
  canonicalSkillName?: string;
  name: string;
  path?: string;
  isActive: boolean;
  origin: "imported" | "captured" | "derived" | "fixed" | string;
  generation: number;
  parentSkillIds: string[];
  sourceTaskId?: string;
  changeSummary?: string;
  totalSelections: number;
  totalApplied: number;
  totalCompletions: number;
  totalFallbacks: number;
  appliedRate: number;
  completionRate: number;
  effectiveRate: number;
  fallbackRate: number;
  lastUpdated?: string;
};
```

### Evolution candidate summary

```ts
type OpenSpaceEvolutionCandidate = {
  runtimeId: string;
  candidateId: string;
  taskId: string;
  candidateType: "fix" | "derived" | "captured" | string;
  targetSkillIds: string[];
  canonicalSkillNames: string[];
  direction: string;
  executionNote?: string;
  toolIssues: string[];
  analyzedAt?: string;
  processedAt?: string;
  evidenceRefs: Array<{
    kind: "analysis" | "recording" | "diff" | "skill";
    path?: string;
    quote?: string;
  }>;
};
```

### Promotion status

```ts
type OpenSpacePromotionStatus =
  | "unreviewed"
  | "proposal-created"
  | "lint-failed"
  | "validation-failed"
  | "approved"
  | "promoted"
  | "rejected";
```

## UX Requirements

### Skill detail

Add an optional "Runtime learning" section:

- OpenSpace runtime selector;
- metrics cards;
- latest analyses;
- lineage badge;
- "View evolution candidates" CTA.

### Proposals workbench

Add source labels:

- `source: skill-lab`;
- `source: openspace:{runtimeId}`;
- `candidate type: FIX / DERIVED / CAPTURED`.

### Health page

Add health findings for:

- configured OpenSpace DB missing;
- DB schema unsupported;
- sandbox dir missing;
- canonical repo accidentally configured as OpenSpace write dir;
- cloud enabled without policy sidecar;
- evolved candidates waiting for review.

### Candidate review page

Add a list/detail workflow:

1. filter by runtime, candidate type, canonical skill, status;
2. inspect evidence and diff;
3. choose promotion mode;
4. create Skill Lab proposal;
5. run lint/validate;
6. accept/reject.

## Implementation Plan

### Phase 0: Policy and documentation

Deliverables:

- this PRD;
- optional `skill-set` pointer to this PRD after line-ending normalization;
- optional local setup guide for OpenSpace sandboxing;
- explicit cloud/privacy policy.

Acceptance criteria:

- OpenSpace is documented as external and independently updatable.
- Canonical writes are prohibited by default.
- Multi-device local state model is documented.

### Phase 1: Manual pilot

Deliverables:

- create per-device OpenSpace workspace outside `user-skills`;
- create per-device sandbox skill directory;
- configure OpenSpace MCP manually;
- copy or vendor `delegate-task` and `skill-discovery` only if needed;
- run sample tasks and inspect `.openspace/openspace.db`;
- manually promote one safe captured/fixed improvement through existing `skill-set` workflows.

Acceptance criteria:

- OpenSpace can execute with sandbox skills.
- No `.skill_id`, `.openspace`, logs, or recordings are committed to `user-skills`.
- At least one candidate can be reviewed manually using existing lint/validate.

### Phase 2: Skill Lab read-only OpenSpace adapter

Deliverables:

- config schema for OpenSpace runtime locations;
- `OpenSpaceRuntimeRepository` that opens SQLite read-only;
- summary queries for skill records, stats, analyses, candidates;
- health checks for DB presence/schema;
- MCP/HTTP read endpoints;
- tests using fixture SQLite DB.

Suggested files:

```text
skill-set/mcp-server/src/repositories/OpenSpaceRuntimeRepository.ts
skill-set/mcp-server/src/domain/OpenSpaceRuntimeService.ts
skill-set/mcp-server/src/http/routes/openspace.ts
skill-set/mcp-server/src/mcp/openspaceTools.ts
skill-set/mcp-server/schemas/openspace-*.schema.json
skill-set/mcp-server/tests/openspace-runtime*.test.ts
```

Acceptance criteria:

- Skill Lab starts without OpenSpace installed.
- Configured runtime summaries load from fixture DB.
- Unsupported DB schemas return health findings, not crashes.
- No write operations exist in this phase.

### Phase 3: Runtime metrics in dashboard

Deliverables:

- "Runtime learning" section on skill detail;
- OpenSpace metrics cards;
- lineage/candidate badges;
- health page findings;
- runtime selector.

Acceptance criteria:

- Canonical skills show static and runtime quality separately.
- Runtime-only skills are clearly labeled.
- Candidate counts link to filtered candidate view.

### Phase 4: Candidate-to-proposal conversion

Deliverables:

- candidate review page;
- conversion service from OpenSpace candidate to Skill Lab proposal;
- support for FIX as `PatchProposal`;
- support for CAPTURED / DERIVED as new skill proposal or patch proposal;
- citations/evidence mapping from OpenSpace analyses;
- lint/validate preflight action.

Acceptance criteria:

- User can convert a FIX candidate into a reviewable diff.
- User can convert a CAPTURED candidate into a standards-compliant draft skill requiring `references/skill-escalation.md`.
- Proposals preserve source runtime, task ID, and OpenSpace change summary.
- Existing path guards and proposal validation apply.

### Phase 5: Promotion workflow and Git safety

Deliverables:

- apply-approved-patch integration if/when Skill Lab R1 apply exists;
- dirty-tree overlap checks;
- index refresh prompts;
- relationship proposal creation for derived/captured skills;
- promotion status tracking.

Acceptance criteria:

- Promotion produces a clean Git diff.
- Index refresh requirements are surfaced.
- Derived skills produce relationship edge proposals to parent skills.
- Rejected candidates remain traceable and do not reappear as new unreviewed items unless OpenSpace produces new evidence.

### Phase 6: Optional cloud/private sharing

Deliverables:

- policy sidecar for OpenSpace cloud use;
- private upload command guidance;
- pre-upload redaction checklist;
- optional Skill Lab "prepare for upload" report.

Acceptance criteria:

- Cloud upload cannot happen accidentally through Skill Lab.
- Public upload requires explicit confirmation and privacy review.
- Private upload remains separate from canonical Git promotion.

## Testing Strategy

### Unit tests

- OpenSpace DB path resolution.
- SQLite read-only connection behavior.
- Schema detection and missing-column handling.
- Skill ID to canonical skill mapping.
- Rate calculations.
- Candidate conversion rules.

### Integration tests

- Fixture OpenSpace DB with imported/fixed/derived/captured records.
- Fixture candidate converted into PatchProposal.
- Fixture captured skill converted into NewSkillProposal draft.
- Health scan with missing runtime paths.
- Health scan with canonical repo configured as sandbox write dir.

### Manual tests

- Run OpenSpace on a sandbox skill dir.
- Execute a task that uses a known skill.
- Confirm metrics appear in Skill Lab.
- Trigger or simulate a FIX candidate.
- Convert candidate to proposal.
- Run lint/validate.
- Review diff and promote manually.

## Security and Privacy Considerations

### Primary risks

| Risk | Mitigation |
|------|------------|
| OpenSpace mutates canonical skills | Use sandbox dirs; detect canonical path misconfiguration. |
| Secrets in recordings | Read summaries by default; redact logs; never commit recordings. |
| Public cloud upload leaks personal/project data | Keep API key unset; require explicit upload policy. |
| Malicious cloud-imported skill | Keep cloud auto-import disabled or sandboxed; run skill safety/lint before promotion. |
| Tool overreach | Restrict `OPENSPACE_BACKEND_SCOPE`; exclude GUI unless needed. |
| Dependency compromise | Install OpenSpace independently; pin versions; follow upstream security advisories. |
| Schema drift | Feature-detect DB schema and degrade with health findings. |

### Recommended `.gitignore` coverage

The canonical repo should ignore:

```text
.openspace/
logs/
recordings/
**/.upload_meta.json
**/.skill_id
```

Only add `.skill_id` to Git later if a deliberate cross-device OpenSpace identity policy is adopted.

## Open Questions

1. Should OpenSpace host skills become canonical vendor skills, or remain local setup instructions only?
2. Should Skill Lab store promotion decisions in `.generated/`, a durable catalog artifact, or Git notes?
3. Should per-device OpenSpace summaries be exportable to a portable JSON artifact?
4. Should `.skill_id` ever be committed for promoted skills to preserve OpenSpace lineage across devices?
5. Which OpenSpace cloud visibility levels should be allowed for personal skills?
6. Should Skill Lab support multiple OpenSpace runtimes simultaneously in one dashboard?

## Recommended Initial Decision Set

1. Use OpenSpace as a separate clone/package per device.
2. Configure OpenSpace against a sandbox skill directory.
3. Keep OpenSpace cloud disabled at first.
4. Do not commit `.openspace`, logs, recordings, `.upload_meta.json`, or `.skill_id`.
5. Add a Skill Lab read-only adapter before building any write/promotion automation.
6. Promote useful evolutions only through `skill-set` lint/validate and Git review.

## Success Metrics

| Metric | Target signal |
|--------|---------------|
| Runtime visibility | Skill Lab shows OpenSpace metrics for skills used in sandbox tasks. |
| Promotion safety | 100% of promoted OpenSpace candidates pass lint before canonical write. |
| Canonical cleanliness | No raw OpenSpace state files are committed. |
| Learning usefulness | Repeated task classes produce fewer manual corrections after promoted improvements. |
| Multi-device coherence | Approved improvements sync through Git without requiring OpenSpace DB sync. |
| Upstream updateability | OpenSpace can be updated without changing `skill-set` source code. |

## Summary

OpenSpace should become the self-learning runtime substrate for the personal skill ecosystem, while `skill-set` remains the standards and governance owner. This gives the system runtime memory, task evidence, and evolution candidates without giving up Git-backed portability, multi-device control, reviewability, or independently updatable upstream dependencies.
