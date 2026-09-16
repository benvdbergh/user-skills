# user-skills

Personal [Agent Skills](https://agentskills.io) used across Cursor, Claude Code, Codex, and any other host that reads a `SKILL.md` folder. Skill bodies stay in **root-level folders**. Cursor distribution is a **plugin marketplace overlay**, not a second copy of the skills.

## Should this be split into plugins?

Yes, but only into a few installable packs — not one plugin per skill, and not by moving the folders.

Cursor cannot import a bare skills repo. Auto Refresh from git requires `.cursor-plugin/marketplace.json` and per-plugin manifests. A plugin is also the unit that can bundle an MCP server.

ChatGPT, Claude, and Codex do **not** consume Cursor team marketplaces. Those hosts keep working from the root folders (`~/.claude/skills`, `~/.codex/skills`, `~/.cursor/skills`). Cross-app refresh is `git pull` (or the skill-lab MCP), not Cursor Auto Refresh.

Split a pack when you need independent install, a different audience, or an MCP that lives in this repo. Do not bundle Linear, Notion, or Figma here; install those host plugins next to the pack.

| Plugin | When to install |
|--------|-----------------|
| `user-skills` | One Cursor install for the whole tree, plus the in-repo skill-lab MCP |
| `user-skills-engineering` | Git, CI, tests, repo ops |
| `user-skills-product` | Specs, roadmaps, Linear PM (install Linear MCP separately) |
| `user-skills-design` | Brand, UI/UX, diagrams, slides |
| `user-skills-documents` | Office, PDF, technical writing |
| `user-skills-research` | Deep research |
| `user-skills-skill-lab` | Skill authoring (`skill-set`) without the full tree |
| `user-skills-personal` | Life skills (keep off coding agents) |

Do not install `user-skills` together with the domain packs; the skill names would duplicate.

## Cursor (Auto Refresh)

1. Cursor Dashboard → Plugins → Add Marketplace → Import from Repo.
2. Paste `https://github.com/benvdbergh/user-skills`.
3. Enable Auto Refresh (Cursor GitHub App must be on this repo). Cursor re-indexes at most every 10 minutes.
4. Install `user-skills`, or pick domain packs. Set Required / Default On / Default Off per pack.

Public Cursor Marketplace listings are reviewed and do **not** auto-update from git. Personal/team Auto Refresh is the git-tracking path.

If a domain pack shows empty skills after install, Cursor's plugin cache may not follow the git symlinks under `plugins/<pack>/skills/`. Re-run `python skill-set/scripts/sync_plugin_packs.py --copy`, commit the copies, and refresh the marketplace.

## Claude Code / Codex / ChatGPT

Clone or pull this repo into the host skills directory (or symlink the repo there):

```text
~/.claude/skills/<skill>/SKILL.md
~/.codex/skills/<skill>/SKILL.md
~/.cursor/skills/<skill>/SKILL.md
```

Keep using the root folders. The `plugins/` tree is only for Cursor/Agent plugin loaders.

## Edit skills, then sync packs

Canonical membership is `skill-set/catalog/plugin-packs.json`. After adding or moving a skill:

```bash
python skill-set/scripts/sync_plugin_packs.py
python skill-set/scripts/sync_plugin_packs.py --check
python skill-set/scripts/update_skill_index.py
```

## skill-lab MCP

Bundled only on the `user-skills` plugin. From a local clone:

```bash
cd skill-set/mcp-server
npm install
```

The plugin command uses `npx tsx` against `skill-set/mcp-server/src/cli.ts` with `SKILL_LAB_SKILLS_ROOT` set to the plugin root (this repository).
