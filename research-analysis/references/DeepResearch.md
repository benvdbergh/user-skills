# DeepResearch Workflow

Comprehensive deep research workflow following the Langfuse pattern for technical topics, frameworks, and ecosystems.

## When to Use

- User requests: "deep research", "comprehensive research", "analyze [topic]"
- Need comprehensive analysis of a technical topic
- Researching frameworks, tools, or ecosystems
- Preparing for specification or planning phase

## Workflow Steps

1. **Topic Lookup**
   - Check if topic exists in `~/Knowledge/Topics/{category}/`
   - If exists, return reference link
   - If not, proceed with research

2. **Research Planning**
   - Determine research scope
   - Identify research agents needed (technical-analyst, market-researcher)
   - Plan parallel research execution

3. **Parallel Research Execution**
   - Spawn technical-analyst agent for technical deep dive
   - Spawn market-researcher agent for market/competitive analysis
   - Coordinate parallel research execution

4. **Research Synthesis**
   - Collect findings from all research agents
   - Use ResearchSynthesizer to combine sources
   - Structure findings according to DeepResearchTemplate

5. **Research Validation**
   - Use ResearchValidator to check completeness
   - Ensure all template sections are filled
   - Validate research quality

6. **Topic Storage**
   - Store research in `~/Knowledge/Topics/{category}/{topic-name}.md`
   - Categorize appropriately (AI, PAI, Security, etc.)
   - Version control via VersionControl skill

7. **Research Handoff**
   - Format findings for Architect, UX Designer, and PM roles
   - Generate role-specific handoff sections
   - Prepare for specification generation

## CLI Usage

```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/ResearchOrchestrator.ts \
  --topic <topic-name> \
  --category <category> \
  --type deep
```

## Integration

- Uses Agents skill for parallel research execution
- Uses TopicManager for topic lookup and storage
- Uses ResearchSynthesizer for combining sources
- Uses ResearchValidator for quality checks
- Feeds into Specification skill (GenerateSpec, GeneratePRD)
- Informs ProjectPlanning workflow

## Output

Creates comprehensive research document:
- Executive Summary
- Core Functional Pillars
- Technical Architecture
- Competitive Landscape
- Implementation Examples
- Strategic Conclusion
- Role-Based Research Handoff

## Example

```
User: "Conduct deep research on Langfuse"
→ Topic lookup: ~/Knowledge/Topics/AI/Langfuse deep research.md
→ Topic doesn't exist
→ Spawns technical-analyst and market-researcher agents
→ Parallel research execution
→ Synthesis into DeepResearchTemplate structure
→ Stores in ~/Knowledge/Topics/AI/Langfuse deep research.md
→ Returns reference link for project use
```
