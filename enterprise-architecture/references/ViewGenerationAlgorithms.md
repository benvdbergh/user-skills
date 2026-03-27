# View Generation Algorithms

For each arc42 section, the AI agent applies projection rules to generate views from the metamodel.

## Section 3 (Context & Scope)

```python
def generate_context_diagram(metamodel):
    # Filter elements
    system = metamodel.get_elements(type="System", level="S1")
    external_systems = metamodel.get_elements(related_to=system, 
                                               type=["System", "ExternalSystem"])
    users = metamodel.get_elements(type="User", interacts_with=system)
    
    # Get relationships
    relationships = metamodel.get_relationships(
        source=system + external_systems + users,
        target=system + external_systems + users
    )
    
    # Generate diagram
    return create_diagram(
        elements=system + external_systems + users,
        relationships=relationships,
        style="C4_Context"
    )
```

## Section 5.2 (Container View)

```python
def generate_container_diagram(metamodel, system):
    # Filter containers belonging to system
    containers = metamodel.get_elements(
        type="Container",
        parent=system
    )
    
    # Get external dependencies
    external_systems = metamodel.get_elements(
        related_to=containers,
        not_parent=system
    )
    
    # Get relationships
    relationships = metamodel.get_relationships(
        source=containers + external_systems,
        target=containers + external_systems,
        type=["uses", "dependsOn", "communicatesWith"]
    )
    
    return create_diagram(
        elements=containers + external_systems,
        relationships=relationships,
        style="C4_Container"
    )
```

## Section 6 (Runtime View - Process)

```python
def generate_process_diagram(metamodel, process):
    # Get process steps
    activities = metamodel.get_elements(
        type="Activity",
        part_of=process
    )
    
    # Get decision points
    gateways = metamodel.get_elements(
        type="Gateway",
        part_of=process
    )
    
    # Get sequence flows
    flows = metamodel.get_relationships(
        type="sequenceFlow",
        between=activities + gateways
    )
    
    # Get participating systems
    systems = metamodel.get_elements(
        type=["System", "Container"],
        performs=activities
    )
    
    return create_bpmn_diagram(
        activities=activities,
        gateways=gateways,
        flows=flows,
        lanes=systems,
        style="BPMN_Lite"
    )
```

## Related References

- See `Core/DocumentationFramework.md` for arc42 section structure
- See `Reference/ModelingApproaches.md` for C4 and BPMN-lite details
- See `Workflows/ApplyVisualBestPractices.md` for visual layout rules
