# Deep Research Workflow

Complete orchestration workflow for multi-agent deep research. Follow these phases sequentially.

## Prerequisites

- User has submitted a research query
- Skill has been activated via trigger match

## Phase 1: Interactive Planning (The Architect)

The root agent analyzes the user's query and produces a research plan **before any searching begins**.

### Step 1.1: Query Decomposition

Analyze the user's query and decompose it:

1. **Extract the core research question** — what is the user ultimately trying to understand or decide?
2. **Identify sub-questions** — break the core question into 3-6 independent research branches
3. **Classify each branch**:
   - `[RESEARCH]` — requires data gathering from web sources
   - `[ANALYSIS]` — requires reasoning over gathered data (comparisons, trade-offs)
   - `[DELIVERABLE]` — requires producing a specific artifact (table, matrix, diagram description)
4. **Identify knowledge gaps** — what can NOT be answered from the agent's training data alone?
5. **Estimate complexity** — simple (2-3 branches, ~3 min), medium (4-5 branches, ~8 min), complex (6+ branches, ~15 min)

### Step 1.2: Generate Research Plan

Produce a structured plan using the template at `assets/research-plan-template.md`.

For each research branch, define:
- **Branch ID** and title
- **Classification** ([RESEARCH], [ANALYSIS], or [DELIVERABLE])
- **Key search queries** to start with (2-3 per branch)
- **Success criteria** — what constitutes sufficient coverage for this branch
- **Dependencies** — does this branch depend on another branch's output?

Group independent branches for parallel execution. Dependent branches execute sequentially after their prerequisites.

### Step 1.3: Present Plan for User Approval

Present the research plan to the user in a readable format. Include:
- Estimated duration
- Number of branches and their classifications
- The specific sub-questions being investigated

**Wait for user approval before proceeding.** Accept modifications if requested.

## Phase 2: Parallel Research Execution (The Engine Room)

### Step 2.1: Spawn Research Sub-Agents

For each independent research branch, spawn a Task sub-agent:

```
Task(
  subagent_type: "generalPurpose",
  prompt: [branch-specific prompt from agent-prompts.md],
  readonly: true  # sub-agents only gather, never write files
)
```

**Concurrency rules:**
- Spawn up to 4 sub-agents in a single message (Cursor limit)
- If more than 4 branches, batch them: first 4 in parallel, then next batch after completion
- Independent branches run in parallel; dependent branches wait for prerequisites

**Each sub-agent receives:**
1. The specific sub-question to investigate
2. Initial search queries to start with
3. Success criteria for the branch
4. The ReAct loop protocol (see Step 2.2)
5. Instructions to return structured findings with source URLs

### Step 2.2: ReAct Loop Protocol (Per Sub-Agent)

Each sub-agent follows this iterative cycle for its assigned branch:

```
REPEAT (max 5 hops):

  ASSESS:
    - What do I know so far about this sub-question?
    - What gaps remain?
    - Is the current direction productive?

  ACT (choose one):
    a) WebSearch — try a new or refined search query
    b) WebFetch — fetch full content from a promising URL
    c) CONCLUDE — sufficient data gathered, compile findings

  OBSERVE:
    - Read the new content
    - Extract relevant facts, data points, quotes
    - Track the source URL for citation

  REFINE:
    - If the result was a dead end → reformulate the search query
    - If conflicting data found → note the conflict for later resolution
    - If sufficient coverage → move to CONCLUDE

  CONDENSE (after hop 3):
    - Summarize all findings so far into a compact workspace
    - Discard low-value intermediate content
    - This preserves reasoning capacity for final hops
      and prevents context saturation

CONCLUDE:
  Return structured findings:
  - Key findings (list of factual claims with source URLs)
  - Data points (quantitative data with source attribution)
  - Conflicts detected (contradicting claims across sources)
  - Confidence level (high/medium/low based on source quality and agreement)
  - Sources consulted (full list of URLs visited)
```

**Dead-end recovery strategies:**
- Broaden the search query (remove specific terms)
- Try alternative terminology or synonyms
- Search for the topic from a different angle (e.g., academic vs. industry)
- Search for meta-analyses or review articles that aggregate the data

### Step 2.3: Collect Sub-Agent Results

As sub-agents complete, collect their structured findings. If a sub-agent fails or returns low-confidence results, note it for the re-research phase.

## Phase 3: Synthesis and Quality Control

### Step 3.1: Merge Findings

Aggregate findings from all branches into a unified research corpus:

