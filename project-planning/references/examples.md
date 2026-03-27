# Additional Examples

Examples below are preserved from the main SKILL.md for reference; the skill body keeps exactly three examples (Initialize workflow, Shard PRD, Create story).

---

**Example: Create epic**
```
User: "Create an epic for authentication"
→ Invokes CreateEpic workflow
→ Uses EpicTemplate.md
→ Creates Epic-Authentication.md
```

**Example: Cleanup prompt files**
```
User: "Clean up prompt files after populating epics"
→ Invokes CleanupPrompts workflow
→ Scans all epics and stories
→ Removes .prompt.md files for fully populated items
→ Preserves prompts for items with remaining TODOs
```
