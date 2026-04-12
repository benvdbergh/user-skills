# Dependencies

## Optional workflow dependencies

WorkflowInit and other project-planning workflows assume **StateManagement** and **VersionControl** when available.

- **StateManagement** – Used to track planning decisions, state, and knowledge map (e.g. epic/story relationships). If not available: skip state-update steps or record decisions only in artifacts; note in output that state tracking was skipped.
- **VersionControl** – Used to version planning artifacts (brief, Epics/, Stories/). If not available: still create and update files; note that version control was not applied and recommend the user commit manually if desired.

These steps are **optional** for the planning workflows to complete; the agent can produce a full project layout and epic/story files without them.

## Other skills

**research-analysis** may still use `CleanupPrompts` and `DocumentationUtils` for topic/research notes; that path is unrelated to project-planning work items.
