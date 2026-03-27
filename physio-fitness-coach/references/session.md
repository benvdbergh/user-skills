# Session Workflow

Generates a complete, ready-to-execute training session by reading the current program and exercise library from Notion.

## Before Generating

1. Read Fitness Profile from Notion — confirm no new injuries since last session
2. Read current Program page from Notion — determine what today's training day is
3. Read Session Log — check the most recent session to understand continuity (what was last trained, any RPE notes)

If no program exists: "I don't see an active program in Notion. Say 'build my program' to create one first, or I can generate a standalone session if you tell me what you want to train today."

## Step 1: Identify Today's Training Day

From the current Program page, determine:
- What week of the mesocycle is this? (Week 1 accumulation / Week 2 build / Week 3 overreach / Week 4 deload)
- What day of the weekly template does today correspond to? (e.g., Day 3 — Lower Body Pull)
- What is the training focus and primary movement pattern?

If the user doesn't specify a date, assume today. Ask if ambiguous.

## Step 2: Load Exercises

For each exercise in today's program day:
1. Search Exercise Library in Notion for the exercise by name
2. Read the clinical spec (sets, reps, tempo, cues, contraindications)
3. Apply any week-specific progression from the Program (e.g., Week 2: add 1 set to all accessories)
4. If exercise not found in library, generate an inline prescription (do not block the session)

## Step 3: Build the Session Structure

Every session follows this structure:

### Warm-Up (10–15 min)
- **Pulse raiser** (2–3 min): light aerobic activity — row, bike, jog, jump rope
- **Mobility/activation** (5–8 min): 3–4 movements targeting today's primary pattern
  - Lower body day: hip 90/90, glute bridges, leg swings, ankle circles
  - Upper body day: thoracic rotations, band pull-aparts, wall slides, arm circles
  - Full body: combination of above
- **Movement prep** (3–5 min): 1–2 ramp-up sets of the primary lift at 40–60% effort

### Main Work
List exercises in order:
1. Primary compound movement (highest neural demand — do first when fresh)
2. Secondary compound or compound accessory
3. Isolation / corrective exercises

For each exercise in the session card:

```
[Exercise Name]
Sets × Reps @ Tempo | Rest | Intensity
Load: [target weight or bodyweight or band]
Cues: [1–2 most important coaching cues from library]
```

### Cool-Down (5–10 min)
- 2–3 static stretches for primary muscles trained (30–60 sec hold each)
- 1 breathing/nervous system reset exercise if session was high intensity

## Step 4: Apply Deload Logic

If current week is a deload week:
- Reduce sets by 40–50% (e.g., 4 sets → 2 sets)
- Keep load/intensity the same (do not reduce weight)
- Remove any exercises added during accumulation/overreach weeks
- Label session clearly: "DELOAD SESSION"

## Step 5: Session Card Output Format

```
# [Day Name] Session — [Date]
**Program:** [Program Name] | Week [X] | [Phase]
**Estimated duration:** [X] min

---

## Warm-Up (~[X] min)
- [2 min] Light row / bike
- [Hip 90/90 stretch — 5 reps/side]
- [Glute bridge — 10 reps]
- [Primary lift ramp: 40% × 5, 60% × 3]

---

## Main Work

### 1. [Primary Exercise]
3 × 5 @ 3-1-2-0 | Rest: 3 min | RIR: 1–2
Cues: "Chest up, drive through the floor"

### 2. [Secondary Exercise]
4 × 8–10 @ 3-0-2-0 | Rest: 90 sec | RIR: 2
Cues: "Initiate with the elbow"

### 3. [Accessory 1]
3 × 12–15 @ 2-0-2-0 | Rest: 60 sec | RIR: 3
Cues: "Keep ribs down"

### 4. [Corrective]
2 × 10/side @ controlled | Rest: 45 sec
Cues: "Feel the glute, not the lower back"

---

## Cool-Down (~8 min)
- Hip flexor stretch — 60 sec/side
- Lat stretch against wall — 30 sec/side
- Diaphragmatic breathing — 10 breaths
```

## Step 6: Save to Notion (mandatory — execute immediately when session is generated)

Do not wait for the user to complete the session. Save a draft to Notion as soon as the session card is ready.

**Immediately create:**

1. **Workout Schedule record** (session-level)
   - Database URL: https://www.notion.so/c56040c288994be3a1d92a82b0eadd7a
   - Name: training day name (e.g. "Lower Body Pull")
   - Date: today's date
   - Difficulty: estimated (Hard / Medium / Low based on program phase)

2. **Workouts records** (one per exercise)
   - Database URL: https://www.notion.so/353dcd66dcaa450e94740979eea48fce
   - One record per exercise with: Sets label, Reps, Weight, Rest, Duration
   - Link each record to the Workout Schedule record via `Workout Schedule` relation
   - Link each record to the corresponding Workout Exercises record via `Exercise` relation
   - `Done` = false (user ticks off during training)

After saving, confirm: "Session saved to Notion. [N] exercises logged under '[Training Day Name]'. Come back after training to log your actual weights and RPE."

**After training (if user returns):**
Ask: "How did the session go? Any notes on RPE, weights used, or modifications?"
Update the existing Workouts records with actual loads and tick Done. Do not create new records.
