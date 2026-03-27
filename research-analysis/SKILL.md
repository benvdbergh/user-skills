---
name: research-analysis
description: >-
  Comprehensive research and analysis system for technical topics, frameworks,
  and ecosystems. USE WHEN user requests research, analysis, topic lookup,
  framework comparison, market research, technical analysis, OR needs to check
  for existing research topics before conducting new research.
---

# research-analysis

Research & Analysis System providing structured research capabilities for technical topics, frameworks, tools, and ecosystems. By default, research is stored as reusable topics in a **user-level knowledge base** (e.g. `$HOME/Knowledge/Topics/`) and can be referenced across multiple projects, but storage layout is **configurable and may be delegated to vault-local integration skills**.

## Key Features

- **Topic-Based Storage**: Research stored in a configurable topic store (default: `$HOME/Knowledge/Topics/{category}/{topic-name}.md`).
- **Project Research Summaries**: Project-specific research saved to a project research area (default: `$HOME/Knowledge/Projects/{project-name}/Research/`).
- **Topic Lookup**: Checks for existing topics before creating new research
- **Parallel Research**: Coordinates multiple research agents for comprehensive analysis
- **Role-Based Handoff**: Research findings formatted for Architect, UX Designer, and PM roles
- **Reusable Knowledge**: Topics can be referenced by multiple projects
- **Structured Templates**: Consistent research output format (Langfuse pattern)

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **deep-research** | "deep research", "comprehensive research", "analyze [topic]" | `references/DeepResearch.md` |
| **market-research** | "market research", "competitive analysis", "market positioning" | `references/MarketResearch.md` |
| **technical-analysis** | "technical research", "ecosystem analysis", "technical deep dive" | `references/TechnicalAnalysis.md` |
| **framework-comparison** | "compare frameworks", "tool comparison", "framework analysis" | `references/FrameworkComparison.md` |
| **project-research** | "research for [project]", "project research", "research summary for [project]" | `references/ProjectResearch.md` |
| **research-to-spec** | "research to spec", "handoff research", "research findings" | `references/ResearchToSpec.md` |
| **topic-lookup** | "check topic", "topic exists", "find research" | `references/TopicLookup.md` |
| **topic-reference** | "generate reference", "topic link", "reference topic" | `references/TopicReference.md` |
| **cleanup-prompts** | "cleanup prompts", "remove prompt files" | `references/CleanupPrompts.md` |

## Storage & Layout (Configurable)

research-analysis is responsible for **topic and project-level knowledge management**, but it does **not require any specific vault**. Instead, it works against an abstract storage model that can be implemented in multiple ways.

### Default User-Level Layout

When no vault-local integration is present, a simple filesystem layout is used by default:

**General Research Topics** (reusable across projects):
```
$HOME/Knowledge/Topics/
├── AI/
│   ├── Langfuse deep research.md
│   ├── Agent OS research.md
│   └── ...
├── PAI/
│   ├── PAI Deepdive.md
│   └── ...
└── [other categories]/
```

**Project-Specific Research** (project context):
```
$HOME/Knowledge/Projects/{project-name}/
├── Research/
│   ├── Research-Summary.md
│   ├── Competitive-Analysis.md
│   └── ...
└── brief.md
```

**Topic Categories:**
- Initially focused on technical categories (AI, PAI, Security, DevOps, etc.)
- Architecture supports future expansion to other domains

**Default Storage Strategy:**
- **General topics** → `Topics/{category}/` (reusable knowledge).
- **Project summaries** → `Projects/{project-name}/Research/` (project context).
- Project summaries link to general topics for detailed research.

### Vault-Local Layouts (e.g. Ai-Vault)

In environments with a **vault-local research integration skill** (e.g. an Ai-Vault `vault-research-integration` skill), research-analysis SHOULD:

