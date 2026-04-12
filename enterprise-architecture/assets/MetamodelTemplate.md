# Metamodel Template

This template provides the core structure for creating architecture metamodels. See `references/MetamodelDesign.md` for complete details and domain-specific extensions.

## Core Metamodel Structure

```json
{
  "metamodel": {
    "elementTypes": [
      {
        "type": "Product",
        "layer": "Business",
        "level": "B2",
        "properties": ["name", "description", "valueProposition", "targetMarket"],
        "relationships": ["realizes", "dependsOn", "composedOf"]
      },
      {
        "type": "Capability",
        "layer": "Business",
        "level": "B1",
        "properties": ["name", "description", "maturityLevel"],
        "relationships": ["enables", "requires", "supports"]
      },
      {
        "type": "System",
        "layer": "Application",
        "level": "S1",
        "properties": ["name", "description", "owner", "criticality"],
        "relationships": ["dependsOn", "communicatesWith", "realizes"]
      },
      {
        "type": "Container",
        "layer": "Application",
        "level": "S2",
        "properties": ["name", "technology", "description", "responsibilities"],
        "relationships": ["uses", "dependsOn", "partOf", "communicatesWith"]
      },
      {
        "type": "Component",
        "layer": "Application",
        "level": "S3",
        "properties": ["name", "description", "responsibilities", "interfaces"],
        "relationships": ["uses", "dependsOn", "partOf", "implements"]
      },
      {
        "type": "Interface",
        "layer": "Application",
        "level": "S4",
        "properties": ["name", "protocol", "format", "operations"],
        "relationships": ["exposedBy", "consumedBy"]
      },
      {
        "type": "Process",
        "layer": "Business",
        "level": "B2",
        "properties": ["name", "description", "owner", "frequency"],
        "relationships": ["uses", "triggeredBy", "produces"]
      },
      {
        "type": "PhysicalElement",
        "layer": "Physical",
        "level": "P1",
        "properties": ["name", "type", "location", "specifications"],
        "relationships": ["controlledBy", "connectedTo", "locatedIn"]
      }
    ],
    "relationshipTypes": [
      "uses",
      "dependsOn",
      "realizes",
      "composedOf",
      "partOf",
      "communicatesWith",
      "triggeredBy",
      "enables",
      "supports",
      "implements",
      "exposedBy",
      "consumedBy",
      "controlledBy"
    ]
  }
}
```

## Usage

1. Start with the core metamodel structure above
2. Add domain-specific extensions (see `references/MetamodelDesign.md`)
3. Define custom properties for your domain
4. Validate using rules in `references/ValidationRules.md`

## Related References

- See `references/MetamodelDesign.md` for complete metamodel design and domain extensions
- See `references/ValidationRules.md` for validation rules
- See `references/ArchitectureProcess.md` → Phase 2 for metamodel creation process
