# Enterprise Ontology v1 - ArchiMate-First

## Overview

This ontology defines the canonical entity types and relationships for the Corporate AI Infrastructure (CAI) framework. It serves as:

- A **thinking scaffold for AI agents**
- A **shared vocabulary for humans**
- An **ArchiMate-aligned** enterprise modeling foundation

The ontology is **AI-native** and **ArchiMate-first**, designed to capture enterprise knowledge using ArchiMate 3.1 specification terminology from the start, ensuring consistency with industry standards and enabling future integration with enterprise architecture tools.

## Design Principles

1. **ArchiMate-first terminology**: Uses ArchiMate 3.1 entity and relationship types as the foundation
2. **Comprehensive coverage**: Supports Strategy, Business, Application, Technology, and Motivation layers
3. **Explicit uncertainty**: Every entity includes confidence_score (0-1) and maturity metadata
4. **Stable anchors**: BusinessActors, Products, and BusinessFunctions serve as stable reference points
5. **Industry standard alignment**: Direct mapping to ArchiMate specification for tool integration

## Entity Groups (ArchiMate Layers)

### Strategy Layer

- **StrategyObjective**: High-level strategic goal or outcome (ArchiMate Strategy Layer)
- **CourseOfAction**: Program or project driving change (ArchiMate Strategy Layer)
- **Resource**: Asset owned or controlled by an organization (ArchiMate Strategy Layer)

### Business Layer

- **BusinessActor**: Organizational unit or person with accountability (ArchiMate Business Layer)
- **BusinessRole**: Organizational role with specific responsibilities (ArchiMate Business Layer)
- **BusinessProcess**: Sequence of activities transforming inputs to outputs (ArchiMate Business Layer)
- **BusinessService**: Externally visible behavior exposed to environment (ArchiMate Business Layer)
- **BusinessFunction**: Stable organizational ability to perform a function (ArchiMate Business Layer)
- **BusinessCapability**: Alternative to BusinessFunction (Supporting concept, maps to BusinessFunction)
- **ValueStream**: Sequence of value-adding activities (ArchiMate Business Layer)
- **Product**: Product or service delivering value (ArchiMate Business Layer)
- **BusinessCase**: Justification for investment or change (ArchiMate Business Layer)

### Application Layer

- **ApplicationComponent**: Application software component (ArchiMate Application Layer)
- **ApplicationService**: Externally visible unit of functionality (ArchiMate Application Layer)
- **DataObject**: Data structure for information exchange (ArchiMate Application Layer)

### Technology Layer

- **TechnologyComponent**: Hardware or software component (ArchiMate Technology Layer)
- **TechnologyService**: Externally visible unit of functionality (ArchiMate Technology Layer)

### Motivation Layer

- **Stakeholder**: Role representing interests in architecture outcome (ArchiMate Motivation Layer)
- **Driver**: Factor that creates or destroys value (ArchiMate Motivation Layer)
- **Assessment**: Outcome of analysis of a driver (ArchiMate Motivation Layer)
- **Goal**: End state that a stakeholder wants to achieve (ArchiMate Motivation Layer)
- **Requirement**: Statement of need that must be realized (ArchiMate Motivation Layer)

### Supporting Concepts

- **Decision**: Key decision point requiring organizational choice
- **Responsibility**: Accountability or ownership assignment
- **ProcessStep**: Individual activity within a process
- **ProductLine**: Grouping of related products
- **Portfolio**: Collection of products/initiatives managed together
- **Metric**: Measurable indicator of performance
- **Assumption**: Belief underlying a decision or model
- **Risk**: Potential event impacting objectives

## Canonical Entity Schema

Every entity follows this base structure (ArchiMate-first):

```json
{
  "id": "uuid",
  "archimate_type": "BusinessActor",
  "type": "BusinessActor",
  "title": "string",
  "description": "string",
  "relationships": [
    {
      "type": "relationship_type",
      "target": "entity_id",
      "target_file": "EntityType/prefix-uuid.json"
    }
  ],
  "confidence_score": 0.85,
  "maturity": "unknown | ad-hoc | defined | managed | optimized",
  "assumptions": ["string"],
  "source": ["note_id", "interview", "workshop"],
  "provenance": {
    "extracted_by": "ai-extractor-v1",
    "extracted_at": "2026-01-12T09:00:00Z",
    "validated_by": "human-validator",
    "validated_at": "2026-01-12T10:00:00Z"
  },
  "obsidian_note_id": "note-abc-123",
  "last_updated": "ISO-8601"
}
```

