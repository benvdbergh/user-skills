# Clean Architecture, DDD & Library-First Standards

Applied when designing, structuring, or reviewing code. Complements the YAGNI + Search-First workflow in SKILL.md — that governs *how much* to write; this governs *how to structure* what you write.

---

## Library-First Approach

Before writing any custom code:

1. Check the project's package manager (npm, pip, cargo, etc.) for existing libraries.
2. Consider existing services or SaaS (e.g. Auth0/Supabase for auth, Stripe for billing).
3. Consider third-party APIs for common functionality.

**Use libraries for:** retry logic, validation, state management, form handling, date parsing, HTTP clients.
Example: use `cockatiel` for retry instead of a custom loop.

**Custom code is justified only when:**
- The business logic is genuinely domain-specific and unique.
- The path is performance-critical with special requirements.
- Security-sensitive code requires full control.
- Existing solutions have been evaluated and do not meet requirements.

> Every line of custom code is a liability: maintenance, tests, documentation. Prefer boring, well-tested dependencies.

---

## Clean Architecture Layers

Dependencies point **inward only** — outer layers depend on inner; inner layers have zero knowledge of outer layers.

```
Presentation  ──►  Application  ──►  Domain
Infrastructure ──►  Application  ──►  Domain
```

| Layer | Contents | Dependencies |
|-------|----------|-------------|
| **Domain** | Entities, value objects, aggregates, domain services, repository interfaces | None (pure business rules) |
| **Application** | Use cases, application services, DTOs, command/query handlers | Domain only |
| **Infrastructure / Adapters** | Database implementations, external API clients, messaging, frameworks | Application + Domain |
| **Presentation** | UI components, HTTP controllers, CLI, GraphQL resolvers | Application only |

**Rules:**
- Domain never imports from infrastructure, frameworks, or UI.
- Infrastructure implements interfaces defined in Domain/Application.
- Use cases orchestrate domain objects; they do not contain business rules themselves.

---

## Domain-Driven Design (DDD)

### Ubiquitous Language
Use the domain's own vocabulary throughout the codebase. Class names, method names, and variables should match what domain experts say — not generic technical terms.

### Bounded Contexts
Divide the system into explicit bounded contexts. Each context owns its model; the same concept (e.g. "Customer") may have different meanings and different representations in different contexts. Avoid sharing domain objects across context boundaries — use integration events or anti-corruption layers.

### Core Building Blocks

| Concept | Description |
|---------|-------------|
| **Entity** | Has a unique identity that persists over time (e.g. `Order`, `User`). Equality by ID. |
| **Value Object** | Defined by its attributes, not identity (e.g. `Money`, `Address`). Immutable. Equality by value. |
| **Aggregate** | Cluster of entities/VOs with a single root (Aggregate Root). External code only references the root. |
| **Repository** | Interface for retrieving and persisting aggregates. Defined in Domain; implemented in Infrastructure. |
| **Domain Service** | Stateless operation that doesn't naturally belong to a single entity or VO (e.g. `PricingService`). |
| **Domain Event** | Represents something meaningful that happened in the domain (e.g. `OrderPlaced`). |

---

## Naming Conventions

**Avoid generic names:**
- `utils.js` / `helpers.ts` / `misc.js` / `common/shared.js` — these become dumping grounds with no clear purpose.
- `Manager`, `Handler`, `Processor` as standalone class names with no domain context.

**Use domain-specific names:**
- `OrderCalculator`, `UserAuthenticator`, `InvoiceGenerator`
- Name files and modules after the bounded context and the concept they represent.
- One clear, stated purpose per module.

---

## Separation of Concerns

- Do **not** put business logic in UI components or controllers.
- Do **not** put database or API queries in controllers — use application/domain services and repository interfaces.
- Do **not** mix concerns across layers (e.g. no ORM entities leaking into the domain model).
- Maintain explicit boundaries between bounded contexts.

---

## Anti-Patterns to Avoid

| Anti-Pattern | Example | Fix |
|-------------|---------|-----|
| **NIH (Not Invented Here)** | Custom auth instead of Auth0/Supabase; custom retry instead of `cockatiel` | Library-first check first |
| **Business logic in UI** | Validation rules inside a React component | Move to Domain or Application layer |
| **Database in controllers** | ORM query directly in HTTP handler | Use repository + application service |
| **Anemic domain model** | Domain objects are just data bags; all logic in services | Move logic onto entities/aggregates |
| **Generic naming** | `utils/misc.js` as a catch-all | Domain-specific module names |
| **Cross-context coupling** | Importing bounded context A's domain objects directly into context B | Integration events or ACL |

---

## Hexagonal Architecture (Ports & Adapters)

An alternative framing of Clean Architecture that makes external dependencies explicit:

- **Ports:** Interfaces that define *how* the application core is called (driving ports) and *how* it calls external systems (driven ports).
- **Driving adapters:** HTTP handlers, CLI, message consumers — invoke application use cases via driving ports.
- **Driven adapters:** Database repos, external API clients, event publishers — implement driven ports.
- The application core (Domain + Application) has zero knowledge of adapters.

Use this framing when the codebase explicitly names ports and adapters, or when designing a highly testable, adapter-swappable system.
