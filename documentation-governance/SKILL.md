---
name: documentation-governance
description: >-
  Global documentation governance and coverage orchestrator that defines reusable policies, quality gates, and assessment reporting for technical and professional documentation. Use when the user asks to define documentation standards, run governance checks on a document or portfolio, assess coverage against code/products, or enforce review gates before publish/merge.
license: MIT
metadata:
  scope: global
  tier: core
  version: 1.0.0
---

# documentation-governance

Global, vault-agnostic **documentation governance and coverage** skill that defines reusable policies, runs structured assessments, and produces governance reports across individual documents and portfolios.

This skill focuses on **what** governance looks like (policies, coverage rules, quality gates, reporting) and **how** to orchestrate checks; vault-local adapters (such as an Ai-Vault `documentation` wrapper) are responsible for applying local paths, taxonomies, and CI hooks.

---

## Overview & Positioning

- **Scope**: Governance of technical and professional documentation (design docs, runbooks, architecture docs, capability docs, API references, product docs, knowledge articles).
- **Core capability**:
  - Define **policies** describing expected structure, quality, terminology, and coverage (per doc type and portfolio).
  - Run **assessments** on a single document or a portfolio, producing structured `AssessmentResult` objects.
  - Support **quality gates** (pass / warn / fail) that upstream skills can apply before publish, export, or merge.
  - Generate **governance reports** for stakeholders (coverage dashboards, risk views, and change impact summaries).
- **Key consumers**:
  - Global `tech-documentation` for governance-aware authoring, audit, and pre-publish checks.
  - Discovery and catalog skills (`code-discovery-for-docs`, `product-knowledge-catalog`) for coverage baselines and terminology rules.
  - Vault-local documentation orchestrators (e.g., Ai-Vault `documentation`) that embed governance into environment-specific flows.

### When to use `documentation-governance`

Activate this skill whenever the user:

- Mentions **documentation standards**, **policies**, **quality gates**, or **review criteria**.
- Asks to **check a document** for compliance, completeness, or **readiness to publish**.
- Wants to understand **coverage** (e.g., "which services or products lack docs?").
- Requests a **portfolio-level documentation audit** or **governance report**.
- Mentions **PR/merge checks**, **change impact on docs**, or **docs-as-code governance**.

---

## Policy Objects & Shared Types

This skill works with **policy** and **result** objects that can be shared with other skills. Full schema details and examples are in `references/policy-schema.md`.

At a high level:

- **DocTypePolicy**
  - Describes expectations for a specific **doc type** (e.g., "architecture-doc", "runbook", "API-reference").
  - Captures required/optional sections, structural rules, style/tone expectations, and links to terminology and coverage rules.
  - Key relationships:
    - Refers to **document artifacts** via `ArtifactRef` (e.g., Markdown file path + logical identifier).
    - May reference **catalog entities** (e.g., product, capability, module IDs) to express contextual expectations.

- **CoveragePolicy**
  - Describes expected **coverage** across a portfolio:
    - For code: coverage against a `ModuleMap` / `APIIndex`.
    - For product/capability: coverage against `DomainTerm` / catalog entities from `product-knowledge-catalog`.
  - Expresses thresholds (e.g., "every module in payments-service must have at least one runbook and one architecture doc") and tolerances (allowed gaps, risk classification).
  - Consumes **discovery outputs** from `code-discovery-for-docs` and **catalog views** from `product-knowledge-catalog`.

- **AssessmentResult**
  - Canonical result object for governance checks.
  - Appears at two levels:
    - **Doc-level**: assessment of a single artifact (e.g., one Markdown file vs. applicable `DocTypePolicy` and coverage expectations).
    - **Portfolio-level**: aggregated view across many artifacts (coverage percentages, risk buckets, policy compliance rates).
  - Designed to be reused by upstream skills (e.g., `tech-documentation` audits, CI dashboards, governance reports).

### Shared Type Contracts

This skill expects — and will **consume, not own** — the following shared types once defined by adjacent skills:

- `ArtifactRef`: Stable reference to a documentation artifact (e.g., logical ID, file path, doc type, tags).
- `ModuleMap`: Representation of code modules/services and their relationships, typically produced by `code-discovery-for-docs`.
- `APIIndex`: Index of API endpoints and groups, also typically from `code-discovery-for-docs`.
- `DomainTerm`: Canonical domain/product/feature term (e.g., from `product-knowledge-catalog`).
- `AssessmentResult`: Shared result schema for governance assessments (this skill defines the initial contract; others may extend).

**Location & ownership (expected pattern)**:

