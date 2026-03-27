# ResearchTopology Workflow

Ensures that Claude doesn't just "guess" a design, but instead researches established industry patterns (topologies) that fit the specific requirements.

## When to Use

- User requests: "new architecture", "best way to build X", "topology research", "pattern selection"
- Before creating any new architecture model
- When user asks "what's the best architecture for..." questions

## Workflow Process

### Step 1: Identify the Domain

**Action**: Extract the domain context from the user's request.

**Examples:**
- E-commerce platform
- High-Frequency Trading system
- IoT sensor network
- Content Management System
- Real-time analytics pipeline

**Output**: Clear domain identification statement

### Step 2: Search for Reference Architectures

**Action**: Research established patterns for the identified domain.

**Search Strategy:**
1. Look for "Azure Reference Architecture for {domain}"
2. Search for "AWS Well-Architected patterns for {domain}"
3. Research "Industry patterns for {domain} architecture"
4. Find "Best practices for {domain} system design"

**Output**: List of 3-5 relevant reference architectures or patterns

### Step 3: Evaluate Trade-offs

**Action**: Compare at least 2-3 different topologies using structured analysis.

**Evaluation Method Options:**

**Option A: Weighted Shortest Job First (WSJF)**
- Evaluate based on:
  - Business Value
  - Time Criticality
  - Risk Reduction
  - Job Size

**Option B: Pros/Cons Matrix**
- For each topology, list:
  - Pros (advantages)
  - Cons (disadvantages)
  - Complexity score (1-5)
  - Scalability score (1-5)
  - Cost implications

**Output**: Comparison table with recommendation

### Step 4: Select Architectural Style

**Action**: Choose the appropriate architectural style based on evaluation.

**Common Styles and When to Use:**

| Style | Characteristics | ArchiMate Focus |
|-------|----------------|-----------------|
| **Event-Driven** | Decoupling, Real-time processing | Focus on Flow and Event elements |
| **Hexagonal (Ports & Adapters)** | Testability, Domain isolation | Focus on Application Interface and Service elements |
| **Layered** | Clear separation of concerns | Strict Realization paths from Tech → App → Business |
| **Microservices** | Independent deployment, scalability | Many Application Components + Application Interfaces |
| **Modular Monolith** | Simpler than microservices, still modular | Fewer Components, clear internal boundaries |
| **Serverless** | Low operational overhead | High focus on Technology Services rather than Devices |

**Selection Criteria:**
- Match style to domain requirements
- Consider team capabilities
- Evaluate operational complexity
- Assess cost implications

**Output**: Selected style with justification

### Step 5: Present to User

**Action**: Before creating any elements, present the research findings and recommendation.

**Presentation Format:**
```
## Topology Research Results

**Domain**: {identified domain}

**Researched Patterns**:
1. {Pattern 1}: {brief description}
2. {Pattern 2}: {brief description}
3. {Pattern 3}: {brief description}

**Comparison**:
[Comparison table or WSJF results]

**Recommended Style**: {selected style}
**Justification**: {reasoning}

**Next Steps**: Proceed with creating architecture model using {selected style}?
```

**Critical Rule**: **DO NOT** create elements until user confirms the selected topology.

## Integration with MCP Tools

After user confirms topology selection:
- Use MCP tools to create elements following the selected pattern
- Apply the selected style's ArchiMate focus areas
- Ensure element types match the architectural style

## Example Execution

```
User: "What's the best architecture for a real-time analytics platform?"

Step 1: Domain = Real-time Analytics Platform
Step 2: Research finds:
  - Event-Driven Architecture (Kafka, Stream Processing)
  - Lambda Architecture (Batch + Stream)
  - Microservices with Message Queue
Step 3: Comparison shows Event-Driven best for real-time requirements
Step 4: Select Event-Driven style
Step 5: Present findings to user
→ User confirms
→ Proceed with creating Event-Driven architecture model
```

## Quality Checklist

- [ ] Domain clearly identified
- [ ] At least 3 reference architectures researched
- [ ] Trade-offs evaluated using structured method
- [ ] Style selection justified
- [ ] User presented with findings before element creation
- [ ] User confirmation received before proceeding

