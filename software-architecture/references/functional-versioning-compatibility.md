# Functional architecture — versioning and compatibility

**Related:** [`SKILL.md`](../SKILL.md) (*Functional architecture topic map* + agent workflow) · [`functional-api-design-consistency.md`](functional-api-design-consistency.md) (HTTP surface) · [`functional-domain-data-modeling.md`](functional-domain-data-modeling.md) (persistence evolution)

---

## When to load this reference

- Defining **library or service SemVer** policy.
- Choosing **HTTP API versioning** (path, header, product channels).
- Introducing **consumer-driven contracts** or **deprecation/sunsets**.

---

## Core practices

### Libraries and packages — [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html)

- **MAJOR.MINOR.PATCH** — breaking public API → **major**; backward-compatible additions → **minor**; compatible fixes → **patch**.
- **Declare public API** explicitly (types, modules, docs). **0.y.z** = initial development, unstable.
- **Deprecation:** SemVer FAQ — mark deprecated in a **minor** release; remove only in a later **major** after a communicated runway.

### HTTP APIs — often *not* the same as package SemVer

- **[AIP-185 Versioning](https://google.aip.dev/185):** major version in path (`v1`, not `v1.2.3`); **alpha/beta/stable** channels (`v1alpha`, `v1beta`); parallel versions during migration; deprecation policy before shutdown; new major must not depend on old major of the *same* API.
- **Header or query versioning** — allowed if **one org standard** applies everywhere; avoid mixed styles per team.

### Contract testing

- **[Pact](https://docs.pact.io/)** — consumer-driven contracts; provider verification; broker + `can-i-deploy`-style gates for independent release (see Pact docs for your stack).

### Sunsetting

- Communicate timeline in docs and changelogs; use **Sunset** where appropriate ([RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html)); align with org policy for **Deprecation** signals on HTTP APIs.

### Judgment calls

- **Optional JSON fields** — usually backward-compatible for tolerant clients; **strict** deserializers may still break—note in changelog.
- **Tightening validation** (rejecting previously accepted input) is often a **breaking** change for real integrations.

---

## Examples

**Example A — Library**  
Removing a public method → **major** bump (`2.0.0`). Adding optional parameter with default → **minor**. Internal refactor, same exports → **patch**.

**Example B — HTTP API**  
Breaking URL shape → new path major `v2` while `v1` remains until sunset date; clients migrate per AIP-185-style policy.

**Example C — Pact**  
Checkout service publishes consumer pact for `orders-api`; `orders-api` CI verifies all pacts before deploy; broker blocks deploy if verification fails.

**Example D — Deprecation**  
`Deprecation: true` + `Sunset: Sat, 31 Oct 2026 23:59:59 GMT` on deprecated `POST /v1/legacy-submit` (exact headers depend on your standards—document them).

---

## Frameworks, standards, and tools

| Kind | Examples | Role |
|------|----------|------|
| Package versioning | [SemVer spec](https://semver.org/spec/v2.0.0.html), [Conventional Commits](https://www.conventionalcommits.org/) (often paired with release tooling) | Communicate breaking vs additive changes |
| HTTP API lifecycle | [AIP-185](https://google.aip.dev/185) | Majors, channels, coexistence |
| Contract tests | [Pact](https://docs.pact.io/), Pact Broker | Consumer/provider coupling safety |
| HTTP sunset | [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html) | Machine-readable retirement hint |
| Schemas | [JSON Schema](https://json-schema.org/), OpenAPI diff tools | Detect breaking schema changes in CI |

---

## No-gos

- Shipping **breaking** library or API changes as **patch/minor** without documented exception and consumer notice.
- **Silent removal** of endpoints or fields with no sunset and no migration path.
- **Per-service versioning schemes** (path here, header there) without an explicit platform standard.
- Relying only on SemVer for **HTTP** without a **documented** API lifecycle (they solve different layers).

---

## Further reading

- https://semver.org/spec/v2.0.0.html  
- https://semver.org/faq.html  
- https://google.aip.dev/185  
- https://docs.pact.io/  
- https://www.rfc-editor.org/rfc/rfc8594.html  
