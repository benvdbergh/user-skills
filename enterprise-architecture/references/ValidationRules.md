# Metamodel Validation Rules

## Type Safety

```python
def validate_type_safety(metamodel):
    errors = []
    for element in metamodel.elements:
        if element.type not in metamodel.allowed_types:
            errors.append(f"Invalid type: {element.type} for {element.id}")
        
        for property in element.properties:
            if not validate_property_type(property, element.type):
                errors.append(f"Invalid property {property} for {element.type}")
    
    return errors
```

## Relationship Validity

```python
def validate_relationships(metamodel):
    errors = []
    for rel in metamodel.relationships:
        allowed = metamodel.get_allowed_relationships(
            source_type=rel.source.type,
            target_type=rel.target.type
        )
        
        if rel.type not in allowed:
            errors.append(
                f"Invalid relationship: {rel.source.id} "
                f"--{rel.type}--> {rel.target.id}"
            )
    
    return errors
```

## Completeness Checks

```python
def validate_completeness(metamodel, arc42_section):
    required_views = {
        "3": ["system_context"],
        "5": ["container_view", "component_view"],
        "6": ["key_scenarios"],
        "7": ["deployment_view"]
    }
    
    missing = []
    for view in required_views.get(arc42_section, []):
        if not metamodel.can_generate_view(view):
            missing.append(f"Missing elements for {view}")
    
    return missing
```

## Cross-Layer Consistency

```python
def validate_traceability(metamodel):
    # Every S1 System should realize at least one B2 Product/Capability
    systems = metamodel.get_elements(type="System", level="S1")
    
    orphaned = []
    for system in systems:
        business_links = metamodel.get_relationships(
            source=system,
            type="realizes",
            target_type=["Product", "Capability"]
        )
        
        if not business_links:
            orphaned.append(f"System {system.id} doesn't realize any business value")
    
    return orphaned
```

## Related References

- See `Reference/MetamodelDesign.md` for relationship semantics
- See `Reference/QualityAssurance.md` for documentation quality checks
- See `Workflows/QualityReview.md` for workflow integration
