# ExtractEntities Workflow

**Purpose:** Extract candidate entities from unstructured text using the Enterprise Ontology v1 schema.

## When to Use

- After classifying text (via `references/ClassifyText.md`)
- When processing notes, interviews, or documents into structured entities
- When identifying named concepts that should be in the enterprise model

## Prerequisites

1. **Load ontology**: Read `references/ontology-v1.json` for entity types and schema
2. **Load ID format**: Read `references/IdentifierBestPractices.md` for ID prefix mapping
3. **Load current model from Neo4j** (when applicable): Use MCP `read-cypher` to list existing entities and avoid duplicates:
   ```cypher
   MATCH (n) RETURN n.id, n.title, n.archimate_type
   ```
4. For reference resolution: Read `references/ReferenceResolutionGuide.md`

## The Workflow

### Step 1: Identify Entity Candidates

Scan the text for:
- Named concepts (capabilities, objectives, products, etc.)
- Organizational units and roles
- Processes and activities
- Strategic goals and initiatives
- Decisions and responsibilities

### Step 2: Choose ArchiMate Entity Type

For each candidate, select the most appropriate type:

| Text Pattern | ArchiMate Type |
|-------------|----------------|
| "We aim to...", "Our goal is..." | StrategyObjective |
| "We need the ability to...", "Our capability to..." | BusinessFunction / BusinessCapability |
| "The process of...", "Steps include..." | BusinessProcess |
| "Our product...", "We offer..." | Product |
| "The [Department/Team]...", "Sales owns..." | BusinessActor |
| "The [Role/Position]...", "Product Managers..." | BusinessRole |
| "We're launching...", "Project X will..." | CourseOfAction |
| "Market pressure...", "Customer demand..." | Driver |
| "We provide [service] to..." | BusinessService |

### Step 3: Extract Attributes

For each entity, provide:

- **id**: 3-letter semantic prefix + short UUID (e.g., `ACT-a1b2c3d4-e5f6`)
- **archimate_type**: ArchiMate entity type (required)
- **type**: Entity type (should match archimate_type)
- **title**: Clear, concise business name
- **description**: Rich description capturing context and nuance
- **confidence_score**: Number 0-1 (0.9=high, 0.6=medium, 0.3=low)
- **maturity**: `unknown`, `ad-hoc`, `defined`, `managed`, or `optimized`
- **assumptions**: List of assumptions made in extraction
- **source**: Array of source identifiers
- **provenance**: Object with `extracted_by`, `extracted_at`, optionally `validated_by`, `validated_at`
- **obsidian_note_id**: Optional Obsidian note link
- **last_updated**: ISO-8601 timestamp

### Step 4: Note Potential Relationships

Note potential relationships but focus on entities first. Relationships will be extracted separately in `references/ProposeRelationships.md`.

## Output Format

Return **ONLY valid JSON**:

```json
{
  "entities": [
    {
      "id": "BFN-a1b2c3d4-e5f6",
      "archimate_type": "BusinessFunction",
      "type": "BusinessFunction",
      "title": "Customer Onboarding",
      "description": "The ability to efficiently onboard new customers...",
      "confidence_score": 0.9,
      "maturity": "ad-hoc",
      "assumptions": ["Customer onboarding is a distinct capability"],
      "source": ["note_2024_01_15"],
      "provenance": {
        "extracted_by": "ai-extractor-v1",
        "extracted_at": "2024-01-15T10:30:00Z"
      },
      "obsidian_note_id": null,
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ],
  "extraction_metadata": {
    "source_text_preview": "First 200 characters...",
    "total_entities_extracted": 1,
    "confidence_distribution": { "high": 1, "medium": 0, "low": 0 },
    "open_questions": ["Questions that need clarification"]
  }
}
```

## Storage and Application

- The enterprise model lives in **Neo4j** (single source of truth)
- Output JSON entity payloads for human review
- After human validation, create nodes via MCP `write-cypher` (CREATE/MERGE nodes, SET properties)
- Do not write JSON files to a file-based model

## Guidelines

1. Be conservative: Only extract entities with reasonable confidence
2. Use ArchiMate terminology for entity types
3. Use business terminology for titles
4. Always include `archimate_type` and `provenance`
5. Use `confidence_score` (0-1), not the old confidence enum
6. Document assumptions for every extraction
7. Check for existing duplicates before creating new entities

## Next Step

After extraction, proceed to `references/ProposeRelationships.md` to connect entities.
