# Draft skill-escalation.md

Use for Skill Lab **create-escalation** sessions only. The target skill is already fixed in the session header.

## Goal

Add or update `references/skill-escalation.md` for that skill. Optionally patch `SKILL.md` only to add or fix a routing row that points agents to the escalation file.

## Use the scan outcome

When task.md includes a **Health scan finding** section, treat it as the sole defect to fix — do not re-run catalog health, lint, or validate workflows.

## Infer boundaries from

1. Target `SKILL.md` (description, workflows, references, what it claims to own).
2. Optional: `skill-set/maps/skill-relationships.json` or peer skills named in the target — only to name realistic **Escalate to** targets.

## Required file shape

`references/skill-escalation.md` must include:

| Section | Content |
|---------|---------|
| **Owns** | What this skill is responsible for |
| **Does not own** | Adjacent concerns this skill must not handle |
| **Escalate to** | Table or list: trigger → peer skill name |
| **Escalation triggers** (optional) | Concrete user-request patterns that mean “hand off” |

Keep it concise (roughly one screen). Third-person, capability-focused language.

## Deliverable

Call skill-lab MCP **`propose_skill_patch`** with:

- `references/skill-escalation.md` — **required**
- `SKILL.md` — only if you add or correct the escalation routing reference

## Do not

- Run `validate-skill-effectiveness`, `lint.md`, or full effectiveness-assessment rubrics
- Re-scan the repository or re-validate unrelated skills
- Edit files outside the target skill folder
- Ask which skill to work on
