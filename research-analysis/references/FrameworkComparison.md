# FrameworkComparison Workflow

Internal framework and tool comparison workflow for decision-making.

## When to Use

- User requests: "compare frameworks", "tool comparison", "framework analysis"
- Need to compare multiple options for decision-making
- Evaluating frameworks or tools for project
- Preparing comparison analysis

## Workflow Steps

1. **Topic Lookup**
   - Check if comparison topic exists
   - If exists, return reference link
   - If not, proceed with research

2. **Comparison Planning**
   - Identify frameworks/tools to compare
   - Determine comparison criteria
   - Plan parallel research execution

3. **Parallel Research Execution**
   - Spawn competitive-analyst agent for each option
   - Coordinate parallel research execution
   - Collect findings for each option

4. **Comparison Synthesis**
   - Use ResearchSynthesizer to combine findings
   - Structure comparison according to ComparisonTemplate
   - Create comparison matrix
   - Generate feature-by-feature analysis

5. **Decision Framework**
   - Create selection criteria
   - Apply weighting and scoring
   - Generate strategic recommendation

6. **Research Validation**
   - Use ResearchValidator to check completeness
   - Ensure all template sections are filled
   - Validate comparison quality

7. **Topic Storage**
   - Store comparison in `~/Knowledge/Topics/{category}/{topic-name}.md`
   - Categorize appropriately
   - Version control via VersionControl skill

8. **Research Handoff**
   - Format findings for Architect, PM, and Developer roles
   - Generate role-specific handoff sections
   - Prepare for decision-making

## CLI Usage

```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/ResearchOrchestrator.ts \
  --topic <comparison-topic> \
  --category <category> \
  --type comparison \
  --options <option1,option2,option3>
```

## Integration

- Uses Agents skill for parallel research execution
- Uses TopicManager for topic lookup and storage
- Uses ResearchSynthesizer for combining findings
- Uses ResearchValidator for quality checks
- Feeds into Specification skill (GenerateSpec, GeneratePlan)
- Informs StateManagement with comparison-derived constraints

## Output

Creates framework comparison document:
- Executive Summary
- Comparison Matrix
- Detailed Comparison
- Feature-by-Feature Analysis
- Use Case Mapping
- Decision Framework
- Strategic Recommendation
- Role-Based Research Handoff

## Example

```
User: "Compare Langfuse, Weights & Biases, and MLflow"
→ Topic lookup: ~/Knowledge/Topics/AI/Observability tools comparison.md
→ Topic doesn't exist
→ Spawns competitive-analyst agents for each tool
→ Parallel research execution
→ Synthesis into ComparisonTemplate structure
→ Creates comparison matrix and decision framework
→ Stores in ~/Knowledge/Topics/AI/Observability tools comparison.md
→ Returns reference link for project use
```
