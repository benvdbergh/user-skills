# Optional: how this skill fits the wider agent stack

This file is **not** a standalone modeling methodology. It explains **where to go next** when the user needs more than lean solution architecture.

## Default path (this skill)

1. **Topology / patterns** → `references/ResearchTopology.md`
2. **Decision document** → `references/create-architecture.md` + `assets/architecture-decision-template.md`
3. **Ship readiness** → `references/check-implementation-readiness.md`
4. **Code structure & DDD** → load **`minimalist-coding`** → `references/clean-architecture-and-ddd.md`

## When the problem is enterprise / ArchiMate / portfolio

Load **`enterprise-architecture`** for:

- ArchiMate entity extraction, relationship rules, ontology-guided modeling
- arc42 as **enterprise documentation** structure across the metamodel
- Metamodel design, validation rules, and EA quality review

Load **`enterprise-model-store`** (Ai-Vault / CAI project skill) when you must use **`ontology-v1.json`**, Neo4j MCP, or validated write packages — see **`enterprise-architecture`** → `references/CrossSkillAndOntologySources.md`.

## When the problem is product definition or specs

Load **`specification`** when the user needs a **PRD, technical plan, or constitution** before architecture work; this skill’s readiness checklist assumes those artifacts exist or will be created.

## Deprecated internal paths

Older drafts pointed at `Core/`, `Reference/`, and `Templates/` files that **do not exist** under this skill. Ignore any copy that still mentions them; use the routing table above instead.