- Canonical schema definitions SHOULD live in shared references, e.g.:
  - `~/.claude/skills/shared/references/artifacts-and-coverage-schema.md` for `ArtifactRef`, `ModuleMap`, `APIIndex`.
  - `~/.claude/skills/shared/references/domain-terms-and-catalog-schema.md` for `DomainTerm` and catalog entities.
  - `~/.claude/skills/documentation-governance/references/policy-schema.md` for `DocTypePolicy`, `CoveragePolicy`, `AssessmentResult`.
- Until those shared references exist, this skill:
  - Documents expected fields and relationships in `references/policy-schema.md`.
  - Treats shared types as **contracts**: if a caller supplies compatible structures, governance workflows will use them; if not available, workflows degrade gracefully (e.g., structure-only checks without coverage metrics).

See `references/policy-schema.md` for precise field names, optional/required attributes, and example payloads.

---

## Workflow Modes

`documentation-governance` exposes five primary workflow modes. Each can be invoked directly or orchestrated by other skills.

### 1. Policy Definition

**Purpose**: Create, refine, and version **DocTypePolicy** and **CoveragePolicy** objects.

- **Typical triggers**:
  - "define documentation standards for architecture docs"
  - "set coverage rules for our services' runbooks"
  - "update the policy for API reference docs"
- **Actions**:
  - Capture goals, doc types, and constraints.
  - Design or refine policy objects (`DocTypePolicy`, `CoveragePolicy`).
  - Map policies to shared types (e.g., which products/modules the policy applies to).
  - Store policy definitions in caller-owned configuration (e.g., policy files in a repo or vault).

See `references/policy-schema.md` for recommended storage patterns and versioning approaches.

### 2. Single-File Doc Assessment

**Purpose**: Assess a **single document** (via `ArtifactRef` or raw content) against applicable policies.

- **Typical triggers**:
  - "check this design doc against our standards"
  - "is this runbook ready for on-call?"
  - "governance check on this Markdown file"
- **Actions**:
  - Resolve the artifact (via `ArtifactRef` or provided content and metadata).
  - Determine applicable `DocTypePolicy` (by doc type, tags, or caller-provided policy set).
  - Optionally pull coverage context (e.g., linked module or product IDs).
  - Produce a doc-level `AssessmentResult` with:
    - Policy compliance status (pass / warn / fail).
    - Structured findings (missing sections, terminology issues, coverage gaps).
    - Recommended fixes and, optionally, auto-fix proposals.

Upstream skills (e.g., `tech-documentation`, vault-local `documentation`) can surface these findings as inline comments, checklists, or CI annotations.

### 3. Portfolio Coverage Scan

**Purpose**: Assess **coverage** and policy compliance across a set of artifacts (e.g., an entire service, product line, or vault).

- **Typical triggers**:
  - "scan our payments services for documentation gaps"
  - "portfolio-level documentation coverage report"
  - "which products lack architecture or runbook docs?"
- **Actions**:
  - Accept a scope description (e.g., services/modules, products/capabilities, or folder sets).
  - Use `code-discovery-for-docs` outputs (`ModuleMap`, `APIIndex`) as a baseline for "what exists in code".
  - Use `product-knowledge-catalog` outputs (e.g., products, capabilities, features) as a baseline for "what exists in the catalog".
  - Map discovered artifacts (`ArtifactRef`s) to these baselines.
  - Apply `CoveragePolicy` rules to compute:
    - Coverage percentages per scope (service, product, capability, API group).
    - Risk classifications (e.g., red/yellow/green).
    - Focused lists of missing or stale docs.
  - Return a portfolio-level `AssessmentResult` bundle suitable for dashboards or reports.

### 4. PR / Change Impact Check

**Purpose**: Evaluate how a **change** (code diff, spec update, or doc changes) affects documentation coverage and compliance.

- **Typical triggers**:
  - "check documentation impact for this PR"
  - "what docs are missing for this service change?"
  - "ensure docs are updated before merging"
- **Actions**:
  - Accept a change description (e.g., list of impacted modules/APIs/products and any modified docs).
  - Use `code-discovery-for-docs` to understand the code-side impact (new or changed modules/APIs).
  - Map impacted areas to docs via `ArtifactRef`s (e.g., which docs reference these modules/products).
  - Run:
    - Targeted **Single-File Doc Assessments** for changed/related docs.
    - Incremental **CoveragePolicy** checks for impacted scope only.
  - Produce an `AssessmentResult` focused on:
    - Required doc updates or creations before merge.
    - Suggested reviewers or owners (if available from catalog or caller context).
    - A merge gating recommendation (pass / warn / fail) for the change.

