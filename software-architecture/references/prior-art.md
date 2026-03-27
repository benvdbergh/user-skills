# Prior Art Summary (Synthesize)

This skill was created using the skill-set synthesize workflow. Prior art informed design as follows.

| Source | Pattern / practice | Applicable? | Implication |
|--------|--------------------|-------------|-------------|
| [NeoLabHQ context-engineering-kit](https://github.com/NeoLabHQ/context-engineering-kit) (software-architecture SKILL) | Code style: early returns, library-first, Clean/DDD, domain naming, anti-patterns (NIH, no business logic in UI) | Yes | Adopted into code-style-and-design.md and SKILL summary. |
| [BMAD-METHOD architect agent](https://github.com/bmad-code-org/BMAD-METHOD) (architect.agent.yaml, 3-solutioning) | Architect persona (Winston), create-architecture and check-implementation-readiness workflows, lean architecture principles | Yes | Persona and principles in SKILL; workflows adapted in references. |
| BMAD create-architecture workflow | Step-by-step collaborative discovery, append-only doc, user approval between steps | Yes | Simplified into references/create-architecture.md. |
| Clean Architecture / DDD 2025 guides, CAA | Dependency inversion, layers, ports/adapters, when to apply (complex domains, long-lived systems) | Partial | Already covered by NeoLab content; Hexagonal noted in code-style ref. |
| SkillMD / architecture-patterns skills | Trigger phrasing, USE WHEN in description | Yes | Description and When to Use section include explicit triggers. |

No MCP dependencies: skill is guidance and workflow only. No `list_mcp_resources` gap.
