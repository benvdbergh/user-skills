# Effectiveness assessment (reference)

This reference defines the **strategic quality and effectiveness assessment** that a full **validate** run should append to the validation report, alongside per-dimension scores. It is **not** the validate workflow itself—that lives in [validate.md](validate.md). Use this file for **section definitions**, **output shape**, and **proportionality** when turning rubric findings into a coherent advisory narrative (domain bar, ecosystem, goals→design, proposed shape, success criteria).

It generalizes the pattern used for high-quality skill refactors: thin routing hub, market-grounded references, configurable contracts, ecosystem handoffs.

**Use it when:** running a full validate after lint; the user asks for a “deep review”, “effectiveness assessment”, “quality analysis”, or “complete skill overhaul”; or the effectiveness score is below “Good” and structural fixes alone are insufficient.

**Relationship to validate.md:** Phases 1–6 of `validate.md` score instruction quality, tokens, tools, prompting, and ecosystem fit. This reference adds the **synthesis layer** so recommendations read like a structured quality review and redesign brief, not only a checklist.

---

## 1. Domain quality bar (market / professional practices)

Answer: **What should “quality” mean for this skill’s domain?**

- Name **3–7** established practices, frameworks, or patterns from the profession (e.g. agile decomposition, observability SLOs, ADR conventions, UX design, strategy consultancy, micro finance, lean startup, etc.). Prefer **citable** sources (official docs, well-known books/articles, standards bodies).
- For each practice, state in one line how an **agent following the skill** should behave if the skill is “excellent.”
- Mark **gaps**: practices the skill never mentions vs practices buried only in prose without mandatory agent behaviors.

**Output artifact:** a compact subsection **“Domain quality bar”** (bullet list + gap notes, target ~150–400 words unless the user asked for exhaustive research).

> **Composition:** For exhaustive market research, compose with **research-analysis** / **deep-research**; validate still records a **benchmark summary** here (see `validate.md` Phase 1, Prior Art).

---

## 2. Ecosystem & workspace context

Answer: **How does this skill sit among neighbors, and what pain exists in concrete artifacts?**

| Lens | What to capture |
|------|-----------------|
| **Adjacent skills** | Table: skill name → role relative to target (upstream/downstream/overlap); handoff surface (paths, fields, triggers). |
| **Peer / public patterns** | How Agent Skills / community skills typically handle this domain (thin `SKILL.md`, `references/`, progressive disclosure)—not as mandatory copy, as calibration. |
| **Codebase / config reality** | If the skill ships scripts: note brittle assumptions (hardcoded roots, env vars, folder names). Point to files/lines when validating in-repo. |

**Output artifact:** subsection **“Ecosystem & context”** with the table and any **integration contract** risks (e.g. shared toolchain with another skill).

---

## 3. Stated goals → design choices

If the user (or the skill’s own description) implies goals, map them explicitly:

| Goal (verbatim or paraphrased) | Design response (what the skill should do structurally) |
|--------------------------------|-----------------------------------------------------------|
| e.g. inject market-standard knowledge | Dedicated `references/*`; mandatory behaviors in `SKILL.md`; no duplicate essays in every workflow file |
| e.g. work across projects | Manifest or config; `--root` / env overrides; defaults documented as one profile among many |
| e.g. scriptable artifacts | Documented frontmatter/schema; globs; lint/validate scripts keyed off config |

**Output artifact:** **“Goals → design choices”** table (even if inferred from the skill’s current text).

---

## 4. Proposed rework shape (template)

Structure recommendations so an implementer could open a PR from them.

### 4.1 Positioning (one sentence)

> This skill enables [agent] to [outcome] when [triggers], by [mechanism: orchestration / references / scripts / MCP].

### 4.2 Level 2 — `SKILL.md`

- Triggers expanded beyond the narrowest phrase.
- **Mandatory agent behaviors** (short bullets): non-negotiable checks before/while executing.
- **Workflow routing table** → `references/*.md` (no long prose duplication).
- **Integration** subsection: what to read from other skills; what this skill emits (paths, fields, links).

### 4.3 Level 3 — `references/`

Topic-scoped files (agile foundations, decomposition, tool safety, etc.—**domain-specific**). Each file has a single job; defer shared prose to one canonical reference.

### 4.4 Operational detail (for agents)

Steps that run **before** inventing scope: discovery (globs, search, inventory tables), prioritization rules, “only then propose …” ordering.

### 4.5 Contracts (machine- and human-readable)

- Frontmatter or manifest fields the skill **owns** (ids, links, statuses, dependencies).
- What **lint** / scripts must validate vs what remains human judgment.
- For skills with `scripts/`, align entrypoints and agent-readable output with [skill-scripts.md](skill-scripts.md).

### 4.6 Config & defaults

- Single manifest or convention file at workspace root (when applicable).
- CLI flags: `--root`, `--config`, env overrides; backward-compatible defaults as **named profiles**, not silent global paths.

### 4.7 Assets

Templates aligned with the contract; minimal bodies; links to references for rationale.

### 4.8 skill-set / catalog follow-up

After material rework: bump `metadata.version`, regenerate `skill-index.json` (`update_skill_index.py`), refresh relationship map notes / inventory purpose text when integration surface changes.

**Output artifact:** section **“Proposed rework”** using the headings above (omit subsections that do not apply, e.g. no manifest for a pure doc skill).

---

## 5. Drop, demote, retain

| Category | Examples |
|----------|----------|
| **Drop** | Duplicate narrative across `SKILL.md` and every workflow; stale time-bound text; hallucinated tools |
| **Demote** | Long tutorials → `references/`; optional behaviors → config flag |
| **Retain** | Routing table, mandatory behaviors, one canonical deep dive per topic, working scripts with documented interfaces |

**Output artifact:** bullet list **“Drop / demote / retain”**.

---

## 6. Success criteria for the rework

Define **testable** outcomes for the skill after changes, e.g.:

- An agent following **only** this skill produces [artifact] that passes [check].
- Same skill works for [context A] and [context B] with only [config change].
- Scripts operate on [globs/schema] without renaming folders in code.

**Output artifact:** **“Success criteria”** (3–7 bullets).

---

## 7. Suggested implementation order

Numbered list **(1) contracts & references → (2) SKILL.md routing → (3) scripts/config → (4) adjacent skill doc alignment → (5) catalog/index/relationship map**. Adjust per skill.

---

## Calibration

- **Proportionality:** A small skill gets a shorter assessment; do not paste a novel into every report.
- **Honesty:** If prior art search is thin, say so; do not fabricate market practices.
- **Lint first:** Structural issues from `lint.md` belong in the lint report; this assessment focuses on **effectiveness and redesign coherence**.
