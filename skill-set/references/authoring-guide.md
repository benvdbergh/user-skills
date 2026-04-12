# Skill Authoring Best Practices

Consolidated guidance for writing effective skills: description design, token efficiency, patterns, and anti-patterns. Use when creating or refining skill content (synthesize, optimize).

**Sources:** Cursor Agent Skills docs, Agent Skills standard, and community practice (progressive disclosure, trigger design).

---

## Description (Discovery Metadata)

The description is **critical** for skill discovery. Only frontmatter (`name` + `description`) is pre-loaded; the agent uses it to decide when to load the full skill.

### Rules

1. **Third person only** — The description is injected into the system prompt. Use capability statements, not "I/you."
   - ✅ "Processes Excel files and generates reports"
   - ❌ "I can help you process Excel files" / "You can use this to process Excel files"

2. **WHAT + WHEN** — Always include both:
   - **WHAT:** Specific capabilities and output formats
   - **WHEN:** Trigger phrases and situations (e.g. "Use when…", "Use when the user mentions…")

3. **Specific and trigger-rich** — Include terms users actually say so the agent can match.
   - ✅ "Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction."
   - ❌ "Helps with documents"

4. **Max 1024 characters, no XML** — No `<` or `>` in frontmatter (security).

### Description Examples

```yaml
# PDF
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.

# Code review
description: Review code for quality, security, and maintainability following team standards. Use when reviewing pull requests, examining code changes, or when the user asks for a code review.

# Git commits
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

### Optional: Negative Triggers

To reduce false triggers, you can state what the skill does **not** do (e.g. "Do not use for X"). Keep this short so the description stays under 1024 chars.

---

## Core Authoring Principles

### 1. Concise is Key

Context is shared with conversation history and other skills. Every token should earn its place.

- **Default:** The agent is already capable. Add only what it does not already know.
- Challenge each block: "Does the agent really need this?" "Can I assume it knows this?"

### 2. Keep SKILL.md Lean

- **Size:** Under ~500 lines or ~5,000 words. Put detailed docs in `references/`.
- **Progressive disclosure:** Essential flow in SKILL.md; deep dives in `references/` or `assets/`, loaded only when needed.
- **References one level deep:** Link from SKILL.md directly to reference files. Avoid long chains (e.g. reference → sub-reference) to prevent partial reads.

### 3. Degrees of Freedom

Match specificity to how fragile the task is:

| Level | When to use | Example |
|-------|-------------|---------|
| **High** (text only) | Many valid approaches, context-dependent | Code review guidelines |
| **Medium** (templates/pseudocode) | Preferred pattern with acceptable variation | Report generation |
| **Low** (exact scripts/steps) | Fragile or consistency-critical | DB migrations, safety-critical scripts |

---

## Common Patterns

### Template Pattern

Define output format explicitly:

```markdown
## Report structure

Use this template:

\`\`\`markdown
# [Title]
## Executive summary
[One paragraph]
## Key findings
- Finding 1
- Finding 2
## Recommendations
1. Action 1
\`\`\`
```

### Examples Pattern

When quality depends on seeing examples, give 2–3 concrete input/output pairs (e.g. commit messages, review feedback).

### Workflow Pattern

Break work into steps with a checklist. For each step: what to do, what to run (if any), and what "done" looks like.

### Conditional Workflow Pattern

Branch by type of request (e.g. "Creating new? → Creation workflow. Editing existing? → Editing workflow."). One entry point, multiple paths.

### Feedback Loop Pattern

For quality-critical tasks: do step → validate (e.g. run script) → if fail, fix and re-validate → only proceed when validation passes.

### Topic-scoped reference files (maintainability)

Use when a skill accumulates **distinct subject areas** (e.g. NFR fitness vs functional API design vs data modeling)—each with its own examples, framework tables, no-gos, and external links.

