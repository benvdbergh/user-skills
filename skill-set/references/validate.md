# Validate Workflow

Deep content-level validation of a skill's effectiveness as an LLM instruction set. Evaluates whether the skill will make the agent perform at its highest potential by combining structural compliance (skill-set standards), prompt engineering quality (prompting skill standards), and ecosystem fitness analysis.

**Complementary to lint:** Lint checks structure and formatting. Validate checks whether the skill *works well* as an instruction set for an LLM agent.

## When to Use

- User requests: "validate skill", "review skill quality", "is this skill effective?", "deep review skill"
- After creating or significantly modifying a skill
- Periodic quality audits of the skill library
- When a skill seems to underperform or behaves unexpectedly
- When questioning whether something should be a skill at all

## Prerequisites

Before running this workflow:
1. Run the lint workflow on the target skill first (or confirm it has been run recently).
2. Read the target skill's `SKILL.md` and all referenced files
3. Read `$PAI_DIR/skills/prompting/references/standards.md` for prompt engineering criteria
4. List all skills in `$PAI_DIR/skills/` and `$CURSOR_DIR/skills-cursor/` to understand the ecosystem

## Validation Dimensions

The validate workflow evaluates five dimensions:

| Dimension | Focus | Weight |
|-----------|-------|--------|
| **Instruction Quality** | Clarity, precision, and efficiency of LLM instructions | 30% |
| **Token Economics** | Signal-to-noise ratio, redundancy, context budget impact | 20% |
| **Tool & Context Fitness** | Correct tool usage, sufficient context, proper references | 20% |
| **Prompt Engineering Compliance** | Alignment with Claude 4.x best practices and empirical standards | 15% |
| **Ecosystem Fitness** | Skill necessity, scope, overlap, composability | 15% |

---

## Workflow Steps

### Phase 1: Skill Intent Analysis

1. **Identify the Skill's Job**

   Before evaluating anything, define what the skill is trying to accomplish:

   - **Primary job**: What single outcome does this skill enable?
   - **Target user intent**: What does the user say to trigger this?
   - **Success criteria**: How do you know the skill worked?
   - **Skill category**: Document/Asset Creation, Workflow Automation, or MCP Enhancement?

   Write a one-sentence job statement:
   > "This skill enables [agent] to [do what] when [user says what], producing [what outcome]."

   If you cannot write this sentence clearly, the skill likely has a scope or clarity problem.

2. **Assess Skill Necessity**

   Answer these gatekeeping questions:

   | Question | If YES | If NO |
   |----------|--------|-------|
   | Does this require multi-step orchestration? | Skill is appropriate | Could be a simple prompt |
   | Does this encode reusable procedural knowledge? | Skill is appropriate | Could be a one-off instruction |
   | Does the agent need context it doesn't already have? | Skill is appropriate | Skill may be unnecessary |
   | Would a user need to repeat this instruction across sessions? | Skill is appropriate | Inline prompt may suffice |
   | Does this coordinate multiple tools or references? | Skill is appropriate | Single tool call may suffice |

   If 3+ answers are NO, flag: **"Consider whether this should be a skill or a prompt/instruction."**

3. **Prior Art & Industry Benchmark**

   Before judging the skill's internal quality, research how the broader community and industry approach the same problem. This calibrates the evaluation and surfaces gaps invisible from internal analysis alone.

   Conduct 2-3 targeted web searches using the WebSearch tool:
   - `"{skill domain} agent skill best practices"` — find similar skills and community patterns
   - `"{skill domain} workflow automation"` — find established domain conventions
   - `"Claude skill {domain}"` or `"AI agent {domain} patterns"` — find ecosystem examples

   For each relevant finding, assess:

   | Source | Pattern/Practice | Skill Aligns? | Gap or Innovation? |
   |--------|-----------------|---------------|-------------------|
   | {URL or name} | {pattern description} | Yes/Partial/No | {what the skill is missing or doing better} |

   Classify findings:
   - **Adopted patterns**: Industry practices the skill already follows (validates the approach)
   - **Missed patterns**: Established practices the skill lacks (feeds into recommendations)
   - **Innovations**: Approaches the skill uses that go beyond what others do (positive differentiation)

   Summarize as a compact "Benchmark Summary" (max ~200 words) to reference in later phases.

   If no relevant prior art exists, note "Novel domain — no external benchmark available" and proceed with internal-only evaluation.

   > **Scope guard:** This is targeted benchmarking, not deep research. For comprehensive domain analysis, compose with the research-analysis skill.

