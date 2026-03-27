# Program Workflow

Designs evidence-based, periodized training programs tailored to the user's goals, schedule, and physical profile.

## Before Starting

1. Read Fitness Profile from Notion — extract: goals, injuries/contraindications, training age, equipment, days available, session duration
2. Check for an existing active Program in Notion — if one exists, ask: "Continue/modify current program or start a new block?"

## Step 1: Select Periodization Model

Choose based on training age and goal:

| Training Age | Primary Goal | Recommended Model |
|-------------|-------------|-------------------|
| Beginner (0–1 yr) | Any | Linear periodization — simple progressive overload weekly |
| Intermediate (1–3 yr) | Hypertrophy | Undulating (DUP) — vary rep ranges across sessions |
| Intermediate (1–3 yr) | Strength | Block periodization — accumulation → intensification blocks |
| Advanced (3+ yr) | Any | Block or conjugate — separate qualities by phase |
| Any | Rehab / General fitness | Linear with conservative progression |

## Step 2: Design Weekly Template

### Frequency Selection

| Days/Week | Split Recommendation |
|-----------|---------------------|
| 2 days | Full body x2 |
| 3 days | Full body x3 or Push/Pull/Legs |
| 4 days | Upper/Lower x2 or PPL + Full body |
| 5 days | PPL + Upper/Lower or body-part split |
| 6 days | PPL x2 or Upper/Lower x3 |

### Muscle Balance Rules (mandatory)

Every weekly template must satisfy:
- **Push:Pull ratio** — minimum 1:1, prefer 1:1.5 (more pull volume)
- **Anterior:Posterior chain** — equal hip hinge and squat pattern volume per week
- **Internal:External rotation** — for every pressing exercise, include at least one external rotation/scapular stability movement
- **Bilateral:Unilateral** — include at least 1 unilateral lower body movement per week
- **Core** — include anti-extension, anti-rotation, and hip flexor work each week

### Rest Day Positioning Rules

- Never schedule more than 2 consecutive high-intensity days
- Place rest days after high-intensity sessions or after 2 consecutive moderate-intensity sessions
- Deload sessions (active recovery, mobility) are preferable to full rest days where possible

## Step 3: Set Load Parameters

For each training phase, define:

| Parameter | Hypertrophy | Strength | Endurance | Rehab |
|-----------|------------|----------|-----------|-------|
| Sets/exercise | 3–5 | 3–6 | 2–4 | 2–3 |
| Rep range | 6–20 (most 8–15) | 1–6 | 12–30 | 10–20 |
| RIR target | 1–3 RIR | 0–2 RIR | 2–4 RIR | 3–5 RIR |
| Rest periods | 60–120 sec | 2–5 min | 30–60 sec | 60–90 sec |
| Weekly volume (sets/muscle) | 10–20 | 6–12 | 8–15 | 4–8 |

Start beginners at the **lower end** of all volume ranges.

## Step 4: Build Mesocycle Structure

A standard mesocycle is 4–6 weeks:

```
Week 1: Accumulation — introduce exercises, moderate volume, learn patterns
Week 2: Build — increase volume (add 1 set per exercise or increase load 2.5–5%)
Week 3: Overreach — peak volume/intensity for the block
Week 4: Deload — reduce volume by 40–50%, maintain intensity, recover
(Week 5–6: Optional continuation before new block)
```

Define progression rule explicitly:
- Hypertrophy: "Add 1 set per exercise or increase load by 2.5kg when all reps completed with RIR > 2"
- Strength: "Increase load by smallest increment when top set completed at target RIR"
- Beginner: "Increase load on every session if all reps completed"

## Step 5: Exercise Selection Per Day

For each training day:
1. Select 1 primary compound movement (squat / hip hinge / horizontal press / vertical press / horizontal pull / vertical pull)
2. Select 2–3 accessory movements that complement the primary and address muscle balance
3. Select 1–2 isolation or corrective exercises (target weak links, contraindication-safe)
4. Check all exercises against active contraindications in Fitness Profile

**Minimum exercises per session:** 4
**Maximum exercises per session (60 min):** 7

## Step 6: Present Program Summary

Present the program to the user:
- Program name: "[Goal] Program — [Month Year]"
- Periodization model + rationale (1–2 sentences)
- Weekly template table (Day → Training focus → Primary movements)
- Load parameters and progression rule
- Deload week protocol

Then ask:
- "Does this match your expectations?"
- "Any days or exercises you'd like to adjust?"

Apply edits, then proceed immediately to Step 7.

## Step 7: Write to Notion (mandatory — do not skip or ask for permission)

After the user confirms, immediately execute the following Notion writes in order:

1. **Update Fitness Profile — Current Program section**
   - Fetch Fitness Profile page (search "Fitness Profile")
   - Replace the `## Current Program` section with the program data using the template in `assets/notion-templates.md` — Current Program Section
   - Tool: `notion-update-page` on the Fitness Profile page ID

2. **Add exercises to Workout Exercises DB**
   - For every exercise in the program, query Workout Exercises DB by Name
   - If not found: create a record with Name, Type, and Muscle Group relation; write clinical spec into the page body
   - If found: skip (do not duplicate)
   - Database URL: https://www.notion.so/20e463e8bec947d4b27dca4b119a83d5

3. **Do NOT create Workout Schedule or Workouts records** — those are generated by the Session workflow when the user requests a session.

After saving, confirm: "Your program has been saved to Notion — I've updated your Fitness Profile and added [N] exercises to your Exercise Library."
