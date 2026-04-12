# Use Case Examples

Practical examples demonstrating workflow execution for different scenarios.

## Example 1: System-of-Systems Architecture (Intralogistics)

**Scenario:** Create architecture for an AGV fleet controller managing 50+ vehicles in a warehouse

**Workflow Execution:**
```
1. ResearchTopology workflow invoked
   → Identifies domain: Intralogistics/Warehouse Automation
   → Researches patterns: Centralized vs Distributed control
   → Evaluates: Edge computing for latency vs Centralized for coordination
   → Decision: Hybrid approach (edge gateways + centralized planning)

2. Metamodel Creation (Phase 2: Solution Design)
   → Business Layer: IntralogisticsPortfolio (B1) → AGVFleetController (B2)
   → Software Layer: System (S1) → Containers (S2) → Components (S3)
   → Physical Layer: AGVs, Edge Servers, Network Infrastructure
   → Relationships: TaskManagementService uses PathPlanningService

3. ApplyVisualBestPractices workflow invoked
   → Creates System Context view (S1) with proper layer ordering
   → Creates Container view (S2) with gravity principle applied
   → Groups related services to minimize crossing relationships

4. Process Modeling (Phase 3: Behavioral Design)
   → BPMN-lite: Order Fulfillment via AGV process
   → Sequence diagram: Task assignment flow
   → Error handling: AGV failure scenarios

5. QualityReview workflow invoked
   → Validates: All containers have deployment targets
   → Checks: Business→Software traceability (AGVFleetController realizes OrderFulfillment)
   → Identifies gap: Missing quality scenarios for scalability
   → Generates ADR-001: PostgreSQL for Fleet State Management
```

**Output:**
- Complete metamodel with all layers (B1-B2, S1-S4, Physical)
- arc42 documentation with all 12 sections populated
- Multiple views: Context, Container, Component, Deployment, Process flows
- Architecture Decision Records (ADRs)
- Quality scenarios and metrics

## Example 2: Multi-Layer Modeling (Automotive OTA)

**Scenario:** Document Over-the-Air update system for connected vehicles

**Workflow Execution:**
```
1. ResearchTopology workflow invoked
   → Domain: Automotive/Connected Vehicles
   → Pattern: Event-driven architecture for vehicle communication
   → Security pattern: Certificate-based authentication

2. Metamodel Creation
   → Business Layer: Connected Vehicle Portfolio (B1) → OTA Update System (B2)
   → Software Layer: Campaign Management (S2) → Components (S3) → API (S4)
   → Physical Layer: ECUs, TCU, Vehicle Network (CAN, Ethernet)
   → Cross-layer: OTA System realizes Software Updates Capability

3. ApplyVisualBestPractices workflow invoked
   → Creates views showing Business→Application→Technology layers
   → Deployment view: Cloud backend + Vehicle ECUs
   → Network diagram: CAN bus topology

4. QualityReview workflow invoked
   → Validates: ASIL levels properly assigned
   → Checks: Security measures documented
   → Gap analysis: Missing rollback procedure documentation
```

**Output:**
- System-of-Systems model: Cloud platform + 1M+ vehicles
- Multi-level decomposition: Portfolio → Product → System → Container → Component
- Safety and security considerations (ASIL, HSM, code signing)
- Integration patterns: OTA protocol, vehicle authentication

## Example 3: Visual Best Practices Application

**Scenario:** Create view showing application architecture with proper layout

**Workflow Execution:**
```
1. ApplyVisualBestPractices workflow invoked
   → Input: Existing metamodel with 20+ elements

2. Layout Rules Applied:
   → Gravity Principle: Business elements at top, Application middle, Technology bottom
   → Input-Output Flow: Left-to-right for process flows
   → Containment: Uses Composition relationships for nesting
   → Minimizes crossings: Groups related elements

3. View Generation:
   → System Context (S1): System centered, users/externals around
   → Container View (S2): Services grouped by domain
   → Component View (S3): Internal structure with clear boundaries

4. QualityReview workflow invoked
   → Validates: All relationships are valid per metamodel
   → Checks: No orphaned elements
   → Ensures: Views serve specific stakeholder needs
```

**Output:**
- Multiple views, each with <15 elements for readability
- Proper layer ordering and visual hierarchy
- Clear relationships with minimal crossing lines
- Stakeholder-appropriate detail levels

## Related References

- See `Workflows/ResearchTopology.md` for pattern selection
- See `Workflows/ApplyVisualBestPractices.md` for visual layout rules
- See `Workflows/QualityReview.md` for quality validation
- See `references/ArchitectureProcess.md` for process phases
