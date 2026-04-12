# Metamodel Design

See `assets/MetamodelTemplate.md` for the base template structure.

## Core Metamodel Structure

The metamodel should support multiple domains (business, application, technology, physical) and multiple abstraction levels within each domain.

## Domain-Specific Extensions

Different industries require different element types:

### Intralogistics Extensions

```json
{
  "elementTypes": [
    {
      "type": "MaterialFlowProcess",
      "layer": "Business",
      "properties": ["throughput", "cycleTime", "bufferCapacity"]
    },
    {
      "type": "AutomatedGuidedVehicle",
      "layer": "Physical",
      "properties": ["payload", "speed", "batteryCapacity", "navigationMethod"]
    },
    {
      "type": "StorageLocation",
      "layer": "Physical",
      "properties": ["coordinates", "capacity", "accessType"]
    },
    {
      "type": "ConveyorSystem",
      "layer": "Physical",
      "properties": ["length", "speed", "capacity", "controlProtocol"]
    }
  ]
}
```

### Automotive Extensions

```json
{
  "elementTypes": [
    {
      "type": "VehicleSubsystem",
      "layer": "Physical",
      "properties": ["safetyLevel", "supplier", "diagnosticProtocol"]
    },
    {
      "type": "ECU",
      "layer": "Technology",
      "properties": ["processor", "memory", "canBusSpeed", "softwareVersion"]
    },
    {
      "type": "VehicleFunction",
      "layer": "Application",
      "properties": ["asil_level", "activationConditions"]
    },
    {
      "type": "SensorActuator",
      "layer": "Physical",
      "properties": ["type", "range", "accuracy", "updateRate"]
    }
  ]
}
```

## Relationship Semantics

Define clear semantics for relationships to enable AI reasoning:

| Relationship | Meaning | Example | Transitivity |
|--------------|---------|---------|--------------|
| realizes | Implements or fulfills | Container realizes Capability | No |
| uses | Depends on at runtime | Service A uses Service B | No |
| dependsOn | General dependency | System A depends on System B | Yes |
| partOf | Composition | Component is part of Container | Yes |
| communicatesWith | Bidirectional interaction | System A communicates with System B | Yes (symmetric) |
| triggeredBy | Event causation | Process triggered by Event | No |
| controlledBy | Control relationship | AGV controlled by Fleet Controller | No |

## Validation Rules

See `references/ValidationRules.md` for complete validation rules.

AI agents should validate metamodel instances:
1. **Type Consistency:** Elements must have valid types from metamodel
2. **Relationship Validity:** Only allowed relationships between element types
3. **Layer Coherence:** Relationships should generally stay within or cross adjacent layers
4. **Level Coherence:** Parent-child relationships should span exactly one level
5. **Completeness:** Critical properties must be filled
6. **Uniqueness:** Element identifiers must be unique within scope
7. **Cyclical Dependencies:** Detect and flag circular dependencies

## Related References

- See `assets/MetamodelTemplate.md` for base structure
- See `references/ValidationRules.md` for validation implementation
- See `references/ArchitectureProcess.md` → Phase 2 for creation process
