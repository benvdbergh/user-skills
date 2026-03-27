# Canonicalize Workflow

Migrate an existing skill from PAI TitleCase conventions (or any non-standard format) to the Agent Skills standard with kebab-case naming and standard directory layout.

## When to Use

- User requests: "canonicalize skill", "migrate skill", "fix skill", "standardize skill"
- Skill uses TitleCase directory names (e.g., `EnterpriseModeling`)
- Skill uses old PAI directory structure (`Tools/`, `Workflows/`, `Data/`, `Templates/`)
- Skill YAML `name` is not kebab-case
- Skill needs structural cleanup to match the Agent Skills standard

## Workflow Steps

### Phase 1: Analyze Current Skill

1. **Read Existing Skill**
   - Read current `SKILL.md`
   - List all files and directories in the skill folder
   - Parse YAML frontmatter
   - Identify all internal references (file paths in markdown links, workflow routing table, etc.)

2. **Identify Migration Tasks**
   Create a migration checklist:

   | Check | Current | Target | Action Needed |
   |-------|---------|--------|---------------|
   | Folder name | `{current}` | `{kebab-case}` | Rename |
   | YAML `name` | `{current}` | `{kebab-case}` | Update |
   | `Tools/` dir | exists? | `scripts/` | Rename |
   | `Workflows/` dir | exists? | `references/` | Rename/merge |
   | `Data/` dir | exists? | `references/` | Merge into references/ |
   | `Templates/` dir | exists? | `assets/` | Rename |
   | README.md | exists? | remove | Delete |
   | Description | has USE WHEN? | WHAT + WHEN | Update if needed |

### Phase 2: Rename Directories

3. **Rename Skill Folder** (if not kebab-case)
   - Convert folder name: `EnterpriseModeling` → `enterprise-modeling`
   - Conversion rule: Insert `-` before each uppercase letter, then lowercase all
   - Verify no naming collision with existing folders

4. **Rename Internal Directories**

   | Old Directory | New Directory | Notes |
   |---------------|---------------|-------|
   | `Tools/` | `scripts/` | Direct rename |
   | `Workflows/` | `references/` | Direct rename |
   | `Data/` | `references/` | Merge into references/ (if Workflows/ also exists, merge both) |
   | `Templates/` | `assets/` | Direct rename |

   If both `Workflows/` and `Data/` exist:
   - Create `references/` directory
   - Move all files from `Workflows/` into `references/`
   - Move all files from `Data/` into `references/`
   - Remove empty `Workflows/` and `Data/` directories

5. **Remove README.md** (if present inside skill folder)
   - Delete `README.md` from skill root
   - If README.md contained useful content, migrate it into SKILL.md or `references/`

### Phase 3: Update YAML Frontmatter

6. **Update `name` Field**
   - Convert from TitleCase to kebab-case: `EnterpriseModeling` → `enterprise-modeling`
   - Ensure name matches the (now renamed) folder

7. **Update `description` Field**
   - Ensure it contains both WHAT and WHEN (trigger phrases)
   - If only `USE WHEN` exists, add the WHAT prefix
   - Ensure under 1024 characters
   - No XML tags

8. **Add Standard Optional Fields** (if missing)
   - `license:` — suggest `MIT` if open source
   - `metadata:` — add `author`, `version` if not present

### Phase 4: Update Internal References

9. **Update File References**
   For every file in the skill, search and replace:
   - `Tools/` → `scripts/`
   - `Workflows/` → `references/`
   - `Data/` → `references/`
   - `Templates/` → `assets/`
   - Old skill name → new kebab-case name (in heading, references, etc.)

10. **Update Workflow Routing Table**
    Update all file paths in the routing table:
    ```markdown
    ## Workflow Routing
    | Workflow | Trigger | File |
    |----------|---------|------|
    | **extract-entities** | "extract entities" | `references/ExtractEntities.md` |
    ```
    > Note: Internal file names within references/ do NOT need to be renamed to kebab-case (optional, but preserve functionality first).

### Phase 5: Update External References

11. **Update Skill Index** (if applicable)
    - Update `skill-index.json` with new kebab-case name and path
    - Preserve triggers and workflows list

12. **Update Cursor Rules** (if applicable)
    - Search workspace `.cursor/rules/` for references to the old skill name
    - Update paths and names as needed

13. **Update CLAUDE.md** (if applicable)
    - Search `.claude/CLAUDE.md` for references to the old skill name
    - Update as needed

### Phase 6: Validate

14. **Run Lint Workflow**
    - Invoke `references/lint.md` on the migrated skill
    - Ensure compliance score is ≥ 70
    - Fix any critical or error-level issues

15. **Verify Functionality**
    - Confirm all referenced files exist at new paths
    - Confirm workflow routing table paths are correct
    - Confirm MCP integration still works (if applicable)

## Migration Guide: Common PAI Skills

### Example: EnterpriseModeling

```
Before:
  EnterpriseModeling/
  ├── SKILL.md          (name: EnterpriseModeling)
  ├── Tools/
  │   ├── CreateObsidianNotes.ts
  │   └── ResolveObsidianPath.ts
  ├── Workflows/
  │   ├── ClassifyText.md
  │   ├── ExtractEntities.md
  │   └── ProposeRelationships.md
  ├── Data/
  │   ├── ontology-v1.json
  │   └── ReferenceResolutionGuide.md
  └── Templates/
      └── ObsidianEntityTemplate.md

After:
  enterprise-modeling/
  ├── SKILL.md          (name: enterprise-modeling)
  ├── scripts/
  │   ├── CreateObsidianNotes.ts
  │   └── ResolveObsidianPath.ts
  ├── references/
  │   ├── ClassifyText.md
  │   ├── ExtractEntities.md
  │   ├── ProposeRelationships.md
  │   ├── ontology-v1.json
  │   └── ReferenceResolutionGuide.md
  └── assets/
      └── ObsidianEntityTemplate.md
```

### Conversion Rules Summary

| Component | Rule | Example |
|-----------|------|---------|
| Folder name | TitleCase → kebab-case | `MySkill` → `my-skill` |
| YAML name | TitleCase → kebab-case | `name: MySkill` → `name: my-skill` |
| `Tools/` | Rename to `scripts/` | `Tools/Run.ts` → `scripts/Run.ts` |
| `Workflows/` | Rename to `references/` | `Workflows/Create.md` → `references/Create.md` |
| `Data/` | Merge into `references/` | `Data/schema.json` → `references/schema.json` |
| `Templates/` | Rename to `assets/` | `Templates/note.md` → `assets/note.md` |
| Internal files | Keep existing names (renaming optional) | `CreateObsidianNotes.ts` stays as-is |

## Output

Canonicalized skill with:
- Kebab-case folder name and YAML `name`
- Standard directory structure (`scripts/`, `references/`, `assets/`)
- Updated internal references
- No README.md in skill folder
- Updated skill-index.json (if applicable)
- Lint-validated structure with compliance score
