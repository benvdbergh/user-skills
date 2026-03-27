# Modeling Approaches by Domain

## Business Domain Modeling

**Purpose:** Capture strategic intent, capabilities, and business processes

**Key Element Types:**
- Portfolio
- Product
- Capability
- Process
- Stakeholder
- Goal
- Requirement

**Modeling Approach:**

**Level B1 (Portfolio/Organization):**
- Capability maps showing what the organization can do
- Product portfolio showing offerings
- Value streams showing how value is created
- Strategic goals and their relationships

**Level B2 (Product):**
- Product features and capabilities
- Supported business processes
- Key requirements and constraints
- Target customer segments

**BPMN-lite for Process Flows:**

Use simplified BPMN with:
- **Activities** (rectangles): Work to be done
- **Gateways** (diamonds): Decisions or parallel flows
- **Events** (circles): Start, end, intermediate events
- **Sequence Flows** (arrows): Order of execution
- **Pools/Lanes** (optional): Organizational boundaries

Avoid BPMN complexity like:
- Message flows (use simple arrows with labels)
- Complex event types (stick to start/end/timer)
- Subprocesses (flatten or create separate diagrams)

## Software Architecture Modeling (C4)

### Level S1: System Context

**Purpose:** Show the big picture - how your system fits into the world

**Elements:**
- Your system (one box)
- People who use it (users, personas)
- External systems it interacts with

**Relationships:**
- Uses
- Sends data to
- Receives data from

### Level S2: Container

**Purpose:** Show the high-level technology landscape

**Elements:**
- Web applications
- Mobile apps
- Server-side applications
- Databases
- File systems
- Message brokers

**Relationships:**
- Makes API calls to
- Reads from / writes to
- Subscribes to / publishes to

### Level S3: Component

**Purpose:** Show major building blocks inside each container

**Elements:**
- Components (groups of related functionality)
- Their responsibilities
- Their dependencies

### Level S4: Code/Interface (API)

**Purpose:** Document detailed interfaces for integration

**Elements:**
- API endpoints
- Message schemas
- Data structures
- Interface contracts

## Physical/Technology Domain Modeling

**Purpose:** Capture hardware, infrastructure, and deployment

**Key Element Types:**
- Server/Computer
- Network
- Physical Device
- Sensor/Actuator
- Facility/Location
- Communication Protocol

## Related References

- See `Core/DocumentationFramework.md` for zoom level strategy
- See `Examples/` for domain-specific examples
- See `Reference/ViewGenerationAlgorithms.md` for view generation
