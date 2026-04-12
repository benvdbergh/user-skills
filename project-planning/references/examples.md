# Additional examples

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
