# The Four-Layer Architecture Stack

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: ARchimate METAMODEL (Source of Truth)          │
│ - Structured data model of all architecture elements    │
│ - Defines types, properties, relationships              │
│ - Machine-readable (XML/JSON)                           │
│ - AI operates primarily at this layer using MCP         │
└────────────────────┬────────────────────────────────────┘
                     │ constrained by
┌────────────────────┴────────────────────────────────────┐
│ Layer 2: MODELING FRAMEWORKS (Projection Rules)         │
│ - C4 Model: Software architecture zoom levels           │
│ - BPMN-lite: Business Process flows                     │
│ - Business Model: Strategy & capabilities (2 levels)    │
│ - Defines which elements appear in which views          │
└────────────────────┬────────────────────────────────────┘
                     │ structured by
┌────────────────────┴────────────────────────────────────┐
│ Layer 3: arc42 (Documentation Templates)                │
│ - 12 sections organizing all architecture knowledge     │
│ - Provides context and narrative                        │
│ - Maps views to stakeholder concerns                    │
└────────────────────┬────────────────────────────────────┘
                     │ rendered by
┌────────────────────┴────────────────────────────────────┐
│ Layer 4: VISUALIZATION (Archi/Tools)                    │
│ - Generates diagrams from metamodel                     │
│ - Applies visual styling                                │
│ - Exports to various formats                            │
└─────────────────────────────────────────────────────────┘
```

## Why This Matters for System-of-Systems

System-of-Systems (SoS) architectures—whether in intralogistics, automotive, smart cities, or manufacturing—share common challenges:

- **Multiple autonomous systems** that must interoperate
- **Cross-domain concerns** (business, software, physical, operational)
- **Multiple stakeholders** with different information needs
- **Complex dependencies** and integration points
- **Evolution over time** with different system lifecycles

This framework addresses these by:
- **Single metamodel** ensures consistency across system boundaries
- **Multiple views** serve different stakeholder needs from one source
- **Traceability** from business goals through to implementation
- **Automation** enables keeping documentation synchronized with reality

## Related References

- See `references/arc42.md` for arc42 structure (Layer 3)
- See `references/ViewGenerationAlgorithms.md` for visualization (Layer 4)
- See `references/MetamodelDesign.md` for metamodel structure (Layer 1)