### Phase 2: Instruction Quality Analysis

4. **Clarity and Precision Audit**

   For each instruction block in the skill, evaluate:

   | # | Check | Pass Criteria | Severity |
   |---|-------|---------------|----------|
   | IQ1 | Imperative voice | Instructions use direct imperatives ("Do X") not suggestions ("You could try X") | WARNING |
   | IQ2 | Actionable steps | Each step describes a concrete action, not an abstract concept | ERROR |
   | IQ3 | Unambiguous language | No instructions that could be interpreted two different ways | ERROR |
   | IQ4 | Appropriate freedom | Freedom level matches task fragility (high/medium/low) | WARNING |
   | IQ5 | Positive framing | Instructions tell what TO do, not just what NOT to do | WARNING |
   | IQ6 | Context motivation | Key instructions explain WHY, not just WHAT | INFO |
   | IQ7 | Success/failure defined | Clear criteria for what constitutes completion | WARNING |
   | IQ8 | No assumed knowledge gaps | Doesn't assume the LLM knows domain-specific conventions it likely doesn't | ERROR |

5. **Workflow Coherence Check**

   | # | Check | Pass Criteria | Severity |
   |---|-------|---------------|----------|
   | WC1 | Logical step ordering | Steps follow a natural dependency chain | ERROR |
   | WC2 | No dead-end paths | Every conditional branch has a resolution | ERROR |
   | WC3 | Feedback loops present | Complex workflows include validation/retry patterns | WARNING |
   | WC4 | Entry point clarity | Clear where execution begins for each use case | ERROR |
   | WC5 | Completion signal | Agent knows when the workflow is done | WARNING |

### Phase 3: Token Economics Analysis

6. **Signal-to-Noise Ratio Assessment**

   Apply the context engineering principle: find the smallest set of high-signal tokens that maximize desired outcomes.

   | # | Check | Pass Criteria | Severity |
   |---|-------|---------------|----------|
   | TE1 | No redundant paragraphs | No two sections convey the same information | ERROR |
   | TE2 | No explanations of common knowledge | Doesn't explain concepts the LLM already knows | WARNING |
   | TE3 | Justified token cost | Every paragraph passes: "Does this justify its token cost?" | WARNING |
   | TE4 | SKILL.md body size | Under ~5,000 words; detailed content pushed to references/ | WARNING |
   | TE5 | Reference file sizing | Individual reference files under ~3,000 words | INFO |
   | TE6 | Progressive disclosure used | Only loads what's needed at each level (metadata → body → references) | ERROR |
   | TE7 | No over-documentation | Focused modules (2-3) outperform comprehensive docs | WARNING |

   **Research insight (SkillsBench 2026):** Skills with 2-3 focused modules outperform comprehensive documentation. Comprehensive skills showed -2.9pp negative performance delta. Detailed and compact formats (+18.8pp and +17.1pp respectively) vastly outperform comprehensive ones.

7. **Duplication Scan**

   Search for:
   - Repeated instructions across SKILL.md and reference files
   - Information stated in both the description and the body
   - Examples that repeat what instructions already say without adding value
   - Workflow steps that overlap with other workflow steps

   For each duplicate found, recommend: keep the most concise version, remove the rest.

### Phase 4: Tool & Context Fitness

8. **Tool Usage Validation**

   | # | Check | Pass Criteria | Severity |
   |---|-------|---------------|----------|
   | TF1 | Tools referenced for interactive tasks | Any task requiring external action maps to a tool | ERROR |
   | TF2 | Soft tool language | Uses "Use tool when..." not "MUST use tool" or "CRITICAL: use tool" | WARNING |
   | TF3 | Tool parameters documented | Required parameters are specified or discoverable | WARNING |
   | TF4 | Error handling for tools | Tool failures have documented recovery paths | INFO |
   | TF5 | MCP tools verified | Documented MCP tools exist and are accessible | ERROR |
   | TF6 | No hallucinated tools | All referenced tools are real and available | CRITICAL |

