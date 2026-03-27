# Notion Templates

Reference templates for each data type. Use these when creating records via Notion MCP or when in fallback manual mode.

---

## Fitness Profile

**Type:** Single page
**Title:** "Fitness Profile"

```markdown
# Fitness Profile

Last updated: [YYYY-MM-DD]

## Goals
- **Primary goal:** [staying fit / hypertrophy / strength / fat loss / rehabilitation / sport performance]
- **Secondary goals:** [list]
- **Time horizon:** [ongoing / specific target date]

## Training Background
- **Training age:** [X years]
- **Recent training:** [description of last 3 months]
- **Current weekly frequency:** [X sessions/week]

## Physical Characteristics
- **Age:** [X]
- **Sex:** [M/F/other]
- **Height/Weight:** [if provided]

## Injuries & Medical

### Active Restrictions
| Injury | Diagnosis | Severity | Avoid | Modify |
|--------|-----------|----------|-------|--------|
| [name] | [diagnosis] | [1–10] | [movements] | [alternatives] |

### Historical (monitor)
| Injury | Status | Notes |
|--------|--------|-------|
| [name] | [resolved/monitor] | [notes] |

### Medical Conditions
- [condition and relevance to training]

## Equipment
- **Location:** [gym / home / both]
- **Available:** [barbell, dumbbells, cables, machines, resistance bands, etc.]
- **Cardio:** [treadmill, bike, rower, etc.]

## Schedule
- **Training days/week:** [X]
- **Session duration:** [X min]
- **Fixed rest days:** [days]
- **Preferred time:** [morning / evening]

## Preferences
- **Dislikes / Cannot perform:** [list]
- **Favourites to keep:** [list]
- **Style preference:** [compound heavy / machine / circuit / rehab]
```

---

## Current Program Section

**Type:** Page body section inside the Fitness Profile page
**Purpose:** Replaces any existing `## Current Program` section on the Fitness Profile page. Do not create a new page.

```markdown
## Current Program

**Program:** [Program Name — e.g. "Hypertrophy Program — March 2026"]
**Start date:** [YYYY-MM-DD]
**Block:** [Mesocycle X — e.g. "Mesocycle 1 of 3"]
**Periodization:** [Model — e.g. "Undulating (DUP)"] — [1-sentence rationale]
**Phase:** Week [X] of [Y] — [Accumulation / Build / Overreach / Deload]

### Weekly Template

| Day | Focus | Primary Movement | Accessories |
|-----|-------|-----------------|-------------|
| [Day 1] | [e.g. Lower Body Pull] | [e.g. Romanian Deadlift] | [e.g. Nordic Curl, Copenhagen Press, Face Pull] |
| [Day 2] | [e.g. Upper Push] | [e.g. Incline Barbell Press] | [e.g. Overhead Press, Dips, Lateral Raise] |
| [Rest] | Rest / Active recovery | — | — |
| [Day 3] | [e.g. Lower Body Push] | [e.g. Back Squat] | [...] |
| [Day 4] | [e.g. Upper Pull] | [e.g. Weighted Pull-Up] | [...] |

### Load Parameters

| Parameter | Value |
|-----------|-------|
| Sets/exercise | [X–X] |
| Rep range | [X–X] |
| RIR target | [X–X] |
| Rest periods | [X sec/min] |
| Weekly volume (sets/muscle) | [X–X] |

### Progression Rule

[e.g. "Add 1 set per exercise or increase load by 2.5kg when all reps completed with RIR > 2"]

### Deload Protocol (Week [X])

- Reduce sets by 40–50%
- Maintain load (do not reduce weight)
- Remove volume added during overreach week
```

---

## Exercise Library Entry

**Type:** Database record in Workout Exercises DB
**Database:** https://www.notion.so/20e463e8bec947d4b27dca4b119a83d5

### Record Properties

| Property | Value |
|---|---|
| Name | [Exercise Name] |
| Type | Strength / Endurance / Flexibility / Cardio |
| Muscle Group | [relation to Workout Muscle Groups record] |

### Page Body (clinical spec)

```markdown
**Added:** [date] | **Category:** [Compound / Accessory / Corrective / Cardio]
**Pattern:** [squat / hinge / push / pull / carry / rotation / isometric]
**Target:** [Primary muscles] | [Secondary/synergists]
**Equipment:** [Required equipment]

---

## Prescription (Default)

| Parameter | Value |
|-----------|-------|
| Sets | [X] |
| Reps | [X–X] |
| Tempo | [X-X-X-X] |
| Rest | [X sec/min] |
| Intensity | [RIR X / RPE X] |

---

## Setup & Position
[1–3 sentences]

## Execution Cues
1. [Most important cue]
2. [Second cue]
3. [Third cue]

---

## Contraindications
- **Avoid if:** [condition]
- **Modify if:** [condition] → [modification]

---

## Progressions
1. [Harder variation] — [change]
2. [Even harder] — [change]

## Regressions
1. [Easier variation] — [change]
2. [Beginner entry] — [change]

---

## Clinical Rationale
[2–3 sentences: mechanism, evidence basis, why this exercise for this goal]
```

---

## Session Log

Sessions use two databases: one **Workout Schedule** record (the session) and multiple **Workouts** records (one per exercise set).

### Workout Schedule Record (session-level)

**Database:** https://www.notion.so/c56040c288994be3a1d92a82b0eadd7a

| Property | Value |
|---|---|
| Name | [Training day name — e.g. "Lower Body Pull"] |
| Date | [YYYY-MM-DD] |
| Time | [planned start time, optional] |
| Location | [gym / home / etc., optional] |
| Difficulty | Hard / Medium / Low |

### Workouts Records (set-level)

**Database:** https://www.notion.so/353dcd66dcaa450e94740979eea48fce

Create one record per exercise. Link each to the parent Workout Schedule record via the `Workout Schedule` relation.

| Property | Value |
|---|---|
| Sets | [label, e.g. "4×8"] |
| Exercise | [relation to Workout Exercises record] |
| Workout Schedule | [relation to parent session record] |
| Reps | [number] |
| Weight | [kg] |
| Rest | [e.g. "90s"] |
| Duration | [for timed sets, e.g. "30s"] |
| Done | false (tick when completed) |

### Fallback: Manual Session Format

```
[Session Log — copy into Workout Schedule]

Name: Lower Body Pull
Date: 2026-03-08
Difficulty: Medium

--- Workouts (one block per exercise) ---

Exercise: Barbell Romanian Deadlift
Sets: 4×8 | Reps: 8 | Weight: 80kg | Rest: 90s

Exercise: Nordic Hamstring Curl
Sets: 3×6 | Reps: 6 | Weight: bodyweight | Rest: 120s

Exercise: Copenhagen Adductor Press
Sets: 3×10 | Reps: 10 | Weight: bodyweight | Rest: 60s
```
