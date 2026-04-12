# skill-set — More Examples

Additional usage examples. The main SKILL.md keeps 4 representative examples; these cover optimize, canonicalize, and missing-MCP scenarios.

---

**Example: Optimize a skill from feedback**
```
User: "The git-workflow skill keeps triggering when I just ask about git status"
→ Invokes optimize workflow
→ Analyzes triggering anomaly (overtriggering)
→ Proposes adding negative triggers to description
→ Updates SKILL.md with refined description field
```

**Example: Migrate a PAI skill to standard format**
```
User: "Canonicalize the EnterpriseModeling skill"
→ Invokes canonicalize workflow
→ Renames directory: EnterpriseModeling → enterprise-modeling
→ Maps Tools/ → scripts/, Workflows/ → references/, Templates/ → assets/
→ Updates YAML frontmatter to kebab-case
→ Runs lint workflow after migration
```

**Example: Skill creation with missing MCP**
```
User: "Create a Spotify skill"
→ Invokes synthesize workflow
→ Phase 1: Runs list_mcp_resources → no Spotify MCP found
→ Gap Analysis: Required MCP not installed
→ Halts creation, informs user: "Spotify MCP not found. Install MCP first."
```

**Example: Full validate with effectiveness assessment**
```
User: "Deep review project-planning; I want a refactor advisory like we did last time"
→ Lint the skill first
→ validate.md (workflow) + effectiveness-assessment.md (synthesis template)
→ Report: dimension scores + Effectiveness assessment sections (domain quality bar, ecosystem table,
  goals→design, proposed SKILL.md/references/contracts/config, drop/demote/retain,
  success criteria, implementation order)
```

**Example: Add scripts to a skill (LLM vs automation split)**
```
User: "This skill will manage hundreds of YAML-frontmatter files — add tooling"
→ Read skill-scripts.md
→ Plan: scan/lint/list as scripts; lib/ for parse + paths; Bun or Python only
→ Each entrypoint: --help, --root/--config, markdown tables to stdout
→ SKILL.md: CLI summary table + when to run each script
```
