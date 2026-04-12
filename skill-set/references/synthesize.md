# Synthesize Workflow

Create a new skill with standard-compliant structure, MCP tool integration, and capability mapping.

## When to Use

- User requests: "create a new skill", "new skill", "add skill", "build skill"
- Need to create a new capability in the skill system
- Skill requires external actions (API, DB, Shell, MCP tools)

## Workflow Steps

### Phase 1: Planning & Discovery

1. **Read Authoritative Source**
   - Read `references/standard-reference.md` (in skill-set) for structure requirements
   - Understand kebab-case naming conventions
   - Review required directory structure (`scripts/`, `references/`, `assets/`)
   - For authoring best practices (description, patterns, anti-patterns), read `references/authoring-guide.md`

2. **Gather Requirements** (if not inferrable from context)
   Gather or infer: purpose and scope, target location (e.g. project vs user-level), trigger scenarios, key domain knowledge, output format preferences, and existing patterns to follow. Use AskQuestion when available; otherwise ask conversationally.

3. **Identify Use Cases (MANDATORY)**
   Before writing any code, identify **2–3 concrete use cases** the skill should enable.

   For each use case, define:
   - **Trigger**: What does the user say?
   - **Steps**: What multi-step workflow does this require?
   - **Tools**: Which tools are needed (built-in or MCP)?
   - **Result**: What does success look like?

   ```
   Use Case: [Title]
   Trigger: User says "[phrase]" or "[phrase]"
   Steps:
   1. [Step description]
   2. [Step description]
   Result: [Expected outcome]
   ```

4. **Prior Art Research**

   Before designing the skill, search for existing solutions and established patterns. This prevents reinventing workflows others have already refined through iteration.

   Conduct 2-3 targeted web searches using the WebSearch tool:
   - `"{skill domain} agent skill best practices"` — find similar skills and proven patterns
   - `"{skill domain} workflow automation patterns"` — find established domain conventions
   - `"Claude skill {domain}"` or `"MCP server {domain}"` — find Claude ecosystem examples

   For each relevant finding, capture:

   | Source | Pattern/Practice | Applicable? | Implication for This Skill |
   |--------|-----------------|-------------|---------------------------|
   | {URL or name} | {pattern description} | Yes/Partial/No | {what to adopt, adapt, or skip} |

   Use findings to:
   - Refine the use cases from step 2 (add missing scenarios others have solved)
   - Identify proven workflow sequences to adopt rather than invent
   - Spot common edge cases and error handling patterns
   - Discover naming conventions or structural patterns used in the community

   Summarize findings in a compact "Prior Art Summary" (max ~200 words) to reference during skill creation.

   If no relevant prior art exists, note "Novel domain — no established patterns found" and proceed with original design.

   > **Scope guard:** This is targeted discovery, not deep research. For comprehensive research, compose with the research-analysis skill.

