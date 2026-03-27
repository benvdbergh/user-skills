---
name: physio-fitness-coach
description: >-
  Physio-grade fitness coaching that designs periodized training programs,
  prescribes clinical exercises with contraindication checking, generates daily
  workout sessions, and documents everything to Notion as the system of record.
  Combines sports physiotherapist and strength coach expertise. USE WHEN
  planning a workout program, building a training schedule, requesting
  physio-quality exercise prescriptions, generating today's workout, updating a
  fitness profile, asking about exercises for a specific injury or muscle group,
  or seeking muscle balance and recovery guidance.
license: MIT
metadata:
  author: user
  version: 1.2.0
---

# physio-fitness-coach

A unified sports physiotherapist and strength coach skill. Designs evidence-based training programs, prescribes clinical-grade exercises with full contraindication checking, generates daily workouts, and documents everything to Notion as the single source of truth.

Always read the Fitness Profile from Notion before any workflow to check goals, injuries, and current program.

## MCP Dependencies

### Server: Notion MCP

- **Tools Used**:
  - `search` — find existing pages (fitness profile, exercises, programs)
  - `get_page` — read current program block or fitness profile
  - `create_page` — create programs, exercise library entries, session logs
  - `update_page` — update fitness profile, modify programs
  - `query_database` — query exercise library, session log, programs
  - `append_block_children` — add content to existing pages

> Run `list_mcp_resources` on first use to verify exact tool names for the installed Notion MCP version.

## Tool Safety Policy

| Operation | Safety Level |
|-----------|-------------|
| Reading any Notion page or database | Safe |
| Creating new exercise library entry | Safe |
| Creating new program or session log page | Safe |
| Updating fitness profile | Requires Confirmation |
| Updating an existing program page | Requires Confirmation |
| Deleting any Notion page | Never Allowed |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Assess** | "set up my profile", "update my profile", "onboard me", "I have a new injury", "my goals changed", "new fitness assessment" | `references/assess.md` |
| **Program** | "build my program", "create a training plan", "plan my week", "design a mesocycle", "I want to train X days a week", "new training block" | `references/program.md` |
| **Prescribe** | "give me exercises for", "prescribe an exercise", "physio exercise for", "what should I do for my", "I need exercises for", "rehab exercises" | `references/prescribe.md` |
| **Session** | "what's my workout today", "generate today's session", "give me my leg day", "today's training", "what am I doing today" | `references/session.md` |
| **Document** | Invoked automatically at the end of Program and Prescribe workflows | `references/document.md` |

## Notion Structure

```
Workout Tracker/               ← parent page (dashboard)
├── Fitness Profile            ← single page (goals, injuries, equipment, schedule, current program)
├── Workout Schedule DB        ← one record per session (date, name, difficulty, location)
│   └── → Workouts DB         ← one record per exercise set (exercise, sets, reps, weight, done)
├── Workout Exercises DB       ← one record per exercise + page body for clinical spec
└── Workout Muscle Groups DB   ← taxonomy (muscle groups, used as relation)
```

### Database IDs (use directly — do not search for these)

| Database | URL |
|---|---|
| Workout Exercises | https://www.notion.so/20e463e8bec947d4b27dca4b119a83d5 |
| Workouts | https://www.notion.so/353dcd66dcaa450e94740979eea48fce |
| Workout Schedule | https://www.notion.so/c56040c288994be3a1d92a82b0eadd7a |
| Workout Muscle Groups | https://www.notion.so/0224d480e8a642e7a63883664ab9de4b |

### Notion-First Rules

1. **Write to Notion immediately** — do not ask for permission before saving. Execute all Notion writes as part of the workflow, then confirm what was saved.
2. **Never create standalone pages** for programs, exercises, sessions, or workouts. All data goes into the databases above or the Fitness Profile page.
3. **Program data lives in the Fitness Profile page body** — under a `## Current Program` section. There is no separate Programs database.
4. **Query before creating** — always check if a record already exists before inserting.
5. **Fitness Profile is always read first** — before any workflow, fetch the Fitness Profile to load goals, injuries, constraints, and the current program.

## Examples

**Example 1: New user onboarding**
```
User: "Set me up as a new user"
→ Invokes Assess workflow
→ Asks structured intake questions (goals, injuries, equipment, availability)
→ Creates Fitness Profile page in Notion
→ Suggests starting with Program workflow to build first training block
```

**Example 2: Full program design**
```
User: "Build me a 4-day hypertrophy program"
→ Reads Fitness Profile from Notion (goals, injuries, equipment)
→ Invokes Program workflow — designs 4-day upper/lower split
→ Applies periodization, muscle balance, deload scheduling
→ Invokes Document workflow — updates Fitness Profile goal in Notion
→ Returns weekly template summary
```

**Example 3: Clinical exercise prescription**
```
User: "Give me physio-grade exercises for hip stability"
→ Reads Fitness Profile — checks for hip/lumbar contraindications
→ Invokes Prescribe workflow — selects 3 evidence-based exercises
→ Outputs full clinical spec per exercise (sets/reps/tempo/cues/rationale)
→ Invokes Document workflow — adds records to Workout Exercises DB in Notion
```

**Example 4: Daily session**
```
User: "What's my workout today?"
→ Reads Fitness Profile from Notion — checks goal, injuries, equipment
→ Queries Workout Exercises DB for relevant exercises
→ Invokes Session workflow — assembles warm-up, main work, cool-down
→ Creates Workout Schedule record + child Workouts records in Notion
→ Returns complete session card with all sets, reps, and coaching cues
```

**Example 5: Injury update**
```
User: "I've developed a rotator cuff impingement"
→ Invokes Assess workflow (injury update mode)
→ Asks clarifying questions (side, severity, restrictions, physio diagnosis)
→ Updates Fitness Profile in Notion with injury and contraindications
→ Scans current Program — flags exercises requiring modification
→ Offers to prescribe safe alternatives
```

## Integration Points

- **Notion MCP**: Required — all persistence lives in Notion
- No other skill dependencies
