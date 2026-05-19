# Additional examples

Resolve backlog SSOT first: [SKILL.md § Delivery tracker](../SKILL.md#delivery-tracker-ssot). Examples below assume `delivery_tracker: files` unless noted.

---

**Create epic**

```
User: "Create an epic for authentication"
→ CreateEpic workflow + EpicManager --action create
→ Epic file under manifest epics_dir (default Epics/)
```

**Manifest-based repo**

```
User: "Plan from docs in this service"
→ ScanSources.ts --root .
→ ShardFromSources or manual epics with traces_to → docs/...
→ LintPlan.ts --root .
```
