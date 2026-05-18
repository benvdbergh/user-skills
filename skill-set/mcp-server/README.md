# Skill Lab MCP Control Plane

Git-backed MCP server for governing user- and project-level Agent Skills. Owned by the `skill-set` skill; spec: `spec/skill-lab-mcp-control-plane.md`.

## Prerequisites

- Node.js 20+
- Skills repository with `skill-index.json` and `skill-set/catalog/environment-skill-index-map.json`

## Quick start (AC-001)

```bash
cd skill-set/mcp-server
cp skill-lab.config.example.json skill-lab.config.local.json
# Edit skillsRoot if needed
npm install
npm run dev -- doctor
npm run build
npm run mcp
```

Configure Cursor MCP (stdio), for example:

```json
{
  "mcpServers": {
    "skill-lab": {
      "command": "node",
      "args": ["C:/path/to/skills/skill-set/mcp-server/dist/cli.js", "mcp"],
      "cwd": "C:/path/to/skills/skill-set/mcp-server"
    }
  }
}
```

## R0.1 MCP tools (read-only)

| Tool | Purpose |
|------|---------|
| `list_skills` | Normalized summaries across environments |
| `search_skills` | Search name, triggers, workflows, description |
| `get_skill_detail` | Parsed `SKILL.md` detail for one skill |

## Architecture

See [docs/architecture.md](docs/architecture.md) for Gate 2 decisions, DTO schemas, and write-confirmation design.

## Tests

```bash
npm test
```
