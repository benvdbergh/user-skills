# ArchiMate Mapping Guide

## Purpose

This guide helps map consulting terminology and concepts to ArchiMate 3.1 entity types and relationships. Use this guide when extracting entities from unstructured text to ensure proper ArchiMate alignment.

## Entity Type Mapping

### Consulting Concept → ArchiMate Type

| Consulting Concept | ArchiMate Type | Notes |
|-------------------|----------------|-------|
| Organizational unit, Department, Team, Division | `BusinessActor` | For organizational units that perform work |
| Role, Position, Job title | `BusinessRole` | For roles/positions that can be assigned to actors |
| Strategic objective, Goal, Target | `StrategyObjective` | High-level strategic outcomes |
| Initiative, Program, Project | `CourseOfAction` | Strategic initiatives that drive change |
| Value driver, Business driver | `Driver` | Factors that create or destroy value |
| Business capability | `BusinessFunction` or `BusinessCapability` | Stable organizational abilities (BusinessFunction preferred) |
| Business process, Workflow | `BusinessProcess` | Sequence of activities that produce outcomes |
| Business service | `BusinessService` | Externally visible behavior exposed to environment |
| Product, Service offering | `Product` | Products or services that deliver value |
| Value stream | `ValueStream` | Sequence of value-adding activities |
| Business case | `BusinessCase` | Justification for a course of action |
| Stakeholder | `Stakeholder` | Individual or group with interest in organization |
| Assessment | `Assessment` | Outcome of analysis of some driver |
| Goal | `Goal` | End state that a stakeholder wants to achieve |
| Requirement | `Requirement` | Statement of need that must be realized |
| Resource | `Resource` | Asset owned or controlled by organization |

### Choosing Between Similar Types

#### BusinessActor vs BusinessRole

**Use BusinessActor when:**
- The entity represents an organizational unit (department, team, division)
- The entity performs work directly
- The entity has reporting relationships with other organizational units
- Example: "Sales Team", "Engineering Department", "Customer Success"

**Use BusinessRole when:**
- The entity represents a role or position that can be assigned to actors
- Multiple actors can have the same role
- The entity defines responsibilities rather than organizational structure
- Example: "Sales Director", "Product Manager", "Software Engineer"

#### BusinessFunction vs BusinessCapability

**Use BusinessFunction (preferred):**
- When aligning with ArchiMate specification
- For stable organizational abilities to perform functions
- When the entity represents what the organization can do

**Use BusinessCapability (legacy support):**
- When maintaining backward compatibility
- When the term "capability" is explicitly used in source material
- Note: Maps to `BusinessFunction` in `archimate_type` field

#### StrategyObjective vs Goal

**Use StrategyObjective when:**
- The goal is strategic and organizational-level
- The goal is high-level and long-term
- The goal is part of organizational strategy

**Use Goal when:**
- The goal is stakeholder-specific
- The goal is more tactical or operational
- The goal is linked to specific requirements

## Relationship Type Mapping

### Consulting Relationship → ArchiMate Relationship

| Consulting Relationship | ArchiMate Relationship | Direction | Notes |
|------------------------|------------------------|-----------|-------|
| "owns" | `owned_by` | Reversed | BusinessFunction owned_by BusinessActor |
| "realizes" | `realizes` | Same | BusinessProcess realizes BusinessFunction |
| "enables" | `serves` or `influences` | Context-dependent | BusinessFunction serves Product, Driver influences StrategyObjective |
| "contributes to" | `influences` | Same | CourseOfAction influences StrategyObjective |
| "depends on" | `depends_on` | Same | General dependency relationship |
| "reports to" | `reports_to` | Same | Organizational (BusinessActor → BusinessActor) |
| "collaborates with" | `collaborates_with` | Same | Organizational (BusinessActor → BusinessActor) |
| "performs" | `performs` | Same | BusinessActor performs BusinessProcess |
| "uses" | `uses` | Same | BusinessProcess uses ApplicationComponent |
| "composes" | `composes` | Same | BusinessProcess composes BusinessProcess |
| "aggregates" | `aggregates` | Same | Product aggregates ProductLine |
| "assigned to" | `assigned_to` | Same | BusinessRole assigned_to BusinessActor |
| "flows to" | `flows_to` | Same | BusinessProcess flows_to BusinessProcess |
| "produces" | `produces` | Same | BusinessProcess produces DataObject |
| "consumes" | `consumes` | Same | BusinessProcess consumes DataObject |
| "accesses" | `accesses` | Same | ApplicationComponent accesses DataObject |
| "triggers" | `triggers` | Same | Event triggers BusinessProcess |
| "managed by" | `managed_by` | Same | Governance relationship |

### Common Relationship Patterns

#### Organizational Ownership
- `BusinessFunction owned_by BusinessActor` (BusinessFunction → BusinessActor)
- `Product owned_by BusinessActor` (Product → BusinessActor)
- `BusinessProcess owned_by BusinessActor` (BusinessProcess → BusinessActor)

#### Strategic Alignment
- `CourseOfAction influences StrategyObjective` (CourseOfAction → StrategyObjective)
- `Driver influences StrategyObjective` (Driver → StrategyObjective)
- `BusinessCase justifies CourseOfAction` (BusinessCase → CourseOfAction)

