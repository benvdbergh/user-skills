# ApplyVisualBestPractices Workflow

The "Sandwich" Layout & Visual Communication workflow. In ArchiMate, the View is just as important as the model data. A messy diagram is useless for stakeholders.

## When to Use

- User requests: "create view", "update view", "layout diagram", "visual best practices"
- When creating or updating any ArchiMate view
- When user mentions diagram is "messy" or "hard to read"
- Before presenting architecture to stakeholders

## Workflow Process

### Step 1: Analyze View Requirements

**Action**: Understand what the view needs to communicate.

**Questions to Answer:**
- What is the view's purpose? (Current State, Future State, Migration Plan, etc.)
- Who is the audience? (Business stakeholders, Technical team, Executives)
- What relationships are most important to show?
- How many elements are involved?

**Output**: View purpose and audience statement

### Step 2: Apply the Gravity Principle

**Action**: Organize elements by ArchiMate layer using vertical positioning.

**Layout Rules:**

```
┌─────────────────────────────────┐
│   BUSINESS LAYER (Top)          │
│   - Business Actors             │
│   - Business Processes          │
│   - Business Functions          │
│   - Business Events             │
├─────────────────────────────────┤
│   APPLICATION LAYER (Middle)    │
│   - Application Components       │
│   - Application Functions        │
│   - Application Interfaces       │
│   - Data Objects                │
├─────────────────────────────────┤
│   TECHNOLOGY LAYER (Bottom)     │
│   - System Software             │
│   - Technology Services          │
│   - Devices                     │
│   - Infrastructure              │
└─────────────────────────────────┘
```

**Key Rules:**
- Always place Business elements at the **top**
- Application elements in the **middle**
- Technology elements at the **bottom**
- Use "Realization" relationships to point **upward** (Technology realizes Application, Application realizes Business)

**Output**: Layer-organized element list

### Step 3: Establish Input-Output Flow

**Action**: For behavioral diagrams (Processes/Functions), use left-to-right flow.

**Flow Rules:**
- **Inputs** (triggers, events, data sources) → **Left side**
- **Processing** (processes, functions, components) → **Center**
- **Outputs** (results, events, data sinks) → **Right side**

**Example Flow:**
```
[Business Event] → [Business Process] → [Application Component] → [Data Object]
     (Left)            (Center)              (Center)                (Right)
```

**Output**: Flow-ordered element arrangement

### Step 4: Use Containment Over Lines

**Action**: Prefer "nesting" (Composition) to reduce "spaghetti" lines.

**Containment Rules:**
- If an Application Component contains five functions, **place the functions inside the component box**
- Use Composition relationships for internal structure
- Use Serving relationships for external interactions
- Group related elements using Composition hierarchy

**Example:**
```
❌ Bad: 5 separate Application Functions with 5 lines to Component
✅ Good: Application Component box containing 5 nested Functions
```

**Output**: Containment hierarchy plan

### Step 5: Minimize Crossing Relationships

**Action**: Group related elements to minimize relationship line crossings.

**Grouping Strategy:**
1. Identify element clusters (elements that interact frequently)
2. Place clusters close together
3. Position clusters to minimize cross-cluster relationships
4. Use direct paths for relationships (avoid unnecessary curves)

**Rules:**
- Elements with many relationships should be central
- Related elements should be adjacent
- Cross-layer relationships should be vertical (following Gravity Principle)
- Same-layer relationships should be horizontal

**Output**: Grouped element layout plan

### Step 6: Enforce View Size Limits

**Action**: Ensure views are readable and not overcrowded.

**Size Rules:**
- **Maximum 15 elements per view** (including relationships)
- If more elements needed, create **multiple views**
- Use view hierarchy: Overview → Detail views
- Link related views through view relationships

**View Splitting Strategy:**
- Create "Overview" view with high-level elements
- Create "Detail" views for each major component
- Use consistent naming: "{Component} - Detail View"

**Output**: View structure (single or multiple views)

### Step 7: Apply Relationship Best Practices

**Action**: Use appropriate relationship types for clarity.

**Relationship Guidelines:**

| Relationship Type | Use For | Visual Clarity |
|------------------|---------|----------------|
| **Composition** | Internal structure, containment | Nesting, grouping |
| **Serving** | External interactions, dependencies | Clear service boundaries |
| **Realization** | Layer relationships | Upward arrows (Tech→App→Business) |
| **Flow** | Behavioral flow, data flow | Left-to-right for processes |
| **Access** | Data access | Clear data paths |
| **Assignment** | Responsibility assignment | Clear ownership |

**Output**: Relationship type mapping

### Step 8: Validate Visual Quality

**Action**: Review the layout before finalizing.

**Quality Checklist:**
- [ ] Gravity Principle applied (Business top, Tech bottom)
- [ ] Input-Output flow clear (left-to-right for processes)
- [ ] Containment used instead of excessive lines
- [ ] Crossing relationships minimized
- [ ] View size within limits (≤15 elements)
- [ ] Relationship types appropriate
- [ ] Elements grouped logically
- [ ] View is readable and professional

**Output**: Validated view ready for creation/update

## Integration with MCP Tools

When creating or updating views:
- Use MCP tools to create/update view elements
- Apply layout coordinates if supported
- Ensure element positioning follows this workflow's rules
- Create multiple views if element count exceeds limits

## Example Execution

```
User: "Create a view showing our e-commerce application architecture"

Step 1: Purpose = Show current application architecture to technical team
Step 2: Apply Gravity:
  - Top: Business Process "Process Order"
  - Middle: Application Components (Cart, Payment, Inventory)
  - Bottom: Technology Services (Database, API Gateway)
Step 3: Flow: Order Event → Process → Components → Data
Step 4: Nest Application Functions inside Components
Step 5: Group related components (Payment + Payment Service together)
Step 6: Split into 2 views (Overview + Payment Detail)
Step 7: Use Serving for external, Composition for internal
Step 8: Validate all checklist items
→ Create views using MCP tools
```

## Common Anti-Patterns to Avoid

❌ **Spaghetti Diagram**: Too many crossing lines
✅ **Solution**: Use containment and grouping

❌ **Flat Layout**: All elements at same level
✅ **Solution**: Apply Gravity Principle

❌ **Overcrowded View**: 30+ elements in one view
✅ **Solution**: Split into multiple views

❌ **Inconsistent Flow**: Random element placement
✅ **Solution**: Follow Input-Output flow rules

❌ **Wrong Relationships**: Using Access where Serving is appropriate
✅ **Solution**: Match relationship type to purpose

