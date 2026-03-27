# MarketResearch Workflow

Market and competitive analysis workflow for technical products, frameworks, and ecosystems.

## When to Use

- User requests: "market research", "competitive analysis", "market positioning"
- Need market insights for product decisions
- Analyzing competitive landscape
- Preparing go-to-market strategy

## Workflow Steps

1. **Topic Lookup**
   - Check if market research topic exists
   - If exists, return reference link
   - If not, proceed with research

2. **Research Planning**
   - Determine market research scope
   - Identify research agents needed (market-researcher, competitive-analyst)
   - Plan parallel research execution

3. **Parallel Research Execution**
   - Spawn market-researcher agent for market analysis
   - Spawn competitive-analyst agent for competitive landscape
   - Coordinate parallel research execution

4. **Research Synthesis**
   - Collect market findings from all research agents
   - Use ResearchSynthesizer to combine sources
   - Structure findings according to MarketResearchTemplate

5. **Research Validation**
   - Use ResearchValidator to check completeness
   - Ensure all template sections are filled
   - Validate research quality

6. **Topic Storage**
   - Store research in `~/Knowledge/Topics/{category}/{topic-name}.md`
   - Categorize appropriately
   - Version control via VersionControl skill

7. **Research Handoff**
   - Format findings for PM, Architect, and UX Designer roles
   - Generate role-specific handoff sections
   - Prepare for specification and planning

## CLI Usage

```bash
bun run $PAI_DIR/skills/ResearchAnalysis/Tools/ResearchOrchestrator.ts \
  --topic <topic-name> \
  --category <category> \
  --type market
```

## Integration

- Uses Agents skill for parallel research execution
- Uses TopicManager for topic lookup and storage
- Uses ResearchSynthesizer for combining sources
- Uses ResearchValidator for quality checks
- Feeds into Specification skill (GeneratePRD)
- Informs ProjectPlanning workflow

## Output

Creates market research document:
- Executive Summary
- Market Size & Growth
- Competitive Landscape
- Target Market Analysis
- Pricing & Business Models
- Market Opportunities
- Role-Based Research Handoff

## Example

```
User: "Research the observability market"
→ Topic lookup: ~/Knowledge/Topics/AI/Observability market research.md
→ Topic doesn't exist
→ Spawns market-researcher and competitive-analyst agents
→ Parallel research execution
→ Synthesis into MarketResearchTemplate structure
→ Stores in ~/Knowledge/Topics/AI/Observability market research.md
→ Returns reference link for project use
```
