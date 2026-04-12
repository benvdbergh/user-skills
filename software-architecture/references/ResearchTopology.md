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

| Style | Characteristics | Typical modeling emphasis (optional) |
|-------|----------------|----------------------------------------|
| **Event-Driven** | Decoupling, real-time processing | Events, async boundaries, idempotency |
| **Hexagonal (Ports & Adapters)** | Testability, domain isolation | Ports/adapters, domain core vs infrastructure |
| **Layered** | Clear separation of concerns | Strict dependency direction (e.g. inward toward domain) |
| **Microservices** | Independent deployment, scalability | Service boundaries, APIs, data ownership |
| **Modular Monolith** | Simpler ops than microservices, still modular | Modules, package boundaries, compile-time seams |
| **Serverless** | Low operational overhead | Functions, queues, managed services, cold start / limits |

> **Enterprise / ArchiMate:** If the user needs **ArchiMate elements, portfolio views, or ontology-backed extraction**, stop inferring from this table and load **`enterprise-architecture`** after topology is chosen.

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

## After user confirms topology

- Continue with **`references/create-architecture.md`** using the chosen style and constraints (context diagram, decisions, NFRs).
- Use MCP or repo tools **only** in ways the user has enabled (e.g. cloud CLI, infra search). Do **not** assume an ArchiMate or Neo4j MCP unless the user is explicitly doing enterprise modeling with those tools.
- For **ArchiMate / enterprise model** updates, load **`enterprise-architecture`** and (when on Ai-Vault CAI) **`enterprise-model-store`** for ontology and graph writes.

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
→ Proceed with `create-architecture` workflow (or enterprise modeling skills if the scope is portfolio/EA)
```

## Quality Checklist

- [ ] Domain clearly identified
- [ ] At least 3 reference architectures researched
- [ ] Trade-offs evaluated using structured method
- [ ] Style selection justified
- [ ] User presented with findings before element creation
- [ ] User confirmation received before proceeding