| Practice | Detail |
|----------|--------|
| **One topic per file** | Keep each `references/{topic}.md` focused; repeat the **same section shape** (when to load, core practices, **examples**, **frameworks/standards table**, **no-gos**, **further reading**) so authors know where to edit. |
| **SKILL.md = orchestration hub** | Put **workflow routing**, a **topic map** (which file for which trigger), and **agent execution steps** in `SKILL.md`. Avoid a separate `references/*-index.md` that only duplicates the hub—agents already load `SKILL.md` at activation. |
| **Cross-link siblings** | At the top of each topic file, a short **Related** line linking peer references and `SKILL.md` (e.g. `../SKILL.md` from `references/`). |
| **References = durable knowledge** | Long procedural “agent workflow” prose belongs in **SKILL.md**; references hold norms, citations, and checklists—not duplicate orchestration. |
| **Ground in external sources** | For “best practices” skills, cite **stable specs and guides** (RFCs, vendor design docs, foundation sites); do not rely only on internal org notes unless scoped as such. Add rows to `references/prior-art.md` (or equivalent) when you introduce major external corpora. |
| **Delegate to other skills** | If another skill owns code-level detail (e.g. Clean Architecture / DDD in code), state **delegation** once in `SKILL.md` or the topic file—avoid overlapping deep guidance. |

---

## Utility Scripts

Pre-made scripts are often better than generated code: more reliable, fewer tokens, consistent behavior.

- Document **how** to run each script (command, args, env).
- State whether the agent should **execute** the script or **read** it as reference.
- Document required packages and clear error handling.
- Use **forward slashes** in paths (e.g. `scripts/helper.py`), not Windows backslashes, for portability.

---

## Anti-Patterns

| Anti-pattern | Preferred |
|--------------|-----------|
| **Windows-style paths** | Use `scripts/helper.py`, not `scripts\helper.py` |
| **Too many options** | One default approach; add a short "escape hatch" for exceptions (e.g. "For OCR, use X instead") |
| **Time-sensitive wording** | Avoid "before August 2025 use old API." Use "Current method" vs "Old patterns (deprecated)" in a collapsible or separate section |
| **Inconsistent terminology** | Pick one term per concept (e.g. "API endpoint" vs "URL"/"route") and use it throughout |
| **Vague skill names** | Use specific names: `processing-pdfs`, `analyzing-spreadsheets` — not `helper`, `utils`, `tools` |
| **Hub reference file** mirroring `SKILL.md` | Use **SKILL.md** for routing + topic map + agent steps; link **directly** to topic references from there |
| **Monolithic reference** mixing many domains | Split by topic; keep shared “cross-links” as short bullets in `SKILL.md` or at top of each topic file |

---

## Skill Creation Phases (Summary)

1. **Discovery** — Purpose, location (e.g. project vs user), triggers, domain knowledge, output format, existing patterns.
2. **Design** — Name (kebab-case, max 64 chars), third-person description (WHAT + WHEN), sections, need for scripts/references.
3. **Implementation** — Directory layout, SKILL.md with frontmatter, references and scripts as needed.
4. **Verification** — Run lint; check description (third person, triggers), size (~500 lines / ~5k words), one-level-deep references, consistent terms, no time-sensitive or brittle wording; if scripts: documented, safe, no Windows paths.

---

## Verification Checklist (Pre-Finalize)

### Core quality

- [ ] Description is specific and includes key terms
- [ ] Description includes WHAT and WHEN
- [ ] Description is in third person
- [ ] SKILL.md under ~500 lines or ~5,000 words
- [ ] Consistent terminology
- [ ] Examples are concrete, not abstract

### Structure

- [ ] File references one level deep from SKILL.md
- [ ] Progressive disclosure used (details in references/assets)
- [ ] Workflows have clear steps
- [ ] No time-sensitive information
- [ ] Large domains split into **topic references**; **SKILL.md** holds topic map + agent steps (see **Topic-scoped reference files** above)

### If including scripts

- [ ] Scripts solve the problem (no placeholders)
- [ ] Required packages documented
- [ ] Error handling explicit and helpful
- [ ] No Windows-style paths

---

**See also:** `references/standard-reference.md` (structure, frontmatter), `references/synthesize.md` (full creation workflow), `references/lint.md` (structural compliance).
