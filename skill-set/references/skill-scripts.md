# Skill scripts — division of labor and guardrails

Guidance for executable code under `scripts/` inside a skill. Use when adding, reviewing, or validating scripts in **synthesize**, **lint**, **validate**, or **optimize**.

**Exemplar:** `project-planning` — many markdown files (epics, stories, tasks) with YAML frontmatter and dependency graphs. That work is a poor fit for an LLM alone; scripts **scan the tree**, **parse frontmatter**, **check invariants** (DAG, `traces_to`), and **print agent-readable summaries** (tables, paths, errors). The agent runs the script, reads stdout, then reasons and edits files.

---

## 1. What the LLM does vs what scripts do

| Responsibility | Prefer **scripts** | Prefer **LLM** |
|----------------|-------------------|----------------|
| Walk directories, globs, many files | Yes | No |
| Parse YAML/JSON/TOML, validate schema | Yes | Only tiny snippets |
| Graph algorithms (cycles, topo sort), diff large trees | Yes | No |
| Deterministic lint rules (required fields, IDs) | Yes | Assist only |
| Summarize **findings** into a fixed report format for the agent | Yes (stdout) | Can polish wording after |
| Judgment, trade-offs, rewriting prose, epic/story **content** | Optional | Yes |
| When user intent is ambiguous | — | Yes |

**Pattern:** scripts **project** structured reality → **one screen** of facts; the agent **decides** and **mutates** artifacts. Avoid asking the model to “remember” fifty file paths or manually trace `depends_on` across a folder.

---

## 2. Language and dependencies

| Rule | Detail |
|------|--------|
| **One runtime per skill** | Pick **either** Python **or** Bun/TypeScript (or another single stack) for all `scripts/` in that skill. Mixing languages raises maintenance and agent confusion. |
| **Default stacks** | **Python** (stdlib-first, widespread) or **Bun + TypeScript** (fast, typed, good for CLI). Choose based on repo norms and whether the skill already ships one stack. |
| **Minimize dependencies** | Prefer stdlib / built-ins. If you need packages, pin versions in a small manifest (`package.json`, `requirements.txt`, or `pyproject.toml`) **next to** `scripts/` or document install one-liner in `SKILL.md`. |
| **No secret installs at runtime** | Do not fetch packages implicitly during normal execution; fail clearly if deps are missing. |

---

## 3. Layout and shared code

| Rule | Detail |
|------|--------|
| **`scripts/lib/`** | Shared parsing, path resolution, types, and CLI helpers live here. Top-level `scripts/*.ts` or `scripts/*.py` are **thin entrypoints** that call into `lib/`. |
| **Stable imports** | Use relative imports within the skill; avoid fragile global installs unless documented. |
| **Naming** | Entry scripts: verb or role (`LintPlan.ts`, `ScanSources.ts`, `update_skill_index.py`). Lib modules: domain (`frontmatter`, `cliShared`, `planningPaths`). |

Reference layout (illustrative):

```
skill-name/
├── scripts/
│   ├── LintPlan.ts
│   ├── ScanSources.ts
│   └── lib/
│       ├── cliShared.ts
│       ├── frontmatter.ts
│       └── types.ts
```

---

## 4. CLI contract for agent-callable scripts

Every script the agent is expected to run **must**:

1. **Support `--help` / `-h`** — Print usage, purpose, required vs optional flags, and examples to **stdout** (plain text or markdown). Exit 0 after help.
2. **Use consistent context flags** where applicable — e.g. `--root`, `--config`, `--project`, aligned with the skill’s manifest story (see project-planning).
3. **Exit codes** — 0 success; non-zero on error; print actionable messages to stderr (or stdout if the agent only captures one stream).
4. **Idempotency** when possible — read-only tools (`scan`, `lint`, `list`) must not mutate unless documented.
5. **Paths** — Accept workspace-relative paths; resolve via `--root`; document forward slashes in skill docs.

**Anti-pattern:** scripts with no help text, forcing the agent to read source to discover flags.

---

## 5. Output shape (agent-readable)

- Prefer **markdown tables**, **bullet lists**, or **stable headings** so the model can parse reliably.
- Start with a one-line **summary** (e.g. project root, glob count, pass/fail).
- On failure, print **file:line** or **id** when known.
- Avoid huge JSON blobs unless a downstream step requires them; summarize for the agent.

---

## 6. Configuration and portability

- Read defaults from a **manifest** or env vars documented in `SKILL.md`; avoid hardcoding user-specific absolute paths as the only option.
- Support a **named default profile** (e.g. “PAI Knowledge layout”) as one option among `--root`-based usage.
- Document required env vars next to the CLI table in `SKILL.md`.

---

## 7. Documentation in the skill

In `SKILL.md` (keep concise):

- **CLI summary table** — script name, one-line role, main flags.
- **When to run** — e.g. “before sharding”, “before sign-off”.
- **Execute vs read** — state if the agent should normally run the script or only consult it as reference (rare for CLI tools).

Do not duplicate full usage in `SKILL.md` if `--help` is complete; link to `references/` for workflow context only.

---

## 8. Security and lint alignment

- Scripts must not exfiltrate credentials or run unexpected network calls without documenting risk (see **lint** workflow, script safety checks).
- Prefer read-only operations for discovery/lint; gate writes behind explicit flags if needed.

---

## 9. Checklist (author / reviewer)

- [ ] One language/runtime for all scripts in this skill
- [ ] Dependencies minimal, pinned or documented
- [ ] Shared logic in `scripts/lib/`
- [ ] Each agent-facing entrypoint implements `--help` / `-h`
- [ ] Consistent `--root` / `--config` (or equivalent) story
- [ ] Stdout optimized for agent consumption (tables, clear errors)
- [ ] `SKILL.md` lists scripts and when to run them

---

## See also

- `references/authoring-guide.md` — short “Utility scripts” pointer and verification checklist
- `references/synthesize.md` — creating new skills with scripts
- `references/lint.md` — structural and script safety expectations
- `references/validate.md` — tool fitness and path brittleness
