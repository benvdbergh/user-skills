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
