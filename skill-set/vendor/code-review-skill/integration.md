# code-review-skill — skill-set integration

Read this file when **code-review-skill** (YAML `name: code-review-excellence`) is active or attached.

## Load order

1. Upstream `code-review-skill/SKILL.md` and its `reference/` guides (authoritative review process).
2. This sidecar: `skill-set/vendor/code-review-skill/skill-escalation.md` (ecosystem boundaries).
3. Optional: `skill-set/catalog/third-party-skills.json` for upstream URL and last sync.

## Upstream updates

From the skills root (`~/.claude/skills`):

```powershell
cd code-review-skill
git fetch origin
git merge origin/main
# Record new HEAD in catalog/third-party-skills.json -> last_synced_commit
```

If tracked as a **git submodule** in `user-skills`:

```powershell
git submodule update --remote code-review-skill
```

## Lint expectations

Vendor profile (see `skill-set/references/vendor-skills.md`): folder `code-review-skill` vs YAML `code-review-excellence`, `reference/` vs `references/`, and root `README.md` are accepted exceptions—do not “fix” them on pull unless you maintain a fork.