5. **Select Skill Category**
   Classify the skill into one of three categories (from Anthropic's guide):

   | Category | Used For | Key Techniques |
   |----------|----------|----------------|
   | **Document & Asset Creation** | Creating consistent, high-quality output (docs, code, designs) | Embedded style guides, template structures, quality checklists |
   | **Workflow Automation** | Multi-step processes with consistent methodology | Step-by-step workflow, validation gates, iterative refinement |
   | **MCP Enhancement** | Workflow guidance to enhance MCP tool access | Multi-MCP coordination, domain expertise, error handling |

6. **Define Success Criteria**
   How will you know the skill is working? Define:

   Quantitative targets:
   - Skill triggers on ~90% of relevant queries
   - Completes workflow in N tool calls
   - 0 failed API calls per workflow (if MCP)

   Qualitative targets:
   - Users don't need to prompt about next steps
   - Workflows complete without user correction
   - Consistent results across sessions

7. **Extract Skill Requirements**
   - Determine skill name (must be **kebab-case**)
   - Extract skill purpose and capabilities
   - Determine if skill requires external actions

8. **MCP Capability Audit** (if external actions required)
   - **Discover**: Use `list_mcp_resources` tool to discover available MCP servers and tools
   - **Map Requirements**: Identify which MCP tools match the skill's required capabilities
   - **Gap Analysis**: If required MCP tools are missing, inform user and halt creation
   - **Document**: Record discovered MCP servers and tools for the new skill

### Phase 2: Skill Structure Creation

9. **Create Directory Structure**
   ```
   {skill-name}/
   ├── SKILL.md
   ├── scripts/          # Only if executable code needed
   ├── references/       # Only if detailed docs/workflows needed
   └── assets/           # Only if templates/static resources needed
   ```

   - Create skill directory with kebab-case name
   - Create subdirectories only as needed (not mandatory)
   - **Do NOT create README.md inside the skill folder**

10. **Generate SKILL.md**
   Use the template from `assets/skill-template.md` as a starting scaffold.

   - Write YAML frontmatter with:
     - `name:` in kebab-case (must match folder name)
     - `description:` with WHAT + WHEN pattern (include trigger phrases)
     - `license:` (optional, e.g., `MIT`)
     - `metadata:` with author and version (optional)
   - Add **MCP Dependencies** section if MCP tools are used
   - Add **Tool Integration Protocol** section if applicable
   - Add **Workflow Routing** table
   - Add **Examples** section with 2–3 usage patterns from the identified use cases

11. **Create Reference Files** (if needed)
   - For each workflow, create `references/{workflow-name}.md`
   - In each workflow, explicitly document MCP tool usage if applicable
   - Move detailed documentation out of SKILL.md into `references/`
   - Keep references one level deep: link from SKILL.md directly to reference files; avoid long reference chains so the agent does not do partial reads
   - **Topic-heavy skills:** If the domain splits into several maintainable areas (e.g. separate concerns with their own examples, framework tables, no-gos, and links), use **one reference file per topic** and keep **workflow routing + topic map + agent execution steps** in `SKILL.md` (do not add a separate `references/*-index.md` hub). Cross-link sibling references at the top of each file. See `references/authoring-guide.md` — *Topic-scoped reference files (maintainability)*.

### Phase 3: Tool Policy & Safety

12. **Define Tool Safety Policy** (if MCP tools used)
    For each MCP tool:
    - **Safe Operations**: When the tool can run automatically
    - **Requires Confirmation**: When user input is needed
    - **Never Allowed**: Operations that should be blocked

13. **Create Tool Mapping Documentation** (if MCP tools used)
    ```markdown
    ## Tool Usage Mapping
    | Workflow Step | MCP Tool | Purpose | Safety Level |
    |---------------|----------|---------|--------------|
    | Step 1 | `tool_name` | Create resource | Safe |
    | Step 2 | `tool_name` | Delete resource | Requires Confirmation |
    ```

### Phase 4: Validation

14. **Run Lint Workflow**
    - Invoke the `lint` workflow (see `references/lint.md`)
    - Ensure kebab-case naming throughout
    - Verify all required sections exist
    - Check MCP dependencies are documented
    - Fix any compliance issues

14b. **Refresh skill index (when applicable)**
    - If the new skill lives under a `<skills-root>` tree that publishes `skill-index.json`, run `skill-set/scripts/update_skill_index.py` from that environment (optional `-R` / `--with-relationship-map` to sync `skill-relationships.json` lists). See `SKILL.md` § Catalog and Maps.

15. **Authoring Verification** (see `references/authoring-guide.md`)
    - Description is third person and includes WHAT + WHEN and trigger terms
    - SKILL.md under ~500 lines or ~5,000 words; details in `references/`
    - File references from SKILL.md are one level deep (no deep reference chains)
    - Consistent terminology; no time-sensitive wording; no Windows-style paths
    - If scripts: documented, with clear run instructions and error handling

16. **Test MCP Integration** (if applicable)
    - Verify MCP tools are accessible
    - Confirm tool signatures match expected usage
    - Document any limitations or constraints

## MCP Integration Requirements

### Mandatory MCP Discovery

**If the skill involves ANY external side-effects, you MUST:**

1. Run `list_mcp_resources` to discover available MCP servers
2. For each server, identify relevant tools using tool documentation
3. Map skill capabilities to MCP tools
4. Document gaps if required tools are missing

### MCP Tool Mapping Template

When creating a skill that uses MCP tools, include this structure in SKILL.md:

```markdown
## MCP Dependencies

### Server: {server-name}
- **Tools Used**:
  - `tool_name`: Description of usage
  - `another_tool`: Description of usage

### Execution Logic
1. [Step description]
   - **Tool Call**: `tool_name` with parameters {param1, param2}
   - **Safety**: Safe / Requires Confirmation / Never Allowed
2. [Next step]
   - **Tool Call**: `another_tool` with parameters {param1}
```

## Output

Creates complete skill structure with:
- Prior art research summary informing the design
- SKILL.md with standard-compliant frontmatter (kebab-case, WHAT + WHEN description)
- `references/` directory with workflow files (if needed)
- `scripts/` directory with executable code (if needed)
- `assets/` directory with templates (if needed)
- Explicit MCP tool mapping and safety policies (if applicable)
- No README.md inside skill folder
- Compliance-validated via lint workflow