#### Execution
- `BusinessProcess realizes BusinessFunction` (BusinessProcess → BusinessFunction)
- `CourseOfAction realizes StrategyObjective` (CourseOfAction → StrategyObjective)
- `BusinessFunction serves Product` (BusinessFunction → Product)

#### Process Relationships
- `BusinessActor performs BusinessProcess` (BusinessActor → BusinessProcess)
- `BusinessService serves BusinessProcess` (BusinessService → BusinessProcess)
- `BusinessProcess flows_to BusinessProcess` (BusinessProcess → BusinessProcess)
- `BusinessProcess composes BusinessProcess` (BusinessProcess → BusinessProcess)

## Schema Field Mapping

### Old Schema → New Schema

| Old Field | New Field | Conversion |
|-----------|-----------|------------|
| `name` | `title` | Direct rename |
| `confidence` (enum: "low", "medium", "high") | `confidence_score` (number: 0-1) | low=0.3, medium=0.6, high=0.9 |
| (none) | `archimate_type` | Required, matches entity type |
| (none) | `provenance` | Required object with extraction metadata |
| (none) | `obsidian_note_id` | Optional, links to Obsidian note |

### Provenance Object Structure

```json
{
  "provenance": {
    "extracted_by": "ai-extractor-v1",
    "extracted_at": "2024-01-15T10:30:00Z",
    "validated_by": "human-validator",
    "validated_at": "2024-01-15T11:00:00Z"
  }
}
```

## Examples

### Example 1: Organizational Unit

**Text:** "The Sales Department is responsible for customer acquisition and revenue generation."

**Mapping:**
- Entity Type: `BusinessActor`
- Title: "Sales Department"
- ArchiMate Type: `BusinessActor`
- Relationships: None in this snippet (but might have `reports_to`, `owns`, etc.)

### Example 2: Strategic Initiative

**Text:** "We're launching a digital transformation initiative to improve customer experience."

**Mapping:**
- Entity Type: `CourseOfAction`
- Title: "Digital Transformation Initiative"
- ArchiMate Type: `CourseOfAction`
- Potential Relationships:
  - `influences` → StrategyObjective (if customer experience is a strategic objective)
  - `realizes` → StrategyObjective (if it directly achieves an objective)

### Example 3: Business Capability

**Text:** "We need the capability to onboard customers efficiently within 24 hours."

**Mapping:**
- Entity Type: `BusinessFunction`
- Title: "Customer Onboarding"
- ArchiMate Type: `BusinessFunction`
- Potential Relationships:
  - `realizes` ← BusinessProcess (processes that realize this capability)
  - `serves` → Product (products enabled by this capability)

### Example 4: Process with Owner

**Text:** "The Sales team performs the customer onboarding process."

**Mapping:**
- Entities:
  - BusinessActor: "Sales Team"
  - BusinessProcess: "Customer Onboarding"
- Relationship:
  - `performs`: Sales Team → Customer Onboarding

### Example 5: Strategic Objective with Initiative

**Text:** "Our goal is to increase market share by 20%. The new product launch initiative will help achieve this."

**Mapping:**
- Entities:
  - StrategyObjective: "Increase Market Share by 20%"
  - CourseOfAction: "New Product Launch"
- Relationship:
  - `influences`: New Product Launch → Increase Market Share

## ArchiMate Specification References

- **ArchiMate 3.1 Specification**: https://pubs.opengroup.org/architecture/archimate3-doc/
- **Entity Types**: https://pubs.opengroup.org/architecture/archimate3-doc/chap03.html
- **Relationship Types**: https://pubs.opengroup.org/architecture/archimate3-doc/chap04.html
- **Relationship Rules**: See specification for allowed source/target combinations

## Best Practices

1. **Always use ArchiMate types**: Prefer ArchiMate entity types over consulting terminology
2. **Check relationship constraints**: Verify source/target entity types are allowed for the relationship type
3. **Use appropriate direction**: Follow ArchiMate conventions for relationship direction
4. **Include archimate_type**: Always include this field matching the entity type
5. **Use confidence_score**: Convert confidence enums to 0-1 scale
6. **Document provenance**: Always include extraction metadata
7. **Map consulting concepts**: Use this guide to map common consulting terms to ArchiMate

## Migration Notes

When migrating from consulting terminology:
- `OrgUnit` → `BusinessActor` (for departments) or `BusinessRole` (for roles)
- `StrategicObjective` → `StrategyObjective` (already correct)
- `Initiative` → `CourseOfAction`
- `ValueDriver` → `Driver`
- `BusinessCapability` → `BusinessFunction` (preferred) or keep `BusinessCapability` with `archimate_type: BusinessFunction`
- `owns` → `owned_by` (reverse direction)
- `enables` → `serves` or `influences` (context-dependent)
- `contributes_to` → `influences`

## Questions to Ask When Mapping

1. **For organizational entities**: Is this a unit (BusinessActor) or a role (BusinessRole)?
2. **For strategic entities**: Is this an objective (StrategyObjective) or a goal (Goal)?
3. **For capabilities**: Should this be BusinessFunction or BusinessCapability?
4. **For relationships**: What is the semantic direction? Does it follow ArchiMate conventions?
5. **For ownership**: Is this organizational ownership (owned_by) or performance (performs)?

---

**Version**: 1.0  
**Last Updated**: 2026-01-18  
**Status**: Active
