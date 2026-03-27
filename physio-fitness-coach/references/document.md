# Document Workflow

Handles all Notion read/write operations for the physio-fitness-coach skill. Called automatically at the end of Program, Prescribe, Session, and Assess workflows.

> **Notion-First Rule:** Write to Notion immediately as part of every workflow. Do not ask for permission before saving. Confirm what was saved after completion.

## Notion Database Reference

All data lives inside the **Workout Tracker** parent page. Use these IDs directly — do not search for them.

| Database | URL |
|---|---|
| Workout Exercises | https://www.notion.so/20e463e8bec947d4b27dca4b119a83d5 |
| Workouts | https://www.notion.so/353dcd66dcaa450e94740979eea48fce |
| Workout Schedule | https://www.notion.so/c56040c288994be3a1d92a82b0eadd7a |
| Workout Muscle Groups | https://www.notion.so/0224d480e8a642e7a63883664ab9de4b |

**Fitness Profile** is a single page — search for it by title "Fitness Profile" on first use and cache the page ID.

## Database Schemas

### Workout Exercises
| Property | Type | Notes |
|---|---|---|
| Name | title | Exercise name — used for deduplication |
| Type | select | Endurance / Flexibility / Strength / Cardio |
| Muscle Group | relation | → Workout Muscle Groups DB |
| Workout Schedules | relation | → Workout Schedule DB (auto-populated) |

Clinical spec (setup cues, contraindications, progressions, rationale) lives in the **page body** of each record.

### Workout Schedule
| Property | Type | Notes |
|---|---|---|
| Name | title | Training day name (e.g. "Lower Body Pull") |
| Date | date | Session date |
| Time | text | Optional planned time |
| Location | text | Optional (gym, home, etc.) |
| Difficulty | select | Hard / Medium / Low |
| Workouts | relation | → Workouts DB (child sets) |

### Workouts
| Property | Type | Notes |
|---|---|---|
| Sets | title | Used as the record label (e.g. "4×8") |
| Exercise | relation | → Workout Exercises DB |
| Workout Schedule | relation | → Workout Schedule DB (parent session) |
| Reps | number | |
| Weight | number | kg |
| Rest | text | e.g. "90s" |
| Duration | text | For timed sets |
| Done | checkbox | Mark complete during session |

### Workout Muscle Groups
| Property | Type | Notes |
|---|---|---|
| Name | title | e.g. "Glutes", "Posterior Chain" |
| Type | select | Full body / Lower body / Upper body |
| Exercises | relation | → Workout Exercises DB (auto-populated) |

## MCP Tool Usage

Run `list_mcp_resources` if tool names are unknown.

| Operation | Tool | Key Parameters |
|---|---|---|
| Query a database for existing records | `notion-search` or `notion-fetch` on collection ID | query: record title |
| Read a page or database schema | `notion-fetch` | id: page/database URL or collection ID |
| Create a new database record | `notion-create-pages` | parent: database URL, properties, content |
| Update a database record or page | `notion-update-page` | page_id, properties or content blocks |
| Add blocks to a page body | `notion-update-page` | page_id, append content |

## Page Creation Rules

1. **Query before creating** — always query the database for a matching record by Name before creating a new one
2. **Confirm before overwriting** — if a matching record exists, ask the user whether to update it or create a new entry
3. **Never delete** — do not call any delete operation on Notion pages or records

## Program Storage (Fitness Profile — Current Program Section)

**There is no Programs database. Program data lives inside the Fitness Profile page body.**

When a Program workflow completes, immediately:

1. Fetch the Fitness Profile page (search for title "Fitness Profile")
2. Replace or append a `## Current Program` section in the page body using the template in `assets/notion-templates.md` — Current Program Section
3. For each exercise in the program: add to Workout Exercises DB (see Exercise Library section below)
4. **Do NOT create Workout Schedule or Workouts records** — those are only created when generating an actual session

> Workout Schedule + Workouts records are session-level. They are created in the Session workflow when a user requests today's workout — not at program design time.

## Fitness Profile Page

**Title:** "Fitness Profile"
**Type:** Single page (not a database record)

**When to update:**
- After any Assess workflow
- When user reports a new injury mid-conversation
- When user's goal changes

**Fields:** See template in `assets/notion-templates.md` — Fitness Profile section. No "Current Program" field — goal is captured in the Goals section.

## Exercise Library (Workout Exercises DB)

**One database record per exercise.**

**When to create:** End of Prescribe workflow, one record per new exercise.

**Steps:**
1. Search/query Workout Exercises DB by Name
2. If record exists → ask user whether to update the page body or skip
3. If no match → create a new record with Name, Type, and Muscle Group relation
4. Write clinical spec (setup, cues, contraindications, progressions, rationale) into the record's **page body**

**Deduplication:** Match on exact Name. Case-insensitive. Do not create duplicates.

## Session Log (Workout Schedule DB + Workouts DB)

**One Workout Schedule record per session. One Workouts record per exercise set.**

**Steps:**
1. **Draft at session start** — create a Workout Schedule record (Name = training day, Date = today, Difficulty = estimated)
2. **Create Workouts records** — one per exercise, linked to the Workout Schedule record via the relation property. Set Sets label (e.g. "4×8"), Reps, Weight, Rest, and Exercise relation.
3. **Update during/after session** — tick Done checkboxes on completed Workouts records; update Weight/Reps if actuals differ from plan

**Naming:** Training day name only (e.g. "Lower Body Pull", "Upper Push", "Full Body"). No date prefix — Date property handles that.

## Error Handling

| Situation | Action |
|---|---|
| Notion MCP not available | Inform user, offer to output formatted text for manual entry |
| Record not found | Create the record; confirm Name with user if ambiguous |
| Permission error | Ask user to check Notion MCP integration and Workout Tracker sharing settings |
| Duplicate found | Ask user whether to update existing or create new entry |
| Network timeout | Retry once; if still failing, output content as text and inform user |

## Fallback: Manual Copy-Paste Mode

If Notion MCP is unavailable, format output as structured text the user can paste into Notion manually:

```
[Notion-formatted output — copy and paste into the appropriate database]

Database: Workout Exercises
Name: [Exercise Name]
Type: [Strength / Endurance / Flexibility / Cardio]
Muscle Group: [group name]

--- Page Body ---
## Setup & Position
...
## Execution Cues
...
```

Inform the user: "Notion MCP isn't available. Here's the content formatted for Notion — paste it manually into the appropriate database."
