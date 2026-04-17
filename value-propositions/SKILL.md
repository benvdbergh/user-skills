---
name: value-propositions
description: >-
  Guides creation, critique, and testing of value propositions using established
  business frameworks (Value Proposition Canvas, Jobs to Be Done, Bain Elements
  of Value, B2B economic value logic, Moore-style positioning, HBR business-markets
  discipline, Lean value hypotheses). Use when drafting or analyzing a value
  proposition, value proposition canvas, customer value story, product-market fit
  narrative, elevator pitch, differentiated offer, or when the user asks how to
  measure, validate, or structure customer value. Requires organizational inputs
  and explicit assumptions before applying any framework; does not replace legal,
  pricing, or market research execution.
license: MIT
metadata:
  version: 1.0.0
---

# value-propositions

Core methodology skill for **value proposition** work: structuring offers, mapping them to customer needs, and critiquing claims with evidence-aware discipline.

## When this skill applies

Load when the user wants to:

- **Create** a value proposition, canvas, or segment-specific message
- **Analyze** an existing proposition for gaps, puffery, or segment mismatch
- **Choose a framework** (or combine frameworks) for B2B, B2C, platform, or internal stakeholder audiences
- **Test** propositions as hypotheses (evidence, experiments, learning loops)

Do **not** use this skill as a substitute for **pricing authority**, **legal/compliance sign-off**, or **primary market research**—escalate those concerns per `references/skill-escalation.md`.

## Mandatory first step: organizational inputs

Before applying any framework, complete the **inputs and assumptions gate** in `references/organizational-inputs-and-assumptions.md`.

The agent must:

1. Identify what is **known** vs **assumed** (and label assumptions explicitly).
2. Record which **evidence** exists (interviews, usage data, win/loss, benchmarks) vs what is missing.
3. Decide **segment**, **job**, and **next-best alternative** at least at a working level—otherwise analysis will default to generic marketing language.

If inputs are incomplete, state what is missing and proceed with **hypothesis-grade** outputs only.

## Workflow routing

| Goal | Primary path | Load |
|------|----------------|------|
| Map needs ↔ offer fit; pains/gains; ideate pain relievers and gain creators | Design / iterate | `references/value-proposition-canvas-osterwalder.md` |
| Anchor on customer progress and struggling moments; job-centric wording | Discovery / positioning | `references/jobs-to-be-done.md` |
| Classify type of value; prioritize differentiation vs table stakes; portfolio messaging | Differentiation / messaging architecture | `references/bain-elements-of-value.md` |
| B2B proof, economic logic, alternatives comparison (no fake precision) | Business case / sales narrative | `references/economic-value-and-pricing-logic.md` |
| Crisp “for / who / unlike” tech GTM phrasing | Elevator pitch / category + alternative | `references/moore-positioning-statement.md` |
| Resist puffery; require proof and documentation discipline | Credibility / board or enterprise scrutiny | `references/hbr-business-markets-value-propositions.md` |
| Treat VP as testable hypothesis; MVP and learning plan | Startup or innovation validation | `references/lean-startup-value-hypothesis.md` |
| Structured critique of an existing VP document | Review / gap analysis | `references/gap-analysis-and-critique-checklist.md` |

**Prior art summary (market landscape):** consolidated frameworks and links live in `references/prior-art-market-landscape.md` (read when calibrating terminology or extending references).

## Topic map (quick)

| Need | Framework family | Reference file |
|------|------------------|----------------|
| Customer profile + value map | Value Proposition Canvas | `references/value-proposition-canvas-osterwalder.md` |
| Jobs, circumstances, progress | Jobs to Be Done | `references/jobs-to-be-done.md` |
| Pyramid of functional and higher-order value | Bain Elements of Value | `references/bain-elements-of-value.md` |
| Reference offer + differential value story | Economic value / alternatives | `references/economic-value-and-pricing-logic.md` |
| Six-part positioning sentence | Moore-style formula | `references/moore-positioning-statement.md` |
| Evidence-backed B2B claims | HBR-style discipline | `references/hbr-business-markets-value-propositions.md` |
| Validate or invalidate quickly | Lean value hypothesis | `references/lean-startup-value-hypothesis.md` |

## Agent execution patterns

### Pattern A — Create (draft → refine → evidence plan)

1. Complete inputs gate: `references/organizational-inputs-and-assumptions.md`
2. Choose primary framework(s) from workflow table (often VPC + one of Bain / economic / Moore for packaging)
3. Draft proposition(s) **per segment**; avoid one-size-fits-all unless scope is explicitly single-segment
4. Add **proof points** and **failure modes** (what would falsify the claim)
5. If validation is in scope: add test plan per `references/lean-startup-value-hypothesis.md`

### Pattern B — Analyze (inventory → critique → gaps)

1. Inputs gate: confirm segment, job, and alternative for the document being reviewed
2. Run `references/gap-analysis-and-critique-checklist.md`
3. Cross-check value type mix with `references/bain-elements-of-value.md` (table stakes vs differentiated)
4. Flag unsubstantiated claims using `references/hbr-business-markets-value-propositions.md`

### Pattern C — Compare frameworks (pick one primary)

- **Fit / discovery** → VPC + JTBD
- **Enterprise credibility** → HBR discipline + economic/alternative story
- **Portfolio / messaging layers** → Bain Elements of Value
- **Category GTM sentence** → Moore formula + whole-product caveats in escalation doc

## Outputs (recommended shapes)

Keep outputs **board-safe**: concrete mechanisms and observable outcomes; avoid fabricated metrics. Prefer ranges, directional language, or “evidence required” placeholders when data is missing.

- **One-page VP canvas** (bulleted customer profile + value map) when designing
- **Critique memo**: Top issues, missing inputs, suggested rewrites, evidence to collect
- **Hypothesis card**: Claim, segment, measure, experiment, falsifier (when testing)

## Examples

**Example 1 — “Critique our value props”**  
Load organizational inputs → read the document → apply gap checklist + HBR proof discipline → return prioritized issues and rewrite options per segment.

**Example 2 — “Draft value props for a platform”**  
Inputs gate → VPC for customer jobs/pains/gains → Bain to layer table stakes vs differentiated value → Moore sentence for external narrative → evidence plan.

**Example 3 — “Are we using the right framework?”**  
Use workflow routing table; if multiple segments and proof is required, recommend VPC + economic alternative story + HBR documentation discipline.

## Escalation and boundaries

See `references/skill-escalation.md` for ownership, non-goals, and handoffs (e.g. `product-knowledge-catalog`, `specification`, `market-segmentation-research`, `tech-documentation`).
