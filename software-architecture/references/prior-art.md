# Prior art summary

This skill was synthesized from public patterns and adapted for Agent Skills progressive disclosure.

| Source | Pattern / practice | Applicable? | Implication |
|--------|--------------------|-------------|-------------|
| [NeoLabHQ context-engineering-kit](https://github.com/NeoLabHQ/context-engineering-kit) (software-architecture SKILL) | Lean architecture, separation of concerns, explicit triggers | Yes | Principles and “research before guessing” live in `SKILL.md` and `references/ResearchTopology.md`. **Code-level** Clean Architecture / DDD detail is delegated to **`minimalist-coding`**. |
| [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) (architect agent, solutioning) | Architect persona, create-architecture and readiness-style workflows | Yes | Persona in `SKILL.md`; workflows in `references/create-architecture.md` and `references/check-implementation-readiness.md`. |
| BMAD create-architecture | Stepwise collaborative discovery, user checkpoints | Yes | Simplified in `references/create-architecture.md`. |
| Agent Skills standard | YAML `name`/`description`, WHAT + WHEN, references/ and assets/ layout | Yes | `SKILL.md` structure and routing table. |
| [DORA](https://dora.dev/) | Software delivery throughput and stability metrics | Yes | Referenced in `references/platform-fitness-evaluation.md` for delivery maturity; agents should use **current** metric definitions from dora.dev. |
| [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) | Architecture review pillars (security, reliability, ops, performance, cost, sustainability) | Yes | Mapping table in `references/platform-fitness-evaluation.md`. |
| [Google SRE Book](https://sre.google/sre-book/monitoring-distributed-systems/) | Golden signals; SRE operations patterns | Yes | Observability section in `references/platform-fitness-evaluation.md`. |
| [CNCF cloud native definition](https://github.com/cncf/toc/blob/main/DEFINITION.md) | Cloud native characteristics and typical technologies | Yes | Cloud execution dimension in `references/platform-fitness-evaluation.md`. |
| [OWASP SAMM](https://owasp.org/www-project-samm/), [NIST SSDF](https://csrc.nist.gov/projects/ssdf) | Secure SDLC maturity and practice groups | Yes | Security-by-construction dimension in `references/platform-fitness-evaluation.md`. |
| [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html) | Incremental legacy replacement | Yes | Migration and integration dimensions in `references/platform-fitness-evaluation.md`. |
| [Pact](https://docs.pact.io/) / [SemVer](https://semver.org/) | Consumer-driven contracts; versioning expectations | Yes | Platform fitness: `references/platform-fitness-evaluation.md`. Deeper: `references/functional-versioning-compatibility.md`. |
| *Release It!* (Michael Nygard) | Circuit breaker, bulkhead, stability patterns | Yes | Resilience patterns cited in `references/platform-fitness-evaluation.md`. |
| [Google AIPs](https://google.aip.dev/) / [Cloud API Design Guide](https://docs.cloud.google.com/apis/design) | Resource-oriented APIs, naming, versioning (e.g. AIP-121, 122, 185) | Yes | `references/functional-api-design-consistency.md`, `references/functional-versioning-compatibility.md` (AIP-185). |
| [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/) | API-first, consistency, JSON and error conventions | Yes | `references/functional-api-design-consistency.md`. |
| [OpenAPI Initiative](https://learn.openapis.org/best-practices.html) | Design-first, spec as source of truth, CI validation | Yes | `references/functional-api-design-consistency.md`. |
| [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) | Library/package compatibility | Yes | `references/functional-versioning-compatibility.md`. |
| [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) | Problem Details for HTTP APIs | Yes | `references/functional-api-design-consistency.md`. |
| [Prisma expand–contract](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern) | Safe relational schema evolution | Yes | `references/functional-domain-data-modeling.md`. |

No MCP dependencies: this skill is guidance and workflow only unless the user attaches MCP servers for research.
