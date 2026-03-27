# TechnicalAnalysis Workflow

Technical ecosystem research workflow for frameworks, tools, architectures, and technical implementations.

## When to Use

- User requests: "technical research", "ecosystem analysis", "technical deep dive"
- Need technical insights for architecture decisions
- Analyzing technical ecosystems
- Preparing technical specifications

## Workflow Steps

1. **Topic Lookup**
   - Check if technical research topic exists
   - If exists, return reference link
   - If not, proceed with research

2. **Research Planning**
   - Determine technical research scope
   - Identify research agents needed (technical-analyst)
   - Plan research execution

3. **Research Execution**
   - Spawn technical-analyst agent for technical deep dive
   - Research technology stack, architecture, performance, integration
   - Collect technical findings

4. **Research Synthesis**
   - Structure findings according to TechnicalAnalysisTemplate
   - Organize by technical categories
   - Include implementation considerations

5. **Research Validation**
   - Use ResearchValidator to check completeness
   - Ensure all template sections are filled
   - Validate technical accuracy

6. **Topic Storage**
   - Store research in `~/Knowledge/Topics/{category}/{topic-name}.md`
   - Categorize appropriately
   - Version control via VersionControl skill

7. **Research Handoff**
   - Format findings for Architect, Developer, and DevOps roles
   - Generate role-specific handoff sections
   - Prepare for technical specification

## CLI Usage

```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/ResearchOrchestrator.ts \
  --topic <topic-name> \
  --category <category> \
  --type technical
```

## Integration

- Uses Agents skill for research execution
- Uses TopicManager for topic lookup and storage
- Uses ResearchSynthesizer for organizing findings
- Uses ResearchValidator for quality checks
- Feeds into Specification skill (GeneratePlan, GenerateSpec)
- Informs StateManagement with technical constraints

## Output

Creates technical analysis document:
- Executive Summary
- Technology Stack
- Architecture & Design
- Performance & Scalability
- Integration & Ecosystem
- Security & Compliance
- Implementation Considerations
- Role-Based Research Handoff

## Example

```
User: "Analyze the Bun runtime ecosystem"
→ Topic lookup: ~/Knowledge/Topics/DevOps/Bun runtime analysis.md
→ Topic doesn't exist
→ Spawns technical-analyst agent
→ Technical research execution
→ Synthesis into TechnicalAnalysisTemplate structure
→ Stores in ~/Knowledge/Topics/DevOps/Bun runtime analysis.md
→ Returns reference link for project use
```
