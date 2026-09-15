# Prior art — pdm-linear

Related: [../SKILL.md](../SKILL.md), [skill-escalation.md](skill-escalation.md)

## Linear conceptual model

Linear’s hierarchy for product work (simplified):

```text
Initiative          ← strategic goal / why (workspace)
  └── Project       ← deliverable container (lead, health, docs, dates)
        └── Milestone   ← meaningful phase inside one project
              └── Issue     ← execution unit (PO + Eng — out of scope here)
Cycle               ← team time-box (alongside hierarchy; read-only for PM skill)
```

Sources:

- [Conceptual model](https://linear.app/docs/conceptual-model)
- [Initiatives](https://linear.app/docs/initiatives)
- [Sub-initiatives](https://linear.app/docs/sub-initiatives)
- [Linear for Product Managers](https://linear.app/docs/linear-for-product-managers)
- [Linear MCP](https://linear.app/docs/mcp)
- [Linear MCP for product management](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management)

### Initiatives

Initiatives group projects around company objectives. Properties commonly used in PM practice: status (`Proposed` / `Planned` / `Active` / `Completed` / `Canceled`), priority, target date, labels, health roll-up from projects. Sub-initiatives nest programs up to several levels; parent roll-ups include child projects.

### Projects & documents

Projects are the PM focal point for framing: overview, lead, documents (PRD, notes, research), health, and status updates. Project graphs and milestone completion percentages update as issues complete—PM still does not create those issues from this skill.

### Milestones

Milestones split a **single** project into meaningful stages (e.g. alpha → beta → GA, or outcome phases). Progress is issue-driven in Linear’s product UI; this skill only defines the **outcome phase + exit criteria**. Prefer a milestone when phases share one lead and one issue pool; prefer a **separate project** when a phase needs its own lead, health, or roadmap line.

### Cycles & releases

Cycles are team iteration containers. Releases and release notes are shipping mechanics. This skill may **list** cycles for narrative context only and must never mutate cycles or releases.

### UI-only gaps

Timeline views and project-to-project dependency edges are **UI-only**—no Linear MCP tools. Agents must tell users to set those in the Linear UI when needed.

## Planning model — milestones only

Workspace operating agreement (PM + CARO + Product Manager):

1. PM stops at **outcome milestones** (name, description with exit criteria, optional target date).
2. PO + Eng own **issues** and **cycle** packing under those milestones (`project-planning` / Linear adoption).
3. Do not pre-create issue farms from the PM skill "to get ahead."
4. Initiatives and project shells may exist before a PRD; PRD document + milestones should land before PO handoff.

## Life-Hub pattern note

**Life-Hub** is the reference project for milestone quality in this workspace:

- Milestones are **outcome phases**, not sprint labels.
- Each milestone description states **exit criteria** (what must be true to call the phase done).
- Sequencing is narrative and dated lightly; issue fill comes later from PO.
- **Agent Hub** starts as an empty shell; the first natural full run is **Voice-Native Agent Hub** once the PRD lands—mirror Life-Hub milestone rigor, not Life-Hub’s domain content.

When drafting Agent Hub milestones, copy the *shape* (outcome + exit criteria), not Life-Hub’s specific phase names, unless they genuinely fit.

## Sibling skill prior art in this repo

| Skill | Reuse |
|-------|--------|
| `project-planning` / `references/linear-adoption.md` | Native Linear breakdown for PO; documents `save_issue` as Safe **for that skill**—forbidden here |
| `product-roadmap` | Horizon and sequencing frameworks; feed `pdm-roadmap-sync` |
| `specification` | PRD / requirements quality before `save_document` |
| `value-propositions` | Value narrative before initiative bootstrap |
| `ci-cd-governance` / `release-versioning` | Release and pipeline ownership after Eng ships |

## Anti-patterns observed / to avoid

- Treating a **Project** as the themed outcome (use milestones for phases).
- PM calling `save_issue` because Linear MCP exposes it.
- Packing cycles from a status-update ritual.
- Duplicating roadmap prose into six micro-skills instead of one hub with workflows.
- Inventing MCP calls for Timeline dependencies.
