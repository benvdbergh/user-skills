# Quality Assurance

## Documentation Quality Checks

### Completeness Score

```python
def calculate_completeness(arc42_doc):
    section_weights = {
        1: 5,   # Goals & stakeholders (critical)
        3: 10,  # Context (critical)
        5: 15,  # Building blocks (critical)
        6: 10,  # Runtime (important)
        7: 10,  # Deployment (important)
        8: 5,   # Cross-cutting (important)
        9: 10,  # Decisions (important)
        10: 5,  # Quality (important)
        # 2, 4, 11, 12 are optional or context-dependent
    }
    
    score = 0
    max_score = sum(section_weights.values())
    
    for section, weight in section_weights.items():
        if arc42_doc.section_is_complete(section):
            score += weight
    
    return score / max_score * 100
```

### Diagram Coverage

```python
def check_diagram_coverage(metamodel):
    required_diagrams = [
        ("Business Context", "B2", "required"),
        ("System Context", "S1", "required"),
        ("Container View", "S2", "required"),
        ("Component View", "S3", "recommended"),
        ("Key Process Flow", "Process", "required"),
        ("Deployment View", "Deployment", "required")
    ]
    
    coverage = []
    for name, element_level, importance in required_diagrams:
        can_generate = metamodel.has_sufficient_elements(element_level)
        coverage.append({
            "diagram": name,
            "can_generate": can_generate,
            "importance": importance
        })
    
    return coverage
```

### Consistency Checks

```python
def check_terminology_consistency(arc42_doc, metamodel):
    # Extract all terms from narrative text
    narrative_terms = extract_terms(arc42_doc.all_text())
    
    # Compare with glossary
    glossary_terms = set(arc42_doc.glossary.keys())
    
    # Compare with metamodel element names
    model_terms = set(e.name for e in metamodel.elements)
    
    # Find inconsistencies
    undefined = narrative_terms - glossary_terms
    unused_glossary = glossary_terms - narrative_terms
    model_mismatch = (narrative_terms - model_terms) & glossary_terms
    
    return {
        "undefined_terms": undefined,
        "unused_glossary_terms": unused_glossary,
        "model_mismatches": model_mismatch
    }
```

## Stakeholder-Specific Views

Different stakeholders need different levels of detail:

**Executive View (C-suite, Product Management):**
- Business Layer (B1-B2)
- System Context (S1)
- Key quality goals
- Major architectural decisions
- High-level deployment

**Architect View (Solution/Enterprise Architects):**
- All layers (B1-B2, S1-S3)
- Cross-cutting concerns
- All architectural decisions
- Quality scenarios
- Technology choices

**Developer View (Software Engineers):**
- System Context (S1)
- Container View (S2)
- Component View (S3) - detailed
- Interface specifications (S4)
- Deployment instructions
- Development guidelines

**Operations View (DevOps, SRE):**
- Container View (S2)
- Deployment View (detailed)
- Infrastructure requirements
- Monitoring & logging strategies
- Disaster recovery procedures

**Integration View (System Integrators):**
- System Context (S1)
- Container View (S2)
- Interface specifications (S4) - detailed
- Integration patterns
- Data formats and protocols

## Related References

- See `references/ValidationRules.md` for metamodel validation
- See `Workflows/QualityReview.md` for quality review workflow
- See `references/ArchitectureProcess.md` → Phase 6 for refinement process