**Key Changes from v0.9:**
- `name` → `title` (ArchiMate alignment)
- `confidence` enum → `confidence_score` (0-1 number)
- Added `archimate_type` field (required)
- Added `provenance` object (required)
- Added `obsidian_note_id` field (optional)

## Relationship Types (ArchiMate)

### Structural Relationships

- **composes**: BusinessProcess → BusinessProcess, ApplicationComponent → ApplicationComponent
- **aggregates**: Product → Product, ProductLine → Product
- **assigned_to**: BusinessRole → BusinessActor
- **realizes**: BusinessProcess → BusinessFunction, CourseOfAction → StrategyObjective

### Dependency Relationships

- **serves**: BusinessService → BusinessProcess, ApplicationService → ApplicationComponent
- **influences**: Driver → StrategyObjective, Assessment → Goal
- **depends_on**: Any → Any (bidirectional dependency)
- **triggers**: Driver → BusinessProcess, Assessment → CourseOfAction

### Dynamic Relationships

- **performs**: BusinessActor → BusinessProcess
- **uses**: BusinessProcess → ApplicationComponent, BusinessFunction → TechnologyComponent
- **flows_to**: BusinessProcess → BusinessProcess, ValueStream → ValueStream
- **produces**: BusinessProcess → DataObject
- **consumes**: BusinessProcess → DataObject
- **accesses**: ApplicationComponent → DataObject

### Other Relationships

- **owned_by**: BusinessFunction/Product/BusinessProcess → BusinessActor/BusinessRole
- **managed_by**: BusinessProcess/Product/CourseOfAction → BusinessActor/BusinessRole

### Organizational Relationships (Non-ArchiMate, but useful)

- **reports_to**: BusinessActor → BusinessActor (organizational hierarchy)
- **collaborates_with**: BusinessActor → BusinessActor (organizational collaboration)

**Note**: All relationship types follow ArchiMate 3.1 specification constraints. See `ontology-v1.json` for complete allowed source/target combinations.

## Confidence Scores

Confidence is expressed as a number between 0 and 1:

- **0.0-0.3**: Low confidence - Uncertain or inferred from limited evidence
- **0.4-0.6**: Medium confidence - Reasonable inference from available information
- **0.7-1.0**: High confidence - Explicitly stated or well-documented

## Maturity Levels

- **unknown**: Maturity not assessed
- **ad-hoc**: Informal, inconsistent execution
- **defined**: Documented and standardized
- **managed**: Measured and monitored
- **optimized**: Continuously improved

## Rationale Mapping

| Concept | Why it exists |
|---------|---------------|
| Capability | Stable anchor across strategy & execution |
| Objective | Strategy articulation |
| Initiative | Change vehicle |
| OrgUnit | Accountability |
| Role | Decision clarity |
| Process | Execution detail |
| Product | Value delivery unit |

## Usage in AI Prompts

This ontology schema must be **embedded verbatim** in agent prompts for text-to-model extraction. The JSON Schema provides the structure that AI agents use to generate valid entity and relationship proposals.

## Migration from v0.9 (Consulting Terminology)

**Phase 1.1 Migration (Completed):**
- ✅ Entity types migrated to ArchiMate terminology
  - `StrategicObjective` → `StrategyObjective`
  - `ValueDriver` → `Driver`
  - `Initiative` → `CourseOfAction`
  - `OrgUnit` → `BusinessActor` or `BusinessRole`
  - `Role` → `BusinessRole`
- ✅ Relationship types migrated to ArchiMate
  - `owns` → `owned_by` (reverse direction)
  - `enables` → `serves` or `influences`
  - `contributes_to` → `influences`
- ✅ Schema fields updated
  - `name` → `title`
  - `confidence` enum → `confidence_score` (0-1)
  - Added `archimate_type` field
  - Added `provenance` object
  - Added `obsidian_note_id` field

## Version History

- **v1.1.0**: ArchiMate-first migration (Phase 1.1) - All entity and relationship types aligned with ArchiMate 3.1
- **v1.0.0**: Initial ontology definition for Phase 1

## ArchiMate Specification References

- ArchiMate 3.1 Specification: https://pubs.opengroup.org/architecture/archimate3-doc/
- ArchiMate Entity Types: https://pubs.opengroup.org/architecture/archimate3-doc/chap03.html
- ArchiMate Relationship Types: https://pubs.opengroup.org/architecture/archimate3-doc/chap04.html
