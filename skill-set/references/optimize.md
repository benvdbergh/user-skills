# Optimize Workflow

Iteratively refine an existing skill based on user feedback, correction patterns, and triggering anomalies.

## When to Use

- User reports: "skill keeps triggering incorrectly", "skill doesn't trigger when it should"
- User feedback: "skill didn't do what I expected", "improve this skill"
- After observing repeated user corrections during skill-driven workflows
- Periodic skill quality improvement

## Overview

Skills are rarely perfect upon initial creation. This workflow implements a **Define → Create → Refine** loop to improve skill efficacy over time, driven by two primary signals:

1. **Correction Patterns** — Where users had to override skill behavior
2. **Triggering Anomalies** — Where skills under- or over-trigger

## Workflow Steps

### Phase 1: Gather Input

1. **Identify Target Skill**
   - Read the skill's `SKILL.md`
   - Understand current description, triggers, and instructions
   - Note the current version (from `metadata.version` if present)

2. **Collect Feedback Signals**
   Gather one or more of:
   - User-provided correction log or feedback description
   - Session history showing where corrections were needed
   - Reports of triggering issues (too often / not enough)
   - Specific error scenarios or edge cases

### Phase 2: Analyze Signals

3. **Signal 1 — Correction Patterns**

   Analyze instances where the user manually overrode or corrected a skill-driven task:

   | Pattern | Indicates | Action |
   |---------|-----------|--------|
   | User rephrases instructions | Ambiguous skill instructions | Clarify step wording |
   | User adds missing steps | Incomplete workflow | Add missing steps to workflow |
   | User changes output format | Wrong output expectations | Update output specification |
   | User corrects tool parameters | Incorrect MCP mapping | Fix tool parameter documentation |
   | User skips steps | Unnecessary steps | Remove or mark as optional |

   For each correction pattern:
   - Identify the **gap** between skill instructions and desired outcome
   - Propose a **specific change** to SKILL.md or workflow files
   - Document the **reasoning** for the change

4. **Signal 2 — Triggering Anomalies**

   **Overtriggering** (skill loads for irrelevant queries):
   - Identify which unrelated queries trigger the skill
   - Add **negative triggers** to the description field:
     ```yaml
     description: >-
       Advanced data analysis for CSV files. Use for statistical
       modeling, regression, clustering. Do NOT use for simple
       data exploration or basic file viewing.
     ```
   - Make the description more specific (narrow the scope)
   - Clarify scope boundaries

   **Undertriggering** (skill fails to load when appropriate):
   - Identify which relevant queries fail to trigger the skill
   - Expand the description with:
     - Additional technical keywords and synonyms
     - Paraphrased trigger phrases users actually say
     - Related file types or domain terms
   - Ensure the description covers the full range of intended use cases

### Phase 3: Apply Refinements

5. **Update SKILL.md**
   For each proposed change:
   - Apply the specific edit to SKILL.md
   - If the change affects `description`, ensure it remains under 1024 characters
   - If the change affects workflows, update the corresponding `references/` file
   - Bump the `metadata.version` (SemVer patch for fixes, minor for new behavior)

6. **Document Changes**
   Add a brief changelog comment or note describing what changed and why:
   ```markdown
   <!-- Optimization: v1.0.1
     - Added negative triggers to prevent overtriggering on general queries
     - Clarified step 3 to specify required parameters
     - Added error handling for missing API key scenario
   -->
   ```

### Phase 4: Validate

7. **Run Lint Workflow**
   - Invoke `references/lint.md` to validate the updated skill
   - Ensure all changes maintain structural compliance
   - Fix any new issues introduced by the changes

7b. **Refresh indexes (when applicable)**
   - If `description`, `name`, or skill folder membership changed under a managed `<skills-root>`, run `skill-set/scripts/update_skill_index.py` (optional `--with-relationship-map`).

8. **Recommend Testing**
   Suggest the user test with:
   - **Triggering tests**: 3–5 queries that SHOULD trigger, 3–5 that should NOT
   - **Functional tests**: Run through primary use cases
   - **Comparison**: Before vs. after optimization

## Common Optimization Patterns

### Pattern: Vague Description → Specific Triggers
```yaml
# Before
description: Helps with projects.

# After
description: >-
  Manages Linear project workflows including sprint planning,
  task creation, and status tracking. Use when user mentions
  "sprint", "Linear tasks", "project planning", or asks to
  "create tickets".
```

### Pattern: Missing Error Handling → Robust Instructions
```markdown
# Before
## Step 3: Create Project
Call MCP tool: `create_project`

# After
## Step 3: Create Project
Call MCP tool: `create_project`

If the call fails:
- **Connection refused**: Verify MCP server is running
- **Auth error (401/403)**: Check API key validity
- **Rate limited (429)**: Wait 30 seconds and retry
```

### Pattern: Overly Broad → Scoped with Negatives
```yaml
# Before
description: Processes documents for analysis.

# After
description: >-
  Processes PDF legal documents for contract review and clause
  extraction. Use for "review contract", "extract clauses",
  "legal analysis". Do NOT use for general document editing
  or non-legal PDFs.
```

### Pattern: Monolithic reference → topic-scoped files + SKILL hub

When one `references/*.md` file grows hard to maintain (multiple domains, duplicated examples):

1. Split into **one file per topic** (each with when-to-load, examples, frameworks table, no-gos, links).
2. Move **routing table**, **topic map**, and **agent execution steps** into **`SKILL.md`**; remove redundant `references/*-index.md` if it only mirrors the hub.
3. Add **Related** cross-links at the top of sibling topic files.
4. Run `update_skill_index.py` (`-R` if used) after changing `name`, `description`, or folder layout; bump `metadata.version`.

See `references/authoring-guide.md` — *Topic-scoped reference files (maintainability)*.

## Output

Updated skill with:
- Refined description field (improved trigger accuracy)
- Hardened instructions (based on correction patterns)
- Documented changes with reasoning
- Version bump in metadata
- Lint-validated structure
