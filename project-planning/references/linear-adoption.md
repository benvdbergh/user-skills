# Adopting project-planning on Linear

**Load only when** `delivery_tracker: linear` (manifest or user). Linear is the **backlog SSOT** — do not create parallel `Epic-*.md` / `Story-*.md`. Otherwise see [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot).

Repo **requirements** (`PRD.md`, specs, ADRs) remain SSOT in the repository; link them from milestone and issue descriptions.

Guide for [Linear](https://linear.app/) via **official Linear MCP** (`plugin-linear-linear` in Cursor; `https://mcp.linear.app/mcp` per [Linear MCP docs](https://linear.app/docs/mcp)).

## Concept mapping

| Planning concept | Linear (SSOT) | Notes |
|------------------|---------------|--------|
| **Epic** | **Project milestone** | One milestone per epic |
| **Story** | **Issue** | One issue per story; link to milestone |
| **Task** | **Sub-issue** | Optional under story issue |
| **PRD / spec / ADR** | Repo files + links in descriptions | Requirements SSOT stays in git |
| **Dependencies** | Issue relations (`blocks` / `blocked by`) | Only real blockers |
| **DoR / `ready`** | Issue state (e.g. Backlog / Todo) | Review in Linear, not markdown |
| **Cycle** | **Cycle** (team) | When pulling into iteration |

**Upstream:** `product-roadmap` → Linear **Initiatives**; link initiative URLs in milestone descriptions when relevant.

## Linear hierarchy

```text
Initiative (strategy)     ← product-roadmap
  └── Project             ← delivery container
        └── Milestone     ← epic (SSOT)
              └── Issue   ← story (SSOT)
                    └── Sub-issue  ← optional task
```

## MCP prerequisites

1. Connect Linear MCP ([Cursor MCP directory](https://cursor.com/docs/context/mcp/directory) or `https://mcp.linear.app/mcp`).
2. Authenticate: `mcp_auth` with `{}` on `plugin-linear-linear` if tools are missing.
3. **Discover tools at runtime** — read MCP descriptors or list tools after auth.
4. Prefer **official** tools per [Linear MCP for product management](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management).

## MCP dependencies

| Item | Value |
|------|--------|
| **Server** | `plugin-linear-linear` |
| **Auth** | OAuth via `mcp_auth` or Bearer per [Linear MCP docs](https://linear.app/docs/mcp) |

## Tool usage mapping

| Step | MCP intent | Safety |
|------|------------|--------|
| Resolve team/project | List/get teams, projects | Safe |
| Create epic | Create/edit **milestone** | Safe |
| Create story | Create **issue** on milestone | Safe |
| Dependencies | Issue **blocks** relations | Safe |
| Plan review | List milestone + issues, check AC in descriptions | Safe |
| Project/initiative update | Create **project/initiative update** | Confirm |
| Delete/archive | Archive milestone/issue | User must confirm |

## End-to-end workflow (Linear as SSOT)

### 1. Discover requirements (repo)

- [artifact-discovery.md](artifact-discovery.md), **ScanSources.ts**, PRD/spec/ADRs.
- Apply [agile-foundations.md](agile-foundations.md) and [decomposition-patterns.md](decomposition-patterns.md) before creating tracker items.

### 2. Prepare Linear containers

1. Ensure a **Project** exists (create via MCP if needed).
2. Link to an **Initiative** when roadmap context exists.
3. Record project URL in `brief.md` or optional [tracker-index.md](tracker-index.md).

### 3. Create epics → milestones (not markdown)

For each epic, create one **milestone** with:

| Planning field | Where in Linear |
|----------------|-----------------|
| Title | Milestone name |
| Outcome / scope | Milestone description |
| Target date | Milestone target date |
| `EPIC-n` id | Description line: `Planning ID: EPIC-n` |
| PRD/ADR links | Description “Sources” section |

### 4. Create stories → issues (not markdown)

For each story, create one **issue**:

| Planning field | Where in Linear |
|----------------|-----------------|
| Title | Issue title |
| Acceptance criteria | Issue description (checklist) |
| Parent epic | Issue **milestone** (+ project) |
| Priority | Issue priority |
| `depends_on` | Blocking relations after issues exist |
| `STORY-n-m` id | Description: `Planning ID: STORY-n-m` |
| `traces_to` sources | Description “Sources” links to repo paths |

Use labels for filters (e.g. `slice:vertical`) if helpful. Optional [tracker-index.md](tracker-index.md) for URLs only.

**Sub-issues** for tasks under the parent story issue.

### 5. Plan review

- Use the **tracker** section of [plan-quality-review.md](plan-quality-review.md).
- Fetch milestones/issues via MCP; flag missing AC, orphan issues, or broken blocker chains.

### 6. Agents and intake

Put acceptance criteria, source links, and repo/`AGENTS.md` paths in the **issue description** so agents and humans have one contract.

## Anti-patterns (Linear-specific)

- Issues for epics without **milestones** — use milestones for epics.
- Using Linear **Project** as an epic — projects are containers; **milestones** are epics.
- Copying full PRD text into every issue — link to repo paths instead.

Dual SSOT and markdown-backlog rules: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot).

## Migration from `files`

1. User confirms switch to `delivery_tracker: linear`.
2. Create milestones/issues from existing markdown (or start fresh).
3. Optional [tracker-index.md](tracker-index.md) with URLs.
4. Archive or remove `Epics/` / `Stories/` markdown backlog after confirmation — do not maintain both.

## Escalation

| Need | Skill |
|------|--------|
| Initiative / horizon | `product-roadmap` |
| PRD / spec | `specification` |
| Architecture | `software-architecture` |
| File-based backlog | [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot) |

## References

- [Linear](https://linear.app/)
- [Linear MCP documentation](https://linear.app/docs/mcp)
- [Linear MCP for product management](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management)
