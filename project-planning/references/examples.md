# Additional examples

Resolve backlog SSOT first, then load the platform file ([SKILL.md § Platform guides](../SKILL.md#platform-guides)). Examples below assume `delivery_tracker: files` unless noted.

---

**Create epic (files)**

```
User: "Create an epic for authentication"
→ CreateEpic → files-adoption.md → EpicManager --action create
→ Epic file under manifest epics_dir (default Epics/)
```

**Create themed outcome (Linear)**

```
User: "Create an epic for authentication"  (manifest: delivery_tracker: linear)
→ CreateEpic → linear-adoption.md
→ save_milestone on the Linear project (no Epic-*.md, no EPIC-n id)
```

**Manifest-based repo (files)**

```
User: "Plan from docs in this service"
→ ScanSources.ts --root .
→ ShardFromSources or manual epics with traces_to → docs/...
→ LintPlan.ts --root .
```