This mode is intentionally **CI/PR-integration-friendly**, but it only defines the **contract**; CI wiring and tool invocation belong to vault-local adapters or external automation.

### 5. Governance Reporting

**Purpose**: Aggregate assessment results into **human-friendly governance reports** for stakeholders.

- **Typical triggers**:
  - "generate a quarterly documentation governance report"
  - "show coverage by product and risk level"
  - "summarize governance findings for leadership"
- **Actions**:
  - Accept one or more `AssessmentResult` collections (from Single-File, Portfolio, or PR checks).
  - Aggregate by:
    - Scope (product, service, domain, team).
    - Policy (doc types, coverage rules).
    - Risk (severity, SLAs, remediation status).
  - Produce:
    - Narrative summaries for executives.
    - Tables and charts for practitioners (e.g., by risk, coverage, policy compliance).
    - Optional hooks for visualization skills (e.g., `web-visual`, `diagram`) if the caller requests visuals.

Report formatting and persistence are delegated to callers; this skill focuses on **what to report** and how to structure the data.

---

## Integration with Other Skills

### With `tech-documentation` (global)

`tech-documentation` is the **primary orchestrator** for documentation workflows; `documentation-governance` augments it with governance-aware checks:

- **Before publish/export**:
  - For `create`, `edit`, and `enrich` workflows, `tech-documentation` SHOULD:
    - Call Single-File Doc Assessment to ensure the document meets its `DocTypePolicy`.
    - Optionally surface findings inline and gate high-risk publishes based on `AssessmentResult.status`.
- **During audits**:
  - For `audit` workflows, `tech-documentation` SHOULD:
    - Treat `documentation-governance` as the structured governance engine.
    - Use `AssessmentResult` objects to drive suggested edits and highlight critical issues.
- **During impact-analysis**:
  - When retargeting or repurposing a doc, `tech-documentation` MAY:
    - Ask `documentation-governance` to recompute compliance under the new target doc type/policy.

Integration is **skill-to-skill**: this skill does not assume any particular vault, CI system, or file layout.

### With `code-discovery-for-docs`

`documentation-governance` relies on `code-discovery-for-docs` to understand **what exists in code**:

- Uses **Module and API baselines**:
  - `ModuleMap` and `APIIndex` from discovery provide the universe of modules/services/endpoints to be covered.
- Supports **Portfolio Coverage Scan** and **PR / Change Impact Check**:
  - Coverage policies refer to modules/APIs by stable IDs.
  - Discovery outputs allow governance to identify uncovered or under-documented modules/APIs.
- Governance does **not** reimplement discovery:
  - If discovery data is missing, coverage-related checks degrade gracefully (e.g., run structure/style checks only, and flag "coverage baseline unavailable" in `AssessmentResult`).

### With `product-knowledge-catalog`

`documentation-governance` relies on `product-knowledge-catalog` for **terminology and product/capability scope**:

- **Terminology enforcement**:
  - Policies can require that docs use canonical `DomainTerm`s (product names, capability labels, feature names).
  - Assessments can flag divergent terms or missing definitions.
- **Product/capability coverage**:
  - Coverage policies can assert that each product/capability has at least certain doc types (e.g., overview, runbook, architecture).
  - Catalog outputs define which entities exist and which are in/out of scope.
- As with discovery, this skill **consumes but does not define** catalog structures; it expects stable IDs and term metadata from the catalog skill.

### With Ai-Vault `documentation` wrapper

Within Ai-Vault, the `documentation` skill is a **vault-local orchestrator** that already composes with `tech-documentation`.

- `documentation` SHOULD:
  - Treat `documentation-governance` as the **governance engine** behind its "standards/governance" triggers.
  - Supply vault-specific policy storage locations (e.g., policy files in the vault repo) and doc taxonomies.
  - Optionally wire governance modes into:
    - Authoring flows (e.g., "run governance audit on save").
    - CI/PR checks (e.g., "block merge if assessment status is fail").
- This skill remains **vault-agnostic**; all Ai-Vault conventions live in the `documentation` wrapper, not here.

---

## MCP Dependencies

`documentation-governance` is primarily **logic/orchestration-level** and does not require direct MCP integration to function. Instead:

- It relies on **other skills** (e.g., `code-discovery-for-docs`, `product-knowledge-catalog`, `tech-documentation`) to interact with repositories, CI systems, or external tools.
- Any concrete MCP dependencies (e.g., repo scanners, CI status APIs, Confluence backends) SHOULD be documented in those skills or in vault-local adapters, not here.

