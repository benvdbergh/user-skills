# Search-Plan-Implement Workflow

Main minimalist coding workflow enforcing YAGNI principles and two-phase execution.

## When to Use

- User requests: "implement", "code", "add feature", "modify"
- Any coding task requiring code changes
- Feature implementation from stories

## Workflow Steps

### Phase 1: Architect (Planner)

1. **Search Codebase**
   - Use `GrepSymbol` to find existing functions/classes
   - Use semantic search for related functionality
   - Document all relevant existing code

2. **Analyze Dependencies**
   - Use `GetDependencies` for each candidate function
   - Assess impact of modification
   - Determine if editing is safe

3. **Create Diff Plan**
   - Apply YAGNI hierarchy: Locate → Modify → Create
   - Output structured plan:
     ```json
     {
       "action": "modify" | "create",
       "file": "path/to/file.ts",
       "lines": { "start": 20, "end": 30 },
       "rationale": "Why this approach",
       "dependencies": ["function1", "function2"]
     }
     ```

4. **Validate Plan**
   - Check if plan follows YAGNI hierarchy
   - Verify no unnecessary new files
   - Ensure minimal code delta

### Phase 2: Scripter (Executor)

1. **Execute Diff Plan**
   - Use `MinimalDiffApply` for modifications
   - Create new files only if plan specifies
   - Follow exact line ranges from plan

2. **Run Tests**
   - Execute test suite
   - If failure: trigger automatic rollback
   - If success: proceed to refactor

3. **Trigger Refactor Pass**
   - After test success, run `RefactorPass` workflow
   - Remove dead code, simplify logic
   - Verify quality gates

## Integration

- Uses `VersionControl` skill for rollback
- Integrates with `CodeQualityGate` for validation
- Works with `ProjectPlanning` stories

## Output

- Modified or created files following minimal diff plan
- Refactored code with dead code removed
- Quality gate validation report
