# Prior art summary

This skill was synthesized from public patterns and adapted for Agent Skills progressive disclosure.

| Source | Pattern / practice | Applicable? | Implication |
|--------|--------------------|-------------|-------------|
| [NeoLabHQ context-engineering-kit](https://github.com/NeoLabHQ/context-engineering-kit) (software-architecture SKILL) | Lean architecture, separation of concerns, explicit triggers | Yes | Principles and “research before guessing” live in `SKILL.md` and `references/ResearchTopology.md`. **Code-level** Clean Architecture / DDD detail is delegated to **`minimalist-coding`**. |
| [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) (architect agent, solutioning) | Architect persona, create-architecture and readiness-style workflows | Yes | Persona in `SKILL.md`; workflows in `references/create-architecture.md` and `references/check-implementation-readiness.md`. |
| BMAD create-architecture | Stepwise collaborative discovery, user checkpoints | Yes | Simplified in `references/create-architecture.md`. |
| Agent Skills standard | YAML `name`/`description`, WHAT + WHEN, references/ and assets/ layout | Yes | `SKILL.md` structure and routing table. |

No MCP dependencies: this skill is guidance and workflow only unless the user attaches MCP servers for research.