- Treat the default `$HOME/Knowledge/...` layout as **just one possible backend**.
- Delegate **path resolution, note placement, and vault-specific metadata** to the vault-local adapter.
- Use the same conceptual operations as deep-research’s KB abstraction:
  - `resolve_topic`
  - `find_seed_sources`
  - `expand_sources`
  - `fetch_document_content`
  - `store_research_result`

In Ai-Vault specifically, vault-local integration is responsible for mapping:

- Topics and categories to Ai-Vault intelligence folders and note types.
- Project research summaries to project-specific locations in the vault.
- Any cross-links between research topics and CAI artifacts (epics, specs, PRDs, etc.).

## Integration Points

- **deep-research (execution engine)**:
  - research-analysis may **invoke deep-research** to perform long-running, multi-hop research.
  - Consumes deep-research’s **stable report schema** (sections, claims, citations) and turns it into topics and project summaries.
  - Acts as the primary **topic/KB manager** on top of deep-research outputs.
- **Vault-local research integration skills** (e.g. Ai-Vault `vault-research-integration`):
  - Provide concrete mappings from topics/projects to vault structures.
  - Own vault-specific conventions (folder layout, naming, frontmatter, cross-links).
  - research-analysis cooperates with them via the KB integration abstraction and MUST NOT hard-code vault paths.
- **Agents Skill**: Uses parallel research agents (technical-analyst, market-researcher, competitive-analyst).
- **Specification Skill**: Research topics inform spec generation via references.
- **ProjectPlanning Skill**: Research phase added before WorkflowInit, checks for existing topics.
- **StateManagement Skill**: Research-derived constraints update state.
- **VersionControl Skill**: Topics are version controlled.

## Topic Reference Pattern

Projects reference topics using relative markdown links:
```markdown
## Research References
- [Langfuse Ecosystem Analysis](../../Topics/AI/Langfuse%20deep%20research.md)
- [Agent OS Framework](../../Topics/AI/Agent%20OS%20research.md)
```

## Examples

**Example 1: Topic Lookup**
```
User: "Research Langfuse for my observability project"
→ ResearchAnalysis skill checks $HOME/Knowledge/Topics/AI/Langfuse deep research.md
→ Topic exists! Returns reference link
→ Project can reference existing topic instead of creating duplicate
```

**Example 2: New Topic Creation**
```
User: "Research Pinecone for vector databases"
→ ResearchAnalysis skill checks $HOME/Knowledge/Topics/AI/Pinecone deep research.md
→ Topic doesn't exist
→ Spawns research agents (technical-analyst, market-researcher)
→ Creates $HOME/Knowledge/Topics/AI/Pinecone deep research.md
→ Topic becomes reusable knowledge asset
```

**Example 3: Research Handoff**
```
User: "Generate research handoff for Architect"
→ ResearchAnalysis skill formats research findings for Architect role
→ Includes: Technical architecture, stack recommendations, integration patterns
→ Ready for specification generation
```

## Contract with deep-research (Execution Engine)

When paired with deep-research:

- **Inputs from research-analysis to deep-research**
  - Normalized `research_request` (topic, category, constraints).
  - Optional prior topic/project context (existing notes, links).
  - Optional handles/pointers from a vault-local integration skill.
- **Outputs from deep-research to research-analysis**
  - `research_report` in the stable schema (sections, citations, confidence).
  - Optional `trace_metadata` and calls to KB abstraction hooks.

research-analysis is responsible for:

- Deciding whether to **reuse** existing topics or create new ones.
- **Persisting** deep-research outputs according to the active KB backend (default filesystem vs vault-local).
- Maintaining **cross-links** between topics, projects, and external artifacts.

## Contract with Vault-Local Integration Skills

Vault-local research skills (such as Ai-Vault `vault-research-integration`) SHOULD:

- Implement or wrap the KB abstraction operations for their vault:
  - Topic resolution, seed/expanded source discovery.
  - Document content fetch against vault-specific KBs.
  - Storage of research outputs in vault-native formats and locations.
