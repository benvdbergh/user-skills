# Agent Skills Standard — Quick Reference

A condensed reference for the Agent Skills open standard rules. For full details, see the [Agent Skills specification](https://agentskills.io) and Anthropic's complete guide.

## Folder Structure

```
your-skill-name/          # kebab-case, required
├── SKILL.md              # Required, exact case
├── scripts/              # Optional — executable code
├── references/           # Optional — documentation, data
└── assets/               # Optional — templates, static resources
```

### Directory mapping (migration from legacy PAI)

| Standard directory | Legacy PAI directory | Purpose |
|--------------------|----------------------|---------|
| `scripts/`         | `Tools/`             | Executable code |
| `references/`      | `Workflows/` + `Data/` | Docs, workflows, data |
| `assets/`          | `Templates/`        | Templates, static resources |

## Naming Rules

| Rule | Valid | Invalid |
|------|-------|---------|
| Folder name | `my-cool-skill` | `MyCoolSkill`, `my_cool_skill`, `My Cool Skill` |
| YAML `name` | `my-cool-skill` | `MyCoolSkill`, `my_cool_skill` |
| Name = folder | `name: my-cool-skill` in `my-cool-skill/` | Mismatch between name and folder |
| SKILL.md | `SKILL.md` (exact) | `skill.md`, `SKILL.MD`, `Skill.md` |
| Forbidden prefixes | (anything else) | `claude-*`, `anthropic-*` |

## YAML Frontmatter

### Required Fields

```yaml
---
name: your-skill-name          # kebab-case, matches folder
description: >-                 # WHAT + WHEN, max 1024 chars
  What it does. Use when [trigger phrases].
---
```

### Optional Fields

```yaml
license: MIT                     # SPDX license string
compatibility: "Requires Python 3.10+"  # 1-500 chars
allowed-tools: "Bash(python:*) WebFetch" # Tool whitelist
metadata:
  author: Your Name
  version: 1.0.0
  mcp-server: server-name
```

### Frontmatter Rules

- `---` delimiters are **mandatory** (opening and closing)
- No XML angle brackets (`<` or `>`) — security restriction
- `description` MUST state **what** the skill does AND **when** to use it
- Include specific trigger phrases users would actually say
- Keep description under **1024 characters**

## Description Field Pattern

- **Third person only** — Description is injected into the system prompt; use capability statements, not "I/you."
- **WHAT + WHEN** — Always state what the skill does and when to use it (trigger phrases).

```
[WHAT it does] + [WHEN to use it / trigger phrases] + [optional: scope limits]
```

**Good examples:**
```yaml
description: >-
  Manages Linear project workflows including sprint planning,
  task creation, and status tracking. Use when user mentions
  "sprint", "Linear tasks", "project planning", or asks to
  "create tickets".

description: >-
  End-to-end customer onboarding workflow for PayFlow. Use when
  user says "onboard new customer", "set up subscription", or
  "create PayFlow account".
```

**Bad examples:**
```yaml
description: Helps with projects.          # Too vague, no triggers
description: Creates sophisticated docs.   # No WHEN clause
```

## Progressive Disclosure (Three Levels)

| Level | What Loads | When |
|-------|-----------|------|
| **1 — Discovery** | YAML frontmatter only (`name` + `description`) | Always in system prompt |
| **2 — Activation** | Full SKILL.md body | When agent matches user prompt to skill |
| **3 — Deep Access** | Files in `references/`, `scripts/`, `assets/` | When agent needs them for a specific step |

**Key constraint:** Keep SKILL.md body under ~5,000 words. Move detailed docs to `references/`.

## Design Principles

| Principle | Meaning |
|-----------|---------|
| **Progressive Disclosure** | Only load what's needed at each level (see table above) |
| **Composability** | Skills should work well alongside other skills — don't assume yours is the only one loaded |
| **Portability** | Skills work identically across Claude.ai, Claude Code, and API without modification |

## Forbidden Patterns

| Pattern | Rule |
|---------|------|
| `README.md` in skill folder | Use SKILL.md or references/ instead |
| XML tags in frontmatter | `<` and `>` forbidden (security) |
| `claude-*` or `anthropic-*` names | Reserved prefixes |
| Hardcoded absolute paths | Use relative paths for portability |
| Credentials in plain text | Never include API keys, tokens, passwords |
| Prompt injection patterns | No "ignore previous instructions" etc. |

## Anti-Patterns (Authoring)

| Avoid | Prefer |
|-------|--------|
| Windows-style paths (`scripts\file.py`) | Forward slashes: `scripts/file.py` |
| Many equivalent options without a default | One default + short escape hatch for exceptions |
| Time-sensitive wording ("before 2025 use…") | "Current method" vs "Old patterns (deprecated)" |
| Mixed terminology (URL vs route vs path) | One term per concept throughout |
| Vague names (`helper`, `utils`, `tools`) | Specific names (`processing-pdfs`, `analyzing-spreadsheets`) |

**Full authoring guidance:** `references/authoring-guide.md`

## Skill Categories (from Anthropic's Guide)

| Category | Used For | Example |
|----------|----------|---------|
| **Document & Asset Creation** | Consistent output (docs, code, designs) | `frontend-design` |
| **Workflow Automation** | Multi-step processes | `skill-creator` |
| **MCP Enhancement** | Workflow guidance for MCP tools | `sentry-code-review` |

## Checklist

```
[ ] Folder named in kebab-case
[ ] SKILL.md exists (exact spelling)
[ ] YAML frontmatter has --- delimiters
[ ] name field: kebab-case, matches folder, no forbidden prefixes
[ ] description: third person, includes WHAT + WHEN, under 1024 chars, no XML tags
[ ] No README.md inside skill folder
[ ] SKILL.md under ~500 lines or ~5,000 words
[ ] File references from SKILL.md one level deep
[ ] Examples section present
[ ] Consistent terminology; no time-sensitive wording; no Windows paths
[ ] All referenced files exist
[ ] MCP dependencies documented (if applicable)
[ ] Topic-heavy skills: topic map + agent execution in SKILL.md; no redundant index-only reference file (see `references/authoring-guide.md` — Topic-scoped reference files)
[ ] After adding/removing a skill folder or changing discovery frontmatter: regenerate `<skills-root>/skill-index.json` (`skill-set/scripts/update_skill_index.py`; use `--with-relationship-map` / `-R` when applicable)
[ ] Git: commit from the repository that **owns** `<skills-root>` (often the `skills` repo itself—not assumed to be the parent `.claude/` folder)
```

For full authoring verification, see `references/authoring-guide.md`.
