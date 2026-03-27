# AI Agent Workflow

## Input Processing

The AI agent should accept various input formats:

1. **Natural Language Requirements**
   - "Build an AGV fleet controller that manages 50 vehicles in a warehouse"
   - Parse stakeholders, constraints, quality goals

2. **Existing Documentation**
   - Import from arc42 markdown
   - Extract existing architectural decisions
   - Identify gaps

3. **Structured Data**
   - JSON/YAML system descriptions
   - API specifications (OpenAPI/Swagger)
   - Infrastructure-as-Code (Terraform, K8s manifests)

4. **Diagrams**
   - Import ArchiMate XML
   - Parse C4 diagrams (if in standard format)
   - Extract elements and relationships

## Metamodel Generation Workflow

```
┌─────────────────────────────────────────────────────┐
│ 1. ANALYZE INPUTS                                    │
│    - Parse requirements                              │
│    - Identify domain (intralogistics, automotive...) │
│    - Extract key entities and relationships          │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ 2. SELECT & EXTEND METAMODEL                        │
│    - Choose base metamodel (generic or domain)      │
│    - Add domain-specific element types              │
│    - Define custom properties                       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ 3. CREATE BUSINESS MODEL (B1-B2)                    │
│    - Identify capabilities                          │
│    - Map products/systems                           │
│    - Define key processes                           │
│    - Extract stakeholders and goals                 │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ 4. CREATE SOFTWARE MODEL (S1-S4)                    │
│    - Define system context (S1)                     │
│    - Decompose into containers (S2)                 │
│    - Break down into components (S3)                │
│    - Specify interfaces (S4)                        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ 5. ADD PHYSICAL/DEPLOYMENT                          │
│    - Map to infrastructure                          │
│    - Define network topology                        │
│    - Specify hardware requirements                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ 6. ESTABLISH TRACEABILITY                           │
│    - Link business→software (realizes)              │
│    - Link software→physical (deployed-on)           │
│    - Link processes→systems (uses)                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ 7. VALIDATE METAMODEL                               │
│    - Check type consistency                         │
│    - Verify relationship validity                   │
│    - Detect circular dependencies                   │
│    - Ensure completeness                            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ 8. GENERATE VIEWS & DOCUMENTATION                   │
│    - Apply C4 projection rules                      │
│    - Generate BPMN-lite processes                   │
│    - Create deployment diagrams                     │
│    - Populate arc42 sections                        │
└─────────────────────────────────────────────────────┘
```

## Decision Making & ADR Generation

The AI agent should generate Architecture Decision Records when:
- Multiple valid alternatives exist
- Significant impact on quality attributes
- Trade-offs between competing concerns
- Deviation from standards or common patterns

See `Templates/ADRTemplate.md` for the ADR template structure.

## Incremental Refinement

The agent should support iterative refinement:

1. **Initial Pass:** High-level structure (B1, S1-S2)
2. **Detailed Design:** Component level (S3-S4)
3. **Cross-Cutting:** Quality, security, deployment
4. **Validation:** Consistency checks, gap analysis
5. **Stakeholder Review:** Incorporate feedback
6. **Finalization:** Complete documentation

At each stage:
- Generate intermediate views
- Identify gaps and uncertainties
- Request clarification where needed
- Update metamodel incrementally

## Related References

- See `Core/ArchitectureProcess.md` for the 6-phase process
- See `Reference/ViewGenerationAlgorithms.md` for view generation
- See `Templates/ADRTemplate.md` for ADR structure
- See `Reference/ValidationRules.md` for validation