9. **Context Sufficiency Check**

   | # | Check | Pass Criteria | Severity |
   |---|-------|---------------|----------|
   | CS1 | Required context provided | All domain-specific knowledge needed is included or referenced | ERROR |
   | CS2 | References are reachable | All file references point to existing, readable files | ERROR |
   | CS3 | Reference depth | References are max one level deep from SKILL.md | WARNING |
   | CS4 | External dependencies documented | Any required external setup (APIs, DBs, services) is noted | WARNING |
   | CS5 | No orphaned references | No files in the skill directory that are never referenced | INFO |

### Phase 5: Prompt Engineering Compliance

10. **Claude 4.x Best Practices Audit**

   Cross-reference with `$PAI_DIR/skills/prompting/references/standards.md`:

   | # | Check | Pass Criteria | Severity |
   |---|-------|---------------|----------|
   | PE1 | Markdown-only structure | No XML tags used for structure (use markdown headers) | CRITICAL |
   | PE2 | Example quality | 1-3 examples present; examples match desired output exactly | WARNING |
   | PE3 | No example overload | Not more than 3 examples per workflow (diminishing returns) | INFO |
   | PE4 | No aggressive tool language | No "CRITICAL: MUST use", "ALWAYS call" patterns | WARNING |
   | PE5 | Extended thinking safe | Avoids "think about" when extended thinking may be disabled; uses "consider", "evaluate" | INFO |
   | PE6 | Third-person description | Description uses third person, not "I" or "You" | WARNING |
   | PE7 | Consistent terminology | Same concept uses same term throughout | WARNING |
   | PE8 | No time-sensitive content | No "before/after [date]" instructions that will become stale | WARNING |
   | PE9 | Action bias specified | Clear whether skill is implementation-oriented or research-oriented | INFO |

11. **Degree of Freedom Assessment**

    Evaluate whether the skill's instruction specificity matches its task type:

    | Task Fragility | Expected Freedom | Instruction Style |
    |----------------|-----------------|-------------------|
    | High (exact sequences matter) | Low | Specific scripts, exact commands, no parameters |
    | Medium (preferred patterns exist) | Medium | Pseudocode with parameters, configurable |
    | Low (multiple valid approaches) | High | Text-based heuristics, trust agent judgment |

    Flag mismatches:
    - **Over-constrained**: Low freedom for heuristic tasks wastes the LLM's capabilities
    - **Under-constrained**: High freedom for fragile operations risks inconsistent results

### Phase 6: Ecosystem Fitness

12. **Skill Overlap Analysis**

    Compare the target skill against ALL other skills in the ecosystem:

    - List all skills from `$PAI_DIR/skills/` and `$CURSOR_DIR/skills-cursor/`
    - For each skill, compare:
      - **Trigger overlap**: Do multiple skills match the same user intents?
      - **Capability overlap**: Do multiple skills perform similar actions?
      - **Tool overlap**: Do multiple skills use the same MCP tools for similar purposes?

    Flag:
    - **Redundant skills**: >50% trigger overlap with another skill
    - **Composability opportunity**: Two skills that could share a reference file
    - **Triggering conflict**: Ambiguous user intents that could match multiple skills

13. **Scope Assessment**

    | # | Check | Evaluation |
    |---|-------|------------|
    | SA1 | Single responsibility | Does the skill do ONE job well, or try to do too many things? |
    | SA2 | Decomposability | Can the skill be split into 2+ smaller, reusable skills? |
    | SA3 | Scope creep | Does the skill contain instructions unrelated to its stated job? |
    | SA4 | Module count | Does the skill use 2-3 focused modules (optimal) vs. 4+ (diminishing returns)? |
    | SA5 | Reusability | Could parts of this skill be extracted into a shared reference? |

    **Research insight (SkillsBench 2026):** Tasks with 2-3 skills show +18.6pp improvement; 4+ skills drop to +5.9pp. Smaller, focused skills composed together outperform monolithic comprehensive skills.

14. **External Benchmark Assessment**

    Using the findings from step 3 (Prior Art & Industry Benchmark), evaluate:

    | # | Check | Pass Criteria | Severity |
    |---|-------|---------------|----------|
    | EB1 | Prior art considered | Skill design reflects awareness of existing solutions and community patterns (or documents why it diverges) | WARNING |
    | EB2 | No inferior reinvention | Skill does not replicate established patterns in a less effective way without justification | ERROR |

    Flag:
    - **Missed industry pattern**: An established practice exists that the skill ignores without reason
    - **Justified divergence**: The skill intentionally differs from common patterns (document why)
    - **Novel contribution**: The skill introduces an approach not found in prior art (positive signal)