- Define and document:
  - Vault-specific **folder and note conventions**.
  - How research topics relate to **projects, specs, epics, and intelligence views**.

research-analysis SHOULD:

- Call through the vault-local adapter whenever one is available.
- Avoid hard-coding vault paths (`Ai-Vault/…`, `2.Intelligence/…`) inside this SKILL; such details belong in the vault-local skill.
- Fall back to the default `$HOME/Knowledge/...` layout when no adapter is configured.

## CLI Tools

**ResearchOrchestrator.ts** - Coordinates parallel research agents
```bash
bun run $PAI_DIR/skills/research-analysis/scripts/ResearchOrchestrator.ts \
  --topic <topic-name> \
  --category <category> \
  --type <deep|market|technical|comparison>
```

**TopicManager.ts** - Manages topic lifecycle
```bash
bun run $PAI_DIR/skills/research-analysis/scripts/TopicManager.ts \
  --action <lookup|create|list|categorize> \
  --topic <topic-name> \
  --category <category>
```

**ResearchSynthesizer.ts** - Combines multiple research sources
```bash
bun run $PAI_DIR/skills/research-analysis/scripts/ResearchSynthesizer.ts \
  --sources <source1,source2,...> \
  --output <output-path>
```

**ResearchValidator.ts** - Validates research completeness
```bash
bun run $PAI_DIR/skills/research-analysis/scripts/ResearchValidator.ts \
  --topic <topic-path>
```

**TopicReference.ts** - Generates topic references against the active topic store (by default `$HOME/Knowledge`, but vault-local integrations MAY wrap or replace this behavior).
```bash
bun run $PAI_DIR/skills/research-analysis/scripts/TopicReference.ts \
  --topic <topic-path> \
  --project <project-path>
```

**ProjectResearchSummary.ts** - Saves project-specific research summaries
```bash
bun run $PAI_DIR/skills/research-analysis/scripts/ProjectResearchSummary.ts \
  --project <project-name> \
  --summary <summary-content> \
  --title <summary-title> \
  --topic-refs <topic1-path,topic2-path> \
  --research-type <type>
```

**CleanupPrompts.ts** - Removes `.prompt.md` files after research topics are populated
```bash
bun run $PAI_DIR/skills/research-analysis/scripts/CleanupPrompts.ts \
  --category <category>
```

## Frontmatter Strategy

Research documents follow the frontmatter strategy defined in `$PAI_DIR/skills/specification/references/frontmatter-strategy.md`. Research topics use the `research` type:

```yaml
---
title: Research Topic Title
type: research
category: AI
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: complete
research_type: deep|market|technical|comparison
version: 1.0.0
tags: [tag1, tag2]
---
```

## Best Practices

1. **Always Check First**: Use TopicLookup before conducting new research
2. **Categorize Properly**: Use appropriate technical categories (AI, PAI, Security, etc.)
3. **Complete Research**: Ensure all template sections are filled
4. **Role-Based Handoff**: Format findings for specific roles (Architect, UX, PM)
5. **Version Control**: All topics version controlled via VersionControl skill

## References

- `references/DeepResearch.md` - Comprehensive deep research workflow
- `references/MarketResearch.md` - Market research workflow
- `references/TechnicalAnalysis.md` - Technical analysis workflow
- `references/FrameworkComparison.md` - Framework comparison workflow
- `references/ProjectResearch.md` - Project-specific research summaries
- `references/ResearchToSpec.md` - Handoff research findings to specification
- `references/TopicLookup.md` - Check for existing topics before research
- `references/TopicReference.md` - Generate topic references for project documents
- `references/CleanupPrompts.md` - Remove prompt files after population
- `assets/DeepResearchTemplate.md` - Deep research structure
- `assets/MarketResearchTemplate.md` - Market research structure
- `assets/TechnicalAnalysisTemplate.md` - Technical research structure
- `assets/ComparisonTemplate.md` - Comparison structure
