# Assess Workflow

Structured intake and profile management. Run on first use, when goals change, or when new injuries/conditions arise.

## When to Use

- User is new (no Fitness Profile in Notion)
- User reports a new injury, condition, or medical change
- User wants to update goals, equipment, or schedule

## Step 1: Check for Existing Profile

Search Notion for "Fitness Profile". If found, read it and enter **Update Mode** — only ask about what has changed. If not found, enter **Full Intake Mode**.

## Step 2: Intake Questions

### Full Intake (new user)

Ask conversationally, not all at once. Group naturally:

**Goals**
- Primary goal: hypertrophy / strength / fat loss / general fitness / rehabilitation / sport performance?
- Time horizon: when do you want to see results?
- Any secondary goals?

**Training Background**
- Training age (how many years of consistent training)?
- Current weekly training frequency?
- What has your training looked like in the last 3 months?

**Injuries & Medical**
- Any current injuries or pain? (location, severity 1–10, diagnosis if available)
- Any previous injuries that still affect movement?
- Any medical conditions relevant to exercise (cardiovascular, metabolic, joint)?
- Current medications that affect training?

**Physical Characteristics**
- Age, sex assigned at birth (for hormonal context)
- Relevant anthropometrics if known (height, weight)

**Equipment & Environment**
- Training location: gym / home / both?
- Available equipment (barbells, dumbbells, machines, cables, bodyweight only)?
- Pool / cardio equipment available?

**Schedule**
- Days available per week for training?
- Session duration available (30 / 45 / 60 / 90 min)?
- Preferred training times (morning / evening)?
- Any fixed rest days?

**Preferences**
- Any exercises you dislike or cannot perform?
- Any exercises you enjoy and want to keep?
- Preference for training style (heavy compound / machine-focused / circuit / rehab-style)?

### Update Mode (returning user)

Read current profile aloud as a summary, then ask:
- "What has changed since we last updated this?"
- Probe specifically for: new injuries, goal shifts, equipment changes, schedule changes.

## Step 3: Injury Screening Protocol

For any reported injury, collect:

| Field | Question |
|-------|----------|
| Location | Exactly which structure? (muscle / tendon / joint / nerve) |
| Diagnosis | Has a clinician diagnosed this? What is the diagnosis? |
| Onset | Acute (sudden) or gradual? How long ago? |
| Severity | Pain at rest? Pain with movement? Functional limitation? |
| Aggravating movements | What makes it worse? |
| Relieving factors | What reduces symptoms? |
| Clearance status | Has a physio/doctor cleared you for exercise? |
| Restrictions | Any movements/loads explicitly forbidden by clinician? |

Flag injuries as:
- **Active restriction** — movement/load must be avoided, generate contraindications
- **Monitor** — train around, flag for modification, monitor for flare-up
- **Historical** — note but no current restriction

## Step 4: Derive Contraindications

For each Active restriction, generate a contraindication list:

```
Injury: [Name]
Avoid: [Specific movements, loads, positions]
Modify: [Alternative movement patterns]
Safe: [Movement patterns that are cleared]
```

Store these explicitly in the Fitness Profile — the Prescribe workflow checks these before every exercise prescription.

## Step 5: Document to Notion

Create or update the Fitness Profile page using the template in `assets/notion-templates.md`.

After saving, confirm: "Your Fitness Profile has been updated in Notion. Here's a summary: [brief]"

If it is the user's first profile, recommend: "Ready to build your first training program? Say 'build my program' to continue."

## Output Format

End the Assess workflow with:
1. Confirmation of Notion save
2. Brief profile summary (3–5 bullet points)
3. Next step suggestion
