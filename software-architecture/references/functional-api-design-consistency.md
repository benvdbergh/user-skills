# Functional architecture — API design and consistency

**Related:** [`SKILL.md`](../SKILL.md) (*Functional architecture topic map* + agent workflow) · [`functional-domain-data-modeling.md`](functional-domain-data-modeling.md) (what you expose as resources) · [`functional-versioning-compatibility.md`](functional-versioning-compatibility.md) (URL majors, deprecation, SemVer for libs)

---

## When to load this reference

- Designing or reviewing **HTTP/REST** (or REST-like JSON) **surface area**.
- Standardizing **errors, pagination, naming** across teams.
- Enforcing **contract-first** delivery (OpenAPI as source of truth).

---

## Core practices

### Resource-oriented shape

- **Google AIPs:** [Overview](https://google.aip.dev/general), [AIP-121 resource-oriented design](https://google.aip.dev/121), [AIP-122 resource names](https://google.aip.dev/122) — named resources, small standard method vocabulary; applies to REST and RPC styles.
- **Cloud API Design Guide:** https://docs.cloud.google.com/apis/design — narrative companion to AIPs.
- **Nouns in paths, verbs in HTTP methods** — collections and resources, not `/getUser` (see [OpenAPI best practices](https://learn.openapis.org/best-practices.html)).

### Consistency at org scale

- **Zalando RESTful API Guidelines:** https://opensource.zalando.com/restful-api-guidelines/ — API-first, API-as-product, JSON conventions, compatibility notes; optional event chapter for async symmetry.
- **Single source of truth** — OpenAPI (or AsyncAPI for messaging) in git; **design-first** when possible; CI validates implementation vs spec ([OpenAPI learning — best practices](https://learn.openapis.org/best-practices.html)).
- **Linting** — Spectral (or org rules) on OpenAPI to catch naming and structural drift.

### Behaviors that pay off

- **Errors:** [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) Problem Details (`application/problem+json`); stable `type` URIs; no stack traces to clients in production.
- **Pagination / filter / sort:** one org pattern (cursor vs offset); document trade-offs; cap limits.
- **Idempotency:** `Idempotency-Key` (or equivalent) on **POST** that allocates money, inventory, or identities.
- **Representation evolution:** prefer **additive** JSON fields; document whether clients must **ignore unknown fields** (forwards compatibility). Tight coupling to “exact shape” breaks minor evolutions—align with `functional-versioning-compatibility.md`.

---

## Examples

**Example A — Resource naming**  
`GET /v1/publishers/{publisher}/books/{book}` — publisher-scoped collection; avoid `GET /getBook?id=…` as the primary pattern.

**Example B — Problem Details**  
`401` with body `{ "type": "https://api.example.com/problems/invalid-token", "title": "Invalid token", "detail": "Bearer token expired" }` — same envelope for all teams.

**Example C — Org consistency**  
All public APIs pass Spectral rule pack `zalando-style` (or your fork); CI fails on unreviewed spec diff on default branch.

---

## Frameworks, standards, and tools

| Kind | Examples | Role |
|------|----------|------|
| Style & patterns | [Google AIPs](https://google.aip.dev/), [Cloud API Design Guide](https://docs.cloud.google.com/apis/design) | Resource names, methods, versioning (with AIP-185 in versioning ref) |
| REST conventions | [Zalando guidelines](https://opensource.zalando.com/restful-api-guidelines/) | End-to-end HTTP/JSON consistency |
| Contract | [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) | Docs, codegen, breaking-change review |
| HTTP semantics | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) | Methods, status codes |
| Errors | [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) | Interoperable error bodies |
| Async symmetry | [AsyncAPI](https://www.asyncapi.com/) | Event/API parity where both exist |

**Runtime:** Spring MVC, ASP.NET Minimal APIs, FastAPI, etc.—choose for team velocity and **OpenAPI generation fidelity**, not fashion.

---

## No-gos

- **Verb-heavy URLs** without a resource model (`/processOrder`, `/saveEverything`).
- **200 OK** with business-failure payload — breaks caches, clients, and observability.
- **Per-team error JSON** with no shared `type`/`problem` catalog.
- **Undocumented fields** that partners already rely on (de facto public contract).
- **Spec as an afterthought** — code-first with never-updated OpenAPI.

---

## Further reading

- https://google.aip.dev/121  
- https://google.aip.dev/122  
- https://docs.cloud.google.com/apis/design  
- https://opensource.zalando.com/restful-api-guidelines/  
- https://learn.openapis.org/best-practices.html  
- https://www.rfc-editor.org/rfc/rfc9457.html  
- https://www.rfc-editor.org/rfc/rfc9110.html  
