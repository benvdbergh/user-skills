# QualityReview Workflow

Architectural Gap Analysis workflow. Professional architects spend much of their time moving from "As-Is" (Current State) to "To-Be" (Future State). This workflow validates not just XML schema, but architectural logic.

## When to Use

- User requests: "validate architecture", "quality review", "architectural logic", "gap analysis"
- Before making significant changes to an architecture model
- When moving from Current State to Future State
- When user asks "what's wrong with this architecture?"

## Workflow Process

### Step 1: Analyze Current State

**Action**: Read and understand the existing architecture model.

**Analysis Tasks:**

1. **Read the Model**
   - Load all elements and relationships
   - Understand the current architecture structure
   - Identify all layers (Business, Application, Technology)

2. **Identify Bottlenecks**
   - Find elements with excessive incoming relationships
   - Identify single points of failure
   - Detect tight coupling patterns
   - Find performance bottlenecks

3. **Detect Anti-Patterns**
   - "God Components" (components doing too much)
   - Circular dependencies
   - Missing abstraction layers
   - Inappropriate layer violations

**Output**: Current State Analysis Report

### Step 2: Validate Architectural Logic

**Action**: Check that the model follows architectural principles, not just XML schema.

**Validation Rules:**

#### Business Layer Logic
- [ ] Every Business Process has a Business Actor (who performs it)
- [ ] Business Processes have clear inputs and outputs
- [ ] Business Events trigger appropriate Business Processes
- [ ] Business Functions are properly decomposed

#### Application Layer Logic
- [ ] Every Application Component is realized by System Software
- [ ] Application Components have clear responsibilities
- [ ] Data Objects are accessed by appropriate Application Components
- [ ] Application Interfaces expose necessary services

#### Technology Layer Logic
- [ ] System Software runs on appropriate Devices
- [ ] Technology Services are provided by System Software
- [ ] Infrastructure is properly modeled
- [ ] Network and communication paths are clear

#### Cross-Layer Logic
- [ ] Business Processes are realized by Application Components
- [ ] Application Components are realized by System Software
- [ ] Realization paths are complete (no gaps)
- [ ] Serving relationships are appropriate (not circular)

**Output**: Architectural Logic Validation Report

### Step 3: Identify Orphaned Elements

**Action**: Find elements with no relationships (orphaned).

**Orphan Detection:**
- Elements with zero relationships
- Elements that don't connect to the main architecture
- Isolated components or services
- Unused data objects

**Questions to Ask:**
- Is this element actually part of the architecture?
- Should it be connected to something?
- Is it a mistake or intentional isolation?

**Output**: List of orphaned elements with recommendations

### Step 4: Perform Impact Analysis

**Action**: Before making changes, analyze what will be affected.

**Impact Analysis Process:**

1. **Identify Change Target**
   - Which element/relationship will be changed?
   - What is the scope of the change?

2. **Trace Dependencies**
   - Find all elements that depend on the target
   - Identify all relationships involving the target
   - Map the dependency chain

3. **Calculate Impact**
   - Count affected elements
   - Identify affected Business Processes
   - List affected Application Components
   - Note affected Technology Services

4. **Report Impact**
   ```
   Impact Analysis for: {Element Name}
   
   Direct Impact:
   - {Element 1}: {Relationship type}
   - {Element 2}: {Relationship type}
   
   Indirect Impact:
   - {Element 3}: Through {Element 1}
   - {Element 4}: Through {Element 2}
   
   Business Impact:
   - {Business Process 1} will be affected
   - {Business Process 2} will be affected
   
   Total Elements Affected: {count}
   ```

**Output**: Impact Analysis Report

### Step 5: Define Implementation Plateaus

**Action**: Use ArchiMate "Implementation and Migration" layer to model the steps to get to the new design.

**Plateau Definition Process:**

1. **Identify Current Plateau (As-Is)**
   - Document the current state as Plateau 0
   - List all current elements and their state

2. **Define Target Plateau (To-Be)**
   - Document the desired future state as Plateau N
   - List all target elements and their state

3. **Create Intermediate Plateaus**
   - Break down the migration into steps
   - Each plateau represents a milestone
   - Plateaus should be independently deployable/testable

4. **Model Work Packages**
   - For each plateau transition, define Work Packages
   - Work Packages group related changes
   - Each Work Package should have clear deliverables

**Plateau Structure:**
```
Plateau 0 (Current State)
  ├── Work Package 1: {Description}
  └── → Plateau 1 (Milestone 1)
        ├── Work Package 2: {Description}
        └── → Plateau 2 (Milestone 2)
              └── → Plateau N (Target State)
```

**Output**: Plateau and Work Package structure

### Step 6: Generate Quality Report

**Action**: Compile all findings into a comprehensive report.

**Report Structure:**

```markdown
# Architecture Quality Review Report

## Current State Analysis
[Findings from Step 1]

## Architectural Logic Validation
[Results from Step 2]
- ✅ Passed validations
- ❌ Failed validations (with recommendations)

## Orphaned Elements
[List from Step 3]

## Impact Analysis
[Results from Step 4]

## Migration Path
[Plateau structure from Step 5]

## Recommendations
1. {Priority 1 recommendation}
2. {Priority 2 recommendation}
3. {Priority 3 recommendation}
```

**Output**: Complete Quality Review Report

## Integration with MCP Tools

When performing quality review:
- Use MCP tools to read existing model elements
- Use MCP tools to search for patterns (e.g., elements with many relationships)
- Use MCP tools to validate model structure
- Use MCP tools to create Implementation and Migration elements (Plateaus, Work Packages)

## Example Execution

```
User: "Review the current architecture model for issues"

Step 1: Analyze Current State
  - Finds: Payment Component has 15 incoming Serving relationships
  - Identifies: Single point of failure
  - Detects: Missing Business Actor for "Process Order" Process

Step 2: Validate Architectural Logic
  - ❌ Business Process "Process Order" has no Business Actor
  - ❌ Application Component "Payment" not realized by System Software
  - ✅ Data Objects properly accessed

Step 3: Identify Orphans
  - "Legacy Reporting" Component has no relationships
  - Recommendation: Connect or remove

Step 4: Impact Analysis
  - If we change "Payment" Component:
    - Direct: 15 Application Components affected
    - Indirect: 8 Business Processes affected
    - Total: 23 elements impacted

Step 5: Define Plateaus
  - Plateau 0: Current monolithic Payment
  - Plateau 1: Split Payment into Payment API + Payment Service
  - Plateau 2: Add Payment Gateway integration
  - Plateau 3: Target microservices architecture

Step 6: Generate Report
  → Present comprehensive quality review to user
```

## Quality Metrics

Track these metrics for architecture health:

- **Coupling Score**: Average relationships per element (target: 2-5)
- **Cohesion Score**: Related elements grouped together (target: >70%)
- **Layer Compliance**: All Realization paths complete (target: 100%)
- **Orphan Rate**: Elements with no relationships (target: <5%)
- **Bottleneck Count**: Elements with >10 relationships (target: 0)

## Common Issues and Fixes

| Issue | Detection | Fix |
|-------|-----------|-----|
| Missing Business Actor | Business Process without Assignment | Add Business Actor and Assignment relationship |
| Unrealized Component | Application Component without Realization | Add System Software and Realization |
| God Component | Component with >10 relationships | Split into multiple components |
| Circular Dependency | A serves B, B serves A | Introduce abstraction layer |
| Orphaned Element | Element with 0 relationships | Connect or remove |

