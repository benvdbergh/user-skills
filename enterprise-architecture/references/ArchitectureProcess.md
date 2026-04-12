# The Architecture Process

The architecture process consists of six phases that guide the creation of comprehensive System-of-Systems architecture documentation.

## Phase 1: Discovery & Requirements

**Objective:** Understand the problem space and stakeholder needs

**Activities:**
1. **Identify stakeholders** and their concerns
2. **Gather requirements** (functional and quality)
3. **Understand constraints** (technical, organizational, regulatory)
4. **Define scope and boundaries**
5. **Identify existing systems** and integration points

**Outputs:**
- Initial metamodel with placeholder elements
- arc42 Sections 1-3 (partially filled)
- Stakeholder map
- Constraint catalog

**AI Agent Tasks:**
- Parse requirements documents
- Extract stakeholders and their concerns
- Identify quality attributes
- Generate initial glossary
- Create constraint list

**Example (Intralogistics):**
```
Input: "We need an AGV fleet controller that manages 50+ AGVs in a 
100,000 sqm warehouse, integrating with our SAP WMS and supporting 
both pallet and case-level transport"

AI Extracts:
- Stakeholder: Warehouse operations manager
- Quality Goal: Scalability (50+ AGVs)
- Quality Goal: Throughput (warehouse size implies high volume)
- Constraint: Must integrate with SAP WMS
- Functional Requirement: Support multiple AGV types/payloads
- Context Element: SAP WMS (external system)
- Context Element: AGV fleet (external hardware)
```

**Related Workflow:** `Workflows/ResearchTopology.md` - Pattern selection before creation

---

## Phase 2: Solution Design

**Objective:** Create the architecture metamodel and key design decisions

**Activities:**
1. **Define solution strategy** (high-level approach)
2. **Create metamodel** with all elements and relationships
3. **Make key architecture decisions** (technology choices, patterns)
4. **Design system decomposition** at multiple levels
5. **Define integration points** and interfaces

**Outputs:**
- Complete metamodel (all layers)
- arc42 Sections 4-5 (Building blocks)
- Architecture Decision Records
- Technology stack definition

**AI Agent Tasks:**
- Generate system decomposition (Business L1→L2, Software L1→L4)
- Create element catalog with properties
- Define relationships and dependencies
- Generate ADRs for key decisions
- Validate metamodel consistency

**Example (Intralogistics):**
```
Metamodel Elements Created:

Business Layer:
- IntralogisticsPortfolio (B1)
  ├─ AGVFleetController (B2 - Product)
  ├─ WarehouseControlSystem (B2 - Product)
  └─ WarehouseManagementSystem (B2 - Product)

Software Layer (AGV Fleet Controller):
- AGVFleetController (S1 - System)
  ├─ TaskManagementService (S2 - Container)
  │   ├─ TaskQueue (S3 - Component)
  │   ├─ PriorityScheduler (S3 - Component)
  │   └─ TaskExecutor (S3 - Component)
  ├─ PathPlanningService (S2 - Container)
  │   ├─ GlobalPlanner (S3 - Component)
  │   ├─ LocalPlanner (S3 - Component)
  │   └─ CollisionAvoidance (S3 - Component)
  ├─ TrafficController (S2 - Container)
  ├─ AGVGateway (S2 - Container)
  └─ FleetDatabase (S2 - Container - PostgreSQL)

Relationships:
- TaskManagementService --uses--> PathPlanningService
- TaskManagementService --uses--> TrafficController
- PathPlanningService --uses--> FleetDatabase
- AGVGateway --communicates-with--> AGV (external)
```

**Related References:**
- See `references/MetamodelDesign.md` for metamodel structure
- For **solution-level** decision docs, use **`software-architecture`** → `assets/architecture-decision-template.md`

---

## Phase 3: Behavioral & Runtime Design

**Objective:** Define how the system behaves and interacts

**Activities:**
1. **Identify key scenarios** (use cases, user journeys)
2. **Model process flows** (BPMN-lite)
3. **Define runtime interactions** (sequence diagrams)
4. **Specify data flows**
5. **Design error handling** and resilience patterns

**Outputs:**
- Process models
- Sequence diagrams
- State machines (where applicable)
- arc42 Section 6 (Runtime View)

**AI Agent Tasks:**
- Generate process flows from requirements
- Create sequence diagrams for key scenarios
- Identify state transitions
- Document data flow patterns
- Model error scenarios

**Example (Intralogistics - Order Fulfillment Process):**
```
BPMN-lite Process: "Order Fulfillment via AGV"

[WMS] Order Created
  ↓
[Fleet Controller] Receive Transport Task
  ↓
[Task Manager] Analyze Task → Select AGV
  ↓ (parallel)
  ├─ [Path Planner] Calculate Route
  └─ [Traffic Controller] Reserve Path
  ↓ (join)
[AGV Gateway] Send Mission to AGV
  ↓
[AGV] Execute Mission
  ↓ (loop while in transit)
[AGV Gateway] Monitor Progress
  ↓
[AGV] Mission Complete
  ↓
[Fleet Controller] Report Completion to WMS
  ↓
[WMS] Update Inventory

Error Handling:
- AGV unavailable → Requeue task
- Path blocked → Recalculate route
- AGV failure → Reassign to backup AGV
```

