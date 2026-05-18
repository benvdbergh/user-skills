# Skill Lab MCP Control Plane

Git-backed MCP server and dashboard for governing user- and project-level Agent Skills (`skill-set` ownership).

## Backlog

- **Backlog:** [Linear — Skill Lab](https://linear.app/ben-van-den-bergh/project/skill-lab-987d87409e04/overview)
- **Index:** [tracker-index.md](tracker-index.md) (`Planning ID` → issue URL)
- **Manifest:** [.project-planning.yaml](.project-planning.yaml) (`delivery_tracker: linear`)

## Requirements

- **Spec:** [spec/skill-lab-mcp-control-plane.md](spec/skill-lab-mcp-control-plane.md) (`US-*`, `AC-*`, `FR-*`, `NFR-*`)

## Scope

In scope: catalog ingestion, shared domain layer, MCP + HTTP APIs, read-only dashboard, proposal-first AI, gated writes with Git review.

Out of scope (initial): multi-tenant cloud, auto-commit/push, one MCP server per skill.