If, in a given environment, this skill is extended with scripts or MCP-backed tooling (for example, to pull assessment baselines from CI), that wiring MUST:

- Follow the Agent Skills standard for MCP discovery and safety.
- Document dependencies and tool usage in local wrappers or extension skills instead of modifying this global core.

---

## Tool Usage Mapping

Even without direct MCP tools, this skill participates in workflows that other skills may implement. The table below describes how **workflow steps** should use `documentation-governance` conceptually.

| Workflow Step                   | Skill / Mechanism            | Purpose                                       | Safety Level          |
|---------------------------------|------------------------------|-----------------------------------------------|-----------------------|
| Define or update policies       | `documentation-governance`   | Capture/maintain `DocTypePolicy` and `CoveragePolicy` | Safe (config-level)   |
| Assess single document          | `documentation-governance`   | Produce doc-level `AssessmentResult`          | Safe (read-only)      |
| Run portfolio coverage scan     | `documentation-governance` + `code-discovery-for-docs` + `product-knowledge-catalog` | Compute coverage metrics and gaps            | Safe (read-only)      |
| Run PR/change impact check      | `documentation-governance` + discovery/catalog skills | Identify required doc updates before merge   | Requires Confirmation (for gating decisions) |
| Generate governance report      | `documentation-governance`   | Aggregate results into human-readable outputs | Safe (reporting only) |

Downstream skills that actually touch files, CI status, or external systems MUST define their own MCP mappings and safety policies.

---

## Tool Safety Policy

Within this skill’s scope:

- **Safe Operations**:
  - Designing and updating policy objects based on user intent.
  - Reading and analyzing document content supplied by callers.
  - Consuming discovery/catalog data to compute coverage metrics.
  - Producing `AssessmentResult` objects and narrative reports.
- **Requires Confirmation**:
  - Using assessments to **gate merges or publishes** (e.g., blocking a PR based on `AssessmentResult.status`).
  - Any suggestion to automatically apply large-scale, multi-file changes based on findings (should be mediated by an orchestrator skill).
- **Never Allowed (in this core skill)**:
  - Directly modifying repositories, CI configurations, or external systems.
  - Running destructive operations (e.g., deleting docs, rewriting histories) without going through a dedicated, higher-privilege skill.

---

## Examples

### Example 1: Define Policy + Assess a Single Doc

1. User: "Define our standard for architecture docs and check this doc against it."
2. `documentation-governance`:
   - Asks clarifying questions about required sections (e.g., Context, Decisions, Risks, Diagrams), audiences, and quality expectations.
   - Creates a `DocTypePolicy` for `architecture-doc` and suggests where the caller should store it (e.g., policy YAML/JSON in a repo).
   - Runs a **Single-File Doc Assessment** on the provided architecture doc using the new policy.
   - Returns a doc-level `AssessmentResult` with:
     - Status (e.g., `warn`).
     - Findings (missing sections, unclear decisions, missing links to capabilities).
     - Suggested fixes and priorities.

Upstream, `tech-documentation` or a vault-local `documentation` wrapper can guide the user through applying those fixes.

### Example 2: Portfolio Coverage Scan for a Service Group

1. User: "Scan our payments services for documentation gaps and give me a summary."
2. `documentation-governance`:
   - Requests or receives `ModuleMap`/`APIIndex` for payments from `code-discovery-for-docs`.
   - Uses any existing `CoveragePolicy` for "payments" (or co-designs one if missing).
   - Maps `ArtifactRef`s (docs) to services/APIs and evaluates coverage.
   - Returns:
     - Coverage percentages per service and API group.
     - Lists of missing or outdated docs.
     - A portfolio-level `AssessmentResult` aggregated by service and risk.

The caller can then feed these results into dashboards or governance reports.

### Example 3: PR / Change Impact Check

1. User or CI system: "For this PR touching `orders-service`, ensure docs are updated before merge."
2. `documentation-governance`:
   - Uses `code-discovery-for-docs` to understand which modules/APIs changed.
   - Identifies affected docs via `ArtifactRef` mapping (e.g., architecture doc, runbook, API reference).
   - Runs Single-File assessments on those docs and checks `CoveragePolicy` for orders-related scope.
   - Produces an `AssessmentResult` indicating:
     - Required doc updates or missing docs.
     - Whether the PR should be considered pass, warn, or fail from a governance perspective.

The CI wiring that enforces this recommendation lives outside this skill; here we only define the assessment and its outputs.

---

For detailed object schemas, field-level guidance, and more worked examples, see:

- `references/policy-schema.md`
- `references/examples.md`