**Related References:**
- See `references/ModelingApproaches.md` for BPMN-lite details

---

## Phase 4: Deployment & Infrastructure

**Objective:** Map software to physical/virtual infrastructure

**Activities:**
1. **Define deployment topology** (on-premise, cloud, edge)
2. **Map containers to infrastructure**
3. **Design network architecture**
4. **Specify hardware requirements**
5. **Plan scalability and redundancy**

**Outputs:**
- Deployment diagrams
- Infrastructure specifications
- Network diagrams
- arc42 Section 7 (Deployment View)

**AI Agent Tasks:**
- Generate deployment views
- Map containers to servers/VMs/containers
- Document network zones and protocols
- Specify hardware requirements
- Model redundancy and failover

**Example (Intralogistics - Hybrid Deployment):**
```
Deployment View:

On-Premise Edge (Warehouse):
  [Edge Server - Ubuntu 22.04]
    ├─ TaskManagementService (Docker)
    ├─ PathPlanningService (Docker)
    ├─ TrafficController (Docker)
    └─ AGVGateway (Docker)
  [Local Network]
    └─ AGVs (50x) via MQTT/WiFi

On-Premise Data Center:
  [PostgreSQL Cluster]
    └─ FleetDatabase (Primary + Replica)

Cloud (AWS):
  [Analytics Service]
    └─ Historical data, reporting, ML models

Integration:
- Edge ←VPN→ Data Center (real-time sync)
- Edge ←HTTPS→ Cloud (batch upload every 5min)
```

---

## Phase 5: Cross-Cutting & Quality

**Objective:** Document recurring patterns and quality measures

**Activities:**
1. **Identify cross-cutting concerns** (security, logging, error handling)
2. **Define quality scenarios**
3. **Document technical concepts** (communication patterns, data models)
4. **Specify quality metrics** and acceptance criteria

**Outputs:**
- Concept descriptions
- Quality scenarios
- Metrics definitions
- arc42 Sections 8, 10

**AI Agent Tasks:**
- Extract common patterns from metamodel
- Generate quality scenarios from requirements
- Document architectural concepts
- Create quality attribute trees

**Example (Intralogistics - Quality Scenarios):**
```
Quality Scenario: Scalability
- Stimulus: Number of AGVs increases from 50 to 100
- Response: System handles doubled load without degradation
- Metric: Task assignment latency remains < 200ms (p95)

Quality Scenario: Availability
- Stimulus: Path Planning Service crashes
- Response: Service auto-restarts, tasks queue temporarily
- Metric: System downtime < 30 seconds, zero task loss

Cross-Cutting Concept: Communication Patterns
- Internal Services: Synchronous REST for queries, async events for state changes
- AGV Communication: MQTT with QoS=1 for reliability
- WMS Integration: REST API with retry logic and circuit breaker
```

---

## Phase 6: Decisions, Risks & Refinement

**Objective:** Document rationale and identify issues

**Activities:**
1. **Record architecture decisions** (ADRs)
2. **Identify risks** and mitigation strategies
3. **Document technical debt**
4. **Refine and validate** entire documentation

**Outputs:**
- ADR catalog
- Risk register
- Technical debt backlog
- arc42 Sections 9, 11

**AI Agent Tasks:**
- Generate ADRs from design choices
- Identify potential risks
- Suggest mitigation strategies
- Cross-validate all sections for consistency

**Example (Intralogistics - ADR):**
```
ADR-001: Use PostgreSQL for Fleet State Management

Context:
- Need persistent storage for AGV states, tasks, and paths
- Requires ACID transactions for task assignment
- Must support spatial queries for path planning

Decision:
- Use PostgreSQL with PostGIS extension

Rationale:
- ACID compliance prevents task double-assignment
- PostGIS provides spatial indexing for efficient path queries
- Mature replication support for HA deployment
- Team has existing PostgreSQL expertise

Alternatives Considered:
- MongoDB: Lacks ACID guarantees we need
- Redis: In-memory only, not suitable for persistence
- Cassandra: Overkill for our scale, complex operations

Consequences:
- Positive: Strong consistency, spatial capabilities
- Negative: Vertical scaling limits, requires careful index management
- Mitigation: Use read replicas for reporting queries
```

**Related Workflow:** `Workflows/QualityReview.md` - Quality validation and gap analysis

**Related References:**
- For ADR-style **product/solution** decisions, see **`software-architecture`** → `assets/architecture-decision-template.md`
- See `references/QualityAssurance.md` for validation rules
