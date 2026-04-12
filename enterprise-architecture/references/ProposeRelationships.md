# ProposeRelationships Workflow

**Purpose:** Propose relationships between extracted entities using only allowed ArchiMate relationship types from the Enterprise Ontology v1.

## When to Use

- After extracting entities (via `references/ExtractEntities.md`)
- When connecting new entities to existing model entities
- When analyzing how entities relate to each other

## Prerequisites

1. **Resolve ontology and project files**: Read `references/CrossSkillAndOntologySources.md` — load `ontology-v1.json` from **`enterprise-model-store`** when present.
2. **Load existing model from Neo4j**: Use MCP `read-cypher`:
   ```cypher
   MATCH (n) RETURN n.id, n.title, n.archimate_type
   ```
   ```cypher
   MATCH (a)-[r]->(b) RETURN a.id, type(r), b.id
   ```
3. For reference resolution: Use `ReferenceResolutionGuide.md` from **`enterprise-model-store`** when available.

## The Workflow

### Step 1: Identify Relationship Candidates

Look for:
- Ownership and accountability statements
- Dependencies and prerequisites
- Enabling and supporting connections
- Hierarchical structures (reports_to, belongs_to)
- Contribution and realization patterns

### Step 2: Select Relationship Type

Use only ArchiMate relationship types:

**Structural:**
- `composes` (BusinessProcess -> BusinessProcess, Product -> ProductLine)
- `aggregates` (Product -> ProductLine)
- `assigned_to` (BusinessRole -> BusinessActor)
- `realizes` (BusinessProcess -> BusinessFunction, CourseOfAction -> StrategyObjective)

**Dependency:**
- `serves` (BusinessService -> BusinessProcess)
- `influences` (Driver -> StrategyObjective, CourseOfAction -> StrategyObjective)
- `depends_on` (any -> any, general dependency)
- `triggers` (Event -> BusinessProcess)

**Dynamic:**
- `performs` (BusinessActor -> BusinessProcess)
- `uses` (BusinessProcess -> ApplicationComponent)
- `flows_to` (BusinessProcess -> BusinessProcess)
- `produces` (BusinessProcess -> DataObject)
- `consumes` (BusinessProcess -> DataObject)
- `accesses` (ApplicationComponent -> DataObject)

**Other:**
- `owned_by` (BusinessFunction -> BusinessActor)
- `managed_by` (governance relationship)

**Organizational:**
- `reports_to` (BusinessActor -> BusinessActor)
- `collaborates_with` (BusinessActor -> BusinessActor)

### Step 3: Verify Relationship Rules

Check that:
- Source entity type is allowed for the relationship type
- Target entity type is allowed for the relationship type
- Relationship direction makes semantic sense
- Follows ArchiMate relationship constraints

### Step 4: Include Target ID

For each relationship, include **target_id** (the entity's `id` in Neo4j). Resolve targets via:
```cypher
MATCH (n {id: $target_id}) RETURN n
```

### Step 5: Document Reasoning

For each relationship, explain:
- Why this relationship exists
- Evidence from the source text
- Confidence in the relationship

### Step 6: Flag Missing Entities

If a relationship requires an entity that doesn't exist, identify the missing entity, suggest its type, and explain why it's needed.

## Output Format

```json
{
  "relationships": [
    {
      "source_id": "entity_uuid",
      "target_id": "ACT-target_uuid",
      "type": "owned_by",
      "reasoning": "The Customer Onboarding BusinessFunction is owned by the Sales BusinessActor",
      "confidence": "high",
      "evidence": "Direct quote from source text"
    }
  ],
  "missing_entities": [
    {
      "suggested_name": "Customer Success Team",
      "suggested_type": "BusinessActor",
      "reason": "Relationship requires a BusinessActor that doesn't exist yet"
    }
  ],
  "relationship_metadata": {
    "total_relationships": 1,
    "confidence_distribution": { "high": 1, "medium": 0, "low": 0 },
    "open_questions": ["Is Customer Onboarding also owned by Product?"]
  }
}
```

## Common Relationship Patterns

| Pattern | Relationship | Direction |
|---------|-------------|-----------|
| Organizational ownership | `owned_by` | BusinessFunction -> BusinessActor |
| Strategic alignment | `influences` | CourseOfAction -> StrategyObjective |
| Execution | `realizes` | BusinessProcess -> BusinessFunction |
| Process ownership | `performs` | BusinessActor -> BusinessProcess |
| Service delivery | `serves` | BusinessService -> BusinessProcess |
| Org hierarchy | `reports_to` | BusinessActor -> BusinessActor |
| Role assignment | `assigned_to` | BusinessRole -> BusinessActor |

## Guidelines

1. Use only ArchiMate relationship types from the ontology
2. Be explicit: Every relationship needs clear reasoning
3. Use correct direction per ArchiMate conventions
4. Document evidence from source material
5. Flag ambiguities with uncertainty
6. Consider bidirectional dependencies where appropriate

## Next Step

After proposing relationships, compile an update package using **`enterprise-model-store`** → `references/ProposeModelUpdate.md` when that project skill exists. If it does not, output a structured proposal (entities, relationships, confidence, assumptions) for human review without claiming graph application.
