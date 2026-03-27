# LLM Reference Guide: Neo4j as Single Source of Truth

## Can LLMs resolve entity references when the model is in Neo4j?

**Yes.** LLMs resolve references by querying Neo4j via MCP (read-cypher). No file paths or index.json are used.

## How It Works

### 1. Model lives in Neo4j

- **Entities** = nodes (labels = ArchiMate types, e.g. BusinessActor, Product)
- **Relationships** = edges (types = ArchiMate relationship types)
- **Primary key** = node property `id` (e.g. `ACT-1aa4998b0234`)

### 2. Reference format

Relationships use **target_id** (the target node’s `id`):

```json
{
  "type": "reports_to",
  "target_id": "ACT-d70cd989f320"
}
```

### 3. Resolution

1. Use MCP **read-cypher**
2. Query: `MATCH (n {id: $id}) RETURN n` with the entity id
3. Use the returned node for validation and display
4. To list relationships: `MATCH (a {id: $id})-[r]->(b) RETURN type(r), b.id, b.title`

### 4. No index or file paths

- Do not load `index.json` or entity JSON files
- Config: load `.claude/settings.json` only for ontology and Obsidian path settings (e.g. folder_mapping, obsidian_folder_structure)
- All entity and relationship data comes from Neo4j

## What LLMs need

- **Clear instructions**: This guide and `.claude/skills/enterprise-model-store/references/ReferenceResolutionGuide.md` (project-local)
- **MCP tools**: get-schema, read-cypher, write-cypher
- **Ontology**: project-local ontology at `.claude/skills/enterprise-model-store/references/ontology-v1.json` for entity/relationship types

## Applying updates

- **Read** current model: read-cypher (e.g. MATCH (n) RETURN …; MATCH (a)-[r]->(b) RETURN …)
- **Apply** after human approval: write-cypher (CREATE/MERGE nodes, CREATE relationships, SET properties)
- **Do not** create or edit JSON entity files; the enterprise model is only in Neo4j

## Obsidian notes

- Notes are created from Neo4j data (e.g. script `.claude/skills/enterprise-model-store/scripts/CreateObsidianNotes.ts` with a JSON export from read-cypher — script lives in the project-local enterprise-model-store skill)
- Linking: Neo4j node `obsidian_note_id` ↔ Obsidian note frontmatter `entity_id`
