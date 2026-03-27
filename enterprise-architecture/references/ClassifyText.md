# ClassifyText Workflow

**Purpose:** Classify unstructured text using consulting framework lenses to understand what domain of enterprise knowledge it represents, and define the scope of the operation.

## When to Use

- Analyzing unstructured text (notes, interviews, workshop outputs, strategy documents)
- Determining what kind of changes are allowed and needed
- First step in the text-to-model pipeline

## The Workflow

### Step 1: Define Operation Scope

Analyze the text to determine the scope:

- The breadth of content
- Whether it covers multiple entities or a single entity
- Whether it represents a major change or minor adjustment
- The relationship to existing model state (if known)

#### Scope Types

**1. Complete Re-do of a Section**
- Comprehensive rewrite or major update of a domain area
- Multiple entities and relationships affected
- Allowed: Create, update, replace, restructure, remove entities
- Indicators: "restructuring", "complete overhaul", "new strategy changes how we think about..."

**2. Small Adjustment Across Multiple Elements**
- Incremental updates to existing model
- Multiple entities touched but not restructured
- Allowed: Add new entities, update descriptions/attributes, add relationships, refine confidence/maturity
- Not allowed: Major structural changes, removing core entities
- Indicators: "adding a few new capabilities", "some updates", "refining with additional details"

**3. Single Element or Relationship Adjustment**
- Focused change to one entity or relationship
- Minimal impact on rest of model
- Allowed: Update single entity attributes, add/modify one relationship
- Not allowed: Creating multiple new entities, restructuring
- Indicators: "now owns", "updating the description of", "add a relationship between"

### Step 2: Classify Through Domain Lenses

Analyze the text through these consulting frameworks:

1. **Strategy** - StrategyObjectives, CourseOfActions, Drivers (ArchiMate Strategy/Motivation Layers)
2. **Operating Model** - BusinessFunctions, BusinessProcesses, BusinessActors (ArchiMate Business Layer)
3. **Capability** - BusinessFunctions/BusinessCapabilities and maturity (ArchiMate Business Layer)
4. **Process** - BusinessProcesses and workflows (ArchiMate Business Layer)
5. **Product** - Products and BusinessServices (ArchiMate Business Layer)
6. **Organization** - BusinessActors, BusinessRoles, reporting relationships (ArchiMate Business Layer)

### Step 3: Produce Classification Output

#### Scope Analysis (First)
1. **Operation Scope**: `complete-redo` | `small-adjustment` | `single-element`
2. **Scope Reasoning**: Why this scope was chosen
3. **Affected Areas**: What parts of the model will be impacted
4. **Allowed Changes**: What types of changes are permitted
5. **Needed Changes**: What specific changes are required

#### Domain Classification (Second)
1. **Primary Domain**: The single most relevant lens (required)
2. **Secondary Domains**: Additional relevant lenses (optional)
3. **Classification Reasoning**: Brief explanation
4. **Key Topics**: Main topics or themes identified
5. **Confidence**: `low`, `medium`, or `high`

#### Change Guidance (Third)
1. **Recommended Approach**: How to proceed with extraction/updates
2. **Change Constraints**: What should NOT be changed
3. **Validation Priorities**: What needs human review first

## Guidelines

- When in doubt, choose smaller scope
- Consider existing model state when scoping
- Use ArchiMate terminology aligned with consulting frameworks
- Map consulting concepts to ArchiMate entity types (org units -> BusinessActor, initiatives -> CourseOfAction)
- Respect scope constraints in subsequent workflows
- Document scope decisions to help humans understand change proposals

## Next Step

After classification, proceed to `references/ExtractEntities.md` for entity extraction.