15. **Skill vs. Prompt Decision**

    Apply this decision matrix:

    ```
    Is it reused across multiple sessions?
    ├── NO → Consider inline prompt
    └── YES
        Does it require multi-step orchestration?
        ├── NO → Consider a .cursor/rules/ rule or CLAUDE.md entry
        └── YES
            Does it encode domain knowledge the LLM lacks?
            ├── NO → Consider simplifying to a rule
            └── YES → Skill is the right abstraction
    ```

    If the conclusion is "not a skill", recommend the appropriate alternative.

---

## Scoring

### Per-Dimension Scoring

Each dimension is scored independently (0-100), then weighted:

| Severity | Point Deduction |
|----------|----------------|
| CRITICAL | -25 per issue |
| ERROR | -15 per issue |
| WARNING | -5 per issue |
| INFO | 0 (noted only) |

Starting score per dimension: 100. Minimum: 0.

### Aggregate Score

```
Total = (IQ × 0.30) + (TE × 0.20) + (TF × 0.20) + (PE × 0.15) + (EF × 0.15)
```

Where:
- IQ = Instruction Quality score
- TE = Token Economics score
- TF = Tool & Context Fitness score
- PE = Prompt Engineering Compliance score
- EF = Ecosystem Fitness score

### Effectiveness Levels

| Score | Level | Meaning |
|-------|-------|---------|
| 90-100 | Excellent | Skill is optimally tuned for LLM performance |
| 75-89 | Good | Minor improvements possible, skill is effective |
| 60-74 | Needs Work | Notable issues that likely impact agent performance |
| 40-59 | Poor | Significant problems; skill may cause confusion or waste tokens |
| Below 40 | Redesign | Fundamental issues; consider rewriting or reclassifying |

---

## Output Format

Generate a structured validation report:

```markdown
## Validation Report: {skill-name}

**Effectiveness Score: {score}/100** ({level})
**Job Statement:** "{one-sentence job statement}"
**Skill Necessity:** {Confirmed / Questionable — consider [alternative]}

### Dimension Scores

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| Instruction Quality | {score}/100 | {one-line summary} |
| Token Economics | {score}/100 | {one-line summary} |
| Tool & Context Fitness | {score}/100 | {one-line summary} |
| Prompt Engineering | {score}/100 | {one-line summary} |
| Ecosystem Fitness | {score}/100 | {one-line summary} |

### Critical Issues
{List of CRITICAL severity findings — fix these first}

### Improvement Recommendations

#### High Impact (fix these for biggest performance gain)
1. {Specific, actionable recommendation with before/after example}
2. {Next recommendation}

#### Medium Impact
1. {Recommendation}

#### Low Impact / Nice to Have
1. {Recommendation}

### Ecosystem Notes
- **Overlap with:** {list any overlapping skills}
- **Composability:** {suggestions for shared references}
- **Scope:** {assessment — right-sized / too broad / too narrow}

### Token Budget Analysis
- **SKILL.md size:** {word count} words ({assessment})
- **Total skill size:** {total words across all files}
- **Progressive disclosure:** {Proper / Needs improvement}
- **Estimated context cost:** {Low / Medium / High} relative to value delivered
```

## Relationship to Other Workflows

| Workflow | Relationship |
|----------|-------------|
| **lint** | Run lint FIRST for structural compliance, then validate for content quality |
| **optimize** | Validate identifies WHAT to improve; optimize applies specific fixes from user feedback |
| **synthesize** | Run validate after synthesize to verify the new skill is effective |
| **canonicalize** | Run validate after canonicalize to ensure migration preserved quality |

## Quick Checklist

For a rapid assessment without the full workflow:

```
[ ] Can you write a clear one-sentence job statement?
[ ] Have you searched for prior art and industry patterns?
[ ] Does every instruction justify its token cost?
[ ] Are there 1-3 focused examples (not 0, not 5+)?
[ ] Does the skill use positive framing ("do X" not "don't do Y")?
[ ] Is the description third-person with clear triggers?
[ ] Are tools referenced with soft language?
[ ] Is SKILL.md under 5,000 words with details in references/?
[ ] Does this skill do ONE job, not three?
[ ] Would 2-3 users trigger this with the same intent phrase?
[ ] Does this need to be a skill (vs. a rule or inline prompt)?
```
