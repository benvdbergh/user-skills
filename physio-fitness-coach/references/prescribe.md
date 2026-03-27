# Prescribe Workflow

Generates clinical-grade exercise prescriptions following sports physiotherapy standards. Every prescription is contraindication-checked, evidence-grounded, and fully specified.

## Before Prescribing

1. Read Fitness Profile from Notion — extract active contraindications and relevant injury history
2. Search Exercise Library in Notion — if the requested exercise already exists, return it (possibly updated) rather than creating a duplicate
3. Clarify the prescription context if not stated: rehabilitation / strength / hypertrophy / mobility / corrective?

## Step 1: Exercise Selection Criteria

Select exercises that satisfy ALL of:
- **Specificity** — targets the muscle group or movement pattern requested
- **Contraindication clearance** — does not involve any movement flagged in Fitness Profile
- **Equipment availability** — matches equipment listed in Fitness Profile
- **Goal alignment** — appropriate difficulty and stimulus for stated goal
- **Evidence base** — backed by clinical or sports science literature (preference for peer-reviewed)

Prescribe 3 exercises per request unless otherwise specified:
- 1 primary (most effective for the goal)
- 1 alternative (different equipment or difficulty)
- 1 corrective/accessory (addresses a supporting structure or movement quality)

## Step 2: Clinical Specification Format

For every exercise, produce the full clinical specification:

```
### [Exercise Name]

**Target:** [Primary muscle(s)] | [Secondary/synergists]
**Pattern:** [Movement pattern: squat / hinge / push / pull / carry / rotation / isometric]
**Equipment:** [Required equipment]

**Prescription**
- Sets: [X]
- Reps: [X–X] or Duration: [X sec]
- Tempo: [eccentric-pause-concentric-pause, e.g. 3-1-2-0]
- Rest: [X sec / min]
- Intensity: [% 1RM / RPE X / RIR X]

**Setup & Position**
[1–3 sentences on starting position and equipment setup]

**Execution Cues** (coaching cues, not anatomy)
1. [Cue 1 — most important]
2. [Cue 2]
3. [Cue 3]
4. [Cue 4 — optional, for common errors]

**Contraindications**
- Avoid if: [condition or injury]
- Modify if: [condition] → [modification]

**Progressions**
1. [Harder variation] — [what changes]
2. [Even harder] — [what changes]

**Regressions**
1. [Easier variation] — [what changes]
2. [Even easier / beginner entry] — [what changes]

**Clinical Rationale**
[2–3 sentences: why this exercise for this goal, mechanism of action, evidence basis]
```

## Step 3: Contraindication Check Protocol

Before finalising each exercise, run this check:

1. List all active contraindications from Fitness Profile
2. For each contraindication, check: does this exercise load the affected structure? Does it require the restricted movement?
3. If YES → replace with a regression or alternative that avoids the restriction
4. Explicitly note any modifications made due to contraindications

If no contraindications apply, state: "No active contraindications — cleared as prescribed."

## Step 4: Tempo Notation Standard

Use 4-digit tempo notation throughout: **eccentric – top pause – concentric – bottom pause**

Common examples:
- `3-1-2-0` — 3s down, 1s pause at bottom, 2s up, no pause at top (hypertrophy standard)
- `4-0-1-0` — 4s eccentric, explosive concentric (eccentric emphasis)
- `2-0-2-0` — controlled, neutral (general strength)
- `0-0-1-0` — ballistic / power (speed-strength)
- `5-5-0-0` — 5s down, 5s hold (isometric / rehab)

## Step 5: Intensity Notation Standard

Use RPE (Rate of Perceived Exertion) or RIR (Reps In Reserve) — not % 1RM unless the user specifically uses a percentage system:

| RIR | RPE | Meaning |
|-----|-----|---------|
| 4 | 6 | Very easy, 4 reps left |
| 3 | 7 | Moderate, 3 reps left |
| 2 | 8 | Hard, 2 reps left |
| 1 | 9 | Very hard, 1 rep left |
| 0 | 10 | Max effort |

Hypertrophy: target 1–3 RIR | Strength: 0–2 RIR | Rehab: 3–5 RIR

## Step 6: Output and Documentation

After presenting the prescriptions to the user:

1. Ask: "Would you like any modifications to these prescriptions?"
2. Apply edits if requested
3. Invoke **Document workflow** (`references/document.md`) to save exercises to the Notion Exercise Library
4. If exercises were prescribed as part of a session (linked to a Program day), note which program day they belong to

## Disclaimer

Always include this note when prescribing for an injury or rehabilitation context:

> These recommendations are for general fitness guidance and should be reviewed by your treating physiotherapist or sports medicine physician before implementation, especially if you have an active injury or recent diagnosis.
