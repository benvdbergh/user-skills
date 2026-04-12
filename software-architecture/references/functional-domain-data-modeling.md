# Functional architecture — domain and data modeling

**Related:** [`SKILL.md`](../SKILL.md) (*Functional architecture topic map* + agent workflow) · [`functional-api-design-consistency.md`](functional-api-design-consistency.md) (exposing data across boundaries) · [`functional-versioning-compatibility.md`](functional-versioning-compatibility.md) (schema/API evolution rules)

**Delegation:** Entity design, aggregates in code, package layout → **`minimalist-coding`** `references/clean-architecture-and-ddd.md`.

---

## When to load this reference

- Drawing **bounded contexts**, **ownership**, or **system-of-record** boundaries.
- Planning **relational or document schema** changes with **zero/low-downtime** rollouts.
- Reviewing **event payloads** or **read models** that mirror persistent state.

---

## Core practices

### Bounded context and language

- **Bounded context** ([Martin Fowler](https://martinfowler.com/bliki/BoundedContext.html)): one **ubiquitous language** per context; enterprise-wide “one true model” is usually infeasible. Boundaries follow **team and language** seams.
- **Aggregate** ([DDD aggregate](https://martinfowler.com/bliki/DDD_Aggregate.html)): cluster mutated as a unit; **one root** for external references; keep invariants **inside** the aggregate boundary.
- **Integration:** prefer **APIs/events** and explicit mapping; use **anti-corruption layer** ([Fowler](https://martinfowler.com/bliki/AntiCorruptionLayer.html)) when foreign models must not leak in.

### Maintaining data models over time

1. **Declare the public contract** — distinguish stable shapes (columns/fields consumers rely on) from internal implementation.
2. **Prefer additive steps** — nullable columns, new optional JSON fields, **new** event types before renaming/removing old ones.
3. **Expand–contract** for breaking persistence changes — add new structure → backfill → switch readers/writers → drop old ([Prisma Migrate](https://www.prisma.io/docs/guides/migrate/developing-and-deploying-with-prisma-migrate), [expand–contract guide](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern)).
4. **Single writer per aggregate** — avoid two services concurrently enforcing conflicting invariants on the same rows.

---

## Examples

**Example A — Additive column (usually safe)**  
Add nullable `status_code` alongside legacy `published` boolean; backfill; switch app reads to `status_code`; later deprecate boolean in API (see versioning reference).

**Example B — Rename column (needs expand–contract)**  
Add `legal_name`, copy from `name`, deploy readers that prefer `legal_name`; deploy writers dual-writing; cut over; remove `name` only after no old binaries remain.

**Example C — Two contexts, same noun**  
“Customer” in **Billing** (invoice address) vs **CRM** (lead score): different types, explicit mapper at integration—no shared mutable `customers` table written by both.

---

## Frameworks, standards, and tools

| Kind | Examples | Role |
|------|----------|------|
| Conceptual | DDD, [bounded context](https://martinfowler.com/bliki/BoundedContext.html), [aggregates](https://martinfowler.com/bliki/DDD_Aggregate.html) | Ownership and consistency boundaries |
| Migration discipline | Expand–contract ([Prisma data guide](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern)) | Safe rollout across app + DB versions |
| Event contracts | [AsyncAPI](https://www.asyncapi.com/), [JSON Schema](https://json-schema.org/) | Document event payloads and evolution (pair with versioning reference) |
| ORM migration runners | Prisma Migrate, Flyway, Liquibase, Rails migrations | Automate ordered, reviewable DDL |

Runtime ORMs (EF, Hibernate, etc.) are **implementation** choices; the **pattern** is additive or expand–contract rollouts.

---

## No-gos

- **Integration database** — multiple services using one database as the coordination bus ([Fowler](https://martinfowler.com/bliki/IntegrationDatabase.html)).
- **Leaky persistence** — exposing internal IDs/surrogate keys or ORM graphs as the **stable** public contract without a version story.
- **Big-bang rename/drop** in one deploy while mixed code versions still run.
- **Shared writable aggregates** — two writers, one invariant set, no clear serialization.

---

## Further reading

- https://martinfowler.com/bliki/BoundedContext.html  
- https://martinfowler.com/bliki/DDD_Aggregate.html  
- https://martinfowler.com/bliki/AntiCorruptionLayer.html  
- https://martinfowler.com/bliki/IntegrationDatabase.html  
- https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern  
