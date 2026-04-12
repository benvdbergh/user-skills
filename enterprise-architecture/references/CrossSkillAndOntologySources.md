# Cross-skill and ontology sources

This global skill ships **human-readable** ontology documentation in `references/ontology-v1.md`. It does **not** ship `ontology-v1.json` (machine schema).

## When Ai-Vault / CAI `enterprise-model-store` is available

Load these from the **project** skill **`enterprise-model-store`** (under the vault’s `.claude/skills/enterprise-model-store/`):

| Need | File (under that skill) |
|------|-------------------------|
| Machine ontology (types, allowed relationships) | `references/ontology-v1.json` |
| Entity ID prefixes and conventions | `references/IdentifierBestPractices.md` |
| Resolving IDs and duplicates against the graph | `references/ReferenceResolutionGuide.md` |
| Compile proposals into an update package | `references/ProposeModelUpdate.md` |
| Human validation before Neo4j writes | `references/ValidationWorkflow.md` (if present) |

**Order of work:** Run **`enterprise-architecture`** workflows (classify → extract → propose relationships → gaps/quality). Then use **`enterprise-model-store`** for packages, validation, and MCP apply — that skill owns Neo4j and the ontology JSON.

## When `enterprise-model-store` is not in the workspace

- Use **`references/ontology-v1.md`** here for type and relationship semantics.
- Treat extraction output as **proposals** only; flag that no JSON schema was loaded if the user needs strict validation.
- Do not assume Neo4j or MCP; prefer diagram-ready graph slices and the **`diagram`** skill.

## Solution-level technical architecture (product / system)

For **implementation-oriented** decision docs, readiness checks, and lean topology research — not ArchiMate enterprise metamodel operations — use the **`software-architecture`** skill.
