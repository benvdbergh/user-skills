# DetectModelGaps Workflow

**Purpose:** Analyze the current enterprise model for structural gaps, missing connections, and incomplete information.

## When to Use

- Periodically after significant model updates
- When assessing model completeness
- When identifying areas needing attention
- When preparing for model review sessions

## Prerequisites

1. **Load the model from Neo4j**: Use MCP `read-cypher`:
   ```cypher
   MATCH (n) RETURN labels(n)[0] as label, n.id, n.title
   ```
   ```cypher
   MATCH (a)-[r]->(b) RETURN type(r) as rel_type, count(*) as cnt
   ```
2. The enterprise model is in Neo4j (no file-based model)

## The Workflow

### Step 1: Structural Analysis

Scan the model for entities missing required relationships and incomplete patterns.

### Step 2: Completeness Check

For each entity type, check required attributes, relationships, confidence, and maturity.

### Step 3: Coherence Analysis

Check for:
- Strategic alignment: StrategyObjectives -> CourseOfActions -> BusinessFunctions
- Organizational accountability: BusinessActors -> BusinessFunctions/Products
- Execution path: BusinessProcesses -> BusinessFunctions -> Products

### Step 4: Quality Assessment

Evaluate confidence_score distribution, assumption validation status, source completeness, maturity coverage.

## Gap Categories

### 1. Missing Owners
- BusinessFunctions without owning BusinessActor or BusinessRole
- Products without product management ownership
- **Impact**: Accountability gaps, unclear decision rights

### 2. Orphaned Capabilities
- BusinessFunctions with no relationships to processes, products, or objectives
- **Impact**: Capabilities exist in isolation, unclear value

### 3. Objectives Without Initiatives
- StrategyObjectives with no contributing CourseOfActions
- **Impact**: Strategy disconnected from execution

### 4. Products Without Capabilities
- Products with no enabling BusinessFunctions
- **Impact**: Products lack operational foundation

### 5. Missing Dependencies
- Entities that likely depend on others but relationships missing
- **Impact**: Incomplete dependency understanding

### 6. Low Confidence Entities
- Entities with `confidence_score < 0.5` not yet validated
- **Impact**: Model reliability issues

### 7. Missing Metrics
- Important entities without measurement (StrategyObjectives, BusinessFunctions, Products)
- **Impact**: No way to measure success

### 8. Unvalidated Assumptions
- Critical assumptions that haven't been checked
- **Impact**: Model built on unverified foundations

## Output Format

```json
{
  "gap_analysis": {
    "missing_owners": [...],
    "orphaned_capabilities": [...],
    "objectives_without_initiatives": [...],
    "products_without_capabilities": [...],
    "missing_dependencies": [...],
    "low_confidence_entities": [...],
    "missing_metrics": [...],
    "unvalidated_assumptions": [...]
  },
  "summary": {
    "total_gaps": 15,
    "high_severity": 5,
    "medium_severity": 7,
    "low_severity": 3
  },
  "prioritized_recommendations": [
    {
      "priority": 1,
      "action": "Assign owners to 3 capabilities",
      "impact": "high",
      "effort": "low"
    }
  ]
}
```

## Prioritization

Gaps should be prioritized by:
1. **Severity**: High, medium, low
2. **Impact**: How much does this gap affect model usefulness?
3. **Effort**: How easy is it to address?
4. **Dependencies**: Does fixing this enable other improvements?

## Guidelines

1. Be specific: Identify exact entities and relationships
2. Prioritize high-impact, high-severity gaps first
3. Provide clear recommended actions
4. Consider organizational context
5. Avoid false positives: Only flag real gaps, not intentional design choices
