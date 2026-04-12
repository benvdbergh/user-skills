# Lint Workflow

Check an existing skill's structure, compliance with the Agent Skills standard, MCP integration, and generate a compliance score.

**Scope:** Structural and formatting compliance only. For content-level effectiveness validation, use the **validate** workflow (`references/validate.md`).

## When to Use

- User requests: "lint skill", "check skill structure", "check compliance", "verify structure"
- After creating or modifying a skill
- Before deploying a skill to production
- After canonicalizing a skill
- Need to ensure skill follows structural conventions

## Validation Categories

The linter checks four categories, inspired by the agnix rule-set:

| Category | Focus | Key Checks |
|----------|-------|------------|
| **Structural** | File/folder integrity | Case-sensitive naming, required metadata, path safety |
| **Syntax** | YAML and Markdown correctness | Proper quoting, YAML delimiters, markdown formatting |
| **Security** | Injection and credential safety | Prompt injection patterns, script permissions, credential leakage |
| **Portability** | Cross-platform compatibility | Works across Claude Code, Claude.ai, API |

## Workflow Steps

### 1. Load Skill Definition

- Load `{skill-path}/SKILL.md`
- Parse YAML frontmatter
- Extract skill metadata
- List all files in skill directory

### 2. Structural Checks

| # | Check | Pass Criteria | Severity |
|---|-------|---------------|----------|
| S1 | SKILL.md exists | File named exactly `SKILL.md` at top level | CRITICAL |
| S2 | Folder name kebab-case | `^[a-z0-9]+(-[a-z0-9]+)*$` | CRITICAL |
| S3 | No README.md | No `README.md` inside skill folder | WARNING |
| S4 | No path traversal | No `../` in any file references | CRITICAL |
| S5 | Standard directories | Only `scripts/`, `references/`, `assets/` (plus root files) | WARNING |
| S6 | Referenced files exist | All files in Workflow Routing table exist | ERROR |
| S7 | No empty SKILL.md | SKILL.md has content beyond frontmatter | ERROR |

### 3. Syntax Checks — YAML Frontmatter

| # | Check | Pass Criteria | Severity |
|---|-------|---------------|----------|
| Y1 | YAML delimiters | Starts with `---` and has closing `---` | CRITICAL |
| Y2 | `name` field present | `name` field exists and is non-empty | CRITICAL |
| Y3 | `name` is kebab-case | `^[a-z0-9]+(-[a-z0-9]+)*$` | CRITICAL |
| Y4 | `name` matches folder | YAML `name` equals folder name | ERROR |
| Y5 | `description` present | `description` field exists and is non-empty | CRITICAL |
| Y6 | Description has triggers | Contains trigger phrases (WHEN/USE WHEN pattern) | WARNING |
| Y7 | Description length | Under 1024 characters | ERROR |
| Y8 | No XML tags | No `<` or `>` in frontmatter values | CRITICAL |
| Y9 | Valid YAML | Frontmatter parses without errors | CRITICAL |
| Y10 | No forbidden name prefix | Name doesn't start with `claude` or `anthropic` | CRITICAL |

### 4. Syntax Checks — Markdown Body

| # | Check | Pass Criteria | Severity |
|---|-------|---------------|----------|
| M1 | Has heading | At least one `#` heading | WARNING |
| M2 | Workflow Routing | `## Workflow Routing` section with table (if workflows exist) | WARNING |
| M3 | Examples section | `## Examples` section with at least 1 example | WARNING |
| M4 | Progressive disclosure | SKILL.md body under ~500 lines or ~5,000 words | WARNING |

### 5. Security Checks

| # | Check | Pass Criteria | Severity |
|---|-------|---------------|----------|
| X1 | No prompt injection | No "ignore previous instructions" or similar patterns | CRITICAL |
| X2 | No credential literals | No API keys, passwords, tokens in plain text | CRITICAL |
| X3 | Script safety | Scripts in `scripts/` don't perform unauthorized file/network ops | WARNING |
| X4 | No shell injection | No unescaped user input passed to shell commands | ERROR |

**Script architecture (manual / spot-check):** When the skill ships CLIs the agent runs, verify norms in [skill-scripts.md](skill-scripts.md) (`--help`, minimal deps, `scripts/lib/`).

### 6. Portability Checks

| # | Check | Pass Criteria | Severity |
|---|-------|---------------|----------|
| P1 | No platform-specific paths | No hardcoded absolute paths (use relative) | WARNING |
| P2 | Standard field names | Only standard + recognized extension fields in frontmatter | INFO |
| P3 | Extension field handling | Platform-specific fields (model, context, hooks) noted but not rejected | INFO |

### 7. MCP Integration Checks (if skill uses MCP)

| # | Check | Pass Criteria | Severity |
|---|-------|---------------|----------|
| I1 | MCP Dependencies section | `## MCP Dependencies` exists in SKILL.md | ERROR |
| I2 | Servers documented | MCP servers explicitly listed | ERROR |
| I3 | Tool mapping exists | Tools mapped to workflow steps | WARNING |
| I4 | Safety policy exists | `## Tool Safety Policy` section present | WARNING |
| I5 | MCP servers discoverable | Documented servers found via `list_mcp_resources` | WARNING |
| I6 | Tools exist in servers | Documented tools found in discovered servers | WARNING |

### 8. Generate Compliance Report

Produce a structured report:

```markdown
## Lint Report: {skill-name}

**Score: {score}/100**

### Summary
- Structural: {pass}/{total} checks passed
- Syntax: {pass}/{total} checks passed
- Security: {pass}/{total} checks passed
- Portability: {pass}/{total} checks passed
- MCP Integration: {pass}/{total} checks passed (if applicable)

### Issues Found

#### CRITICAL
- [Y3] `name` field is not kebab-case: "MySkill" → should be "my-skill"

#### ERROR
- [Y4] `name` doesn't match folder: name="my-skill", folder="MySkill"
- [S6] Referenced file missing: `references/workflow.md` not found

#### WARNING
- [S3] README.md found inside skill folder — remove it
- [M4] SKILL.md is 6,200 words — consider moving content to references/

#### INFO
- [P2] Non-standard field `model` in frontmatter (platform extension)

### Recommended Fixes
1. Rename folder from "MySkill" to "my-skill"
2. Update YAML `name:` from "MySkill" to "my-skill"
3. Delete README.md from skill folder
4. Move detailed sections to references/ to reduce SKILL.md size
```

## Scoring

| Severity | Point Deduction |
|----------|----------------|
| CRITICAL | -20 per issue |
| ERROR | -10 per issue |
| WARNING | -5 per issue |
| INFO | 0 (informational only) |

Starting score: 100. Minimum: 0.

**Compliance levels:**
- **90–100**: Fully compliant
- **70–89**: Minor issues, usable
- **50–69**: Needs attention
- **Below 50**: Significant issues, may not work correctly

## Output

Lint report with:
- Compliance score (0–100)
- Per-category pass/fail counts
- Specific issues with severity levels
- Actionable fix list with concrete instructions
- Recommendations for improvement