1. **Group by theme** — organize findings by the original branch structure
2. **Deduplicate** — identify claims that appear across multiple branches
3. **Cross-reference** — link related findings from different branches

### Step 3.2: Conflict Resolution

For each detected conflict (e.g., Source A says "10%" while Source B says "12%"):

1. **Identify the discrepancy** — state both claims and their sources
2. **Seek a tiebreaker** — if a third source exists that resolves the conflict, use it
3. **Assess source authority** — prefer primary sources, official documentation, peer-reviewed data
4. **Report transparently** — if unresolvable, present both figures with sources and note the variance

### Step 3.3: Self-Critique (Pass/Fail Gate)

Grade the research against the original plan's success criteria:

| Section | Coverage | Grade | Action |
|---------|----------|-------|--------|
| Branch 1 | All criteria met | PASS | Include as-is |
| Branch 2 | Missing quantitative data | FAIL | Re-research |
| Branch 3 | Partial coverage | PASS (marginal) | Note limitations |

**Grading criteria per branch:**
- Are the success criteria from the plan met?
- Are claims supported by at least 2 independent sources?
- Are quantitative claims attributed to specific sources?
- Is the confidence level justified by the evidence?

### Step 3.4: Re-Research (If Needed)

For any branch that FAILED the self-critique:

1. Spawn a new Task sub-agent with a more targeted prompt
2. Focus specifically on the identified gap
3. Maximum 2 re-research cycles total (prevent infinite loops)
4. If still insufficient after 2 cycles, include the section with an explicit "Limited Data" caveat

### Step 3.5: Citation Mapping

Scan the entire report draft and ensure:

1. **Every factual claim** links to at least one source URL
2. **Every data point** links to its origin source
3. **Unattributed claims** are either:
   - Attributed to the agent's training data with a note
   - Removed if they cannot be verified
4. **Citation format**: inline numbered references `[1]` with a full citation appendix

## Phase 4: Report Generation and Delivery

### Step 4.1: Generate Structured Report

Use the template at `assets/report-template.md` to produce the final report. Fill all sections based on synthesized findings.

### Step 4.2: Executive Summary

Write a concise executive summary (200-400 words) that:
- Answers the user's original research question directly
- Highlights the 3-5 most important findings
- Notes any significant limitations or caveats
- Provides a strategic recommendation if appropriate

### Step 4.3: Confidence Ratings

Assign confidence ratings to each major section:

| Rating | Meaning |
|--------|---------|
| HIGH | 3+ independent sources agree, primary data available |
| MEDIUM | 2 sources agree, or authoritative single source |
| LOW | Single source, conflicting data, or inference-based |

### Step 4.4: Deliver Report

1. Present the full report to the user
2. Optionally write to disk if the user specifies an output path
3. Provide a brief summary of the research process:
   - Number of sources consulted
   - Number of search queries executed
   - Duration
   - Any notable limitations

## Orchestration Pseudocode

```
function deepResearch(userQuery):
    # Phase 1
    plan = decompose(userQuery)
    presentPlan(plan)
    approval = waitForUserApproval()

    if approval.hasModifications:
        plan = applyModifications(plan, approval)

    # Phase 2
    independentBranches = plan.branches.filter(b => !b.dependencies)
    dependentBranches = plan.branches.filter(b => b.dependencies)

    results = {}

    # Parallel execution (batches of 4)
    for batch in chunk(independentBranches, 4):
        batchResults = parallelExecute(batch)  # Task sub-agents
        results.merge(batchResults)

    # Sequential dependent branches
    for branch in topologicalSort(dependentBranches):
        result = executeWithContext(branch, results)
        results[branch.id] = result

    # Phase 3
    merged = mergeFindings(results)
    conflicts = detectConflicts(merged)
    resolved = resolveConflicts(conflicts)

    grade = selfCritique(resolved, plan.successCriteria)

    reResearchCount = 0
    while grade.hasFailures AND reResearchCount < 2:
        gapResults = reResearch(grade.failures)
        resolved.merge(gapResults)
        grade = selfCritique(resolved, plan.successCriteria)
        reResearchCount++

    cited = mapCitations(resolved)

    # Phase 4
    report = generateReport(cited, plan, userQuery)
    deliver(report)
```

## Error Handling

| Error | Recovery |
|-------|----------|
| Sub-agent timeout | Skip branch, note as "Research Incomplete" in report |
| WebSearch rate limit | Back off, retry with fewer concurrent agents |
| No results for query | Broaden search terms, try alternative angles |
| All branches fail | Present partial findings with clear limitations noted |
| User cancels mid-research | Present whatever findings are available so far |
