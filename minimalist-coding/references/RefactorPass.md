# Refactor Pass Workflow

Mandatory post-implementation cleanup and optimization.

## When to Use

- After successful test execution
- Before marking implementation complete
- On explicit "refactor" or "cleanup code" request

## Workflow Steps

1. **Run LintAndShrink**
   - Remove unused imports
   - Remove dead variables
   - Simplify complex logic
   - Apply linting fixes

2. **Complexity Analysis**
   - Calculate cyclomatic complexity
   - Identify overly complex functions
   - Suggest simplifications

3. **Code Quality Gate**
   - Verify lint score maintained/improved
   - Check complexity thresholds
   - Validate no new files (unless justified)

4. **Generate Report**
   - Lines removed
   - Complexity reduction
   - Quality metrics

## Integration

- Uses `LintAndShrink` tool
- Uses `CodeQualityGate` tool
- Integrates with `VersionControl` for commit

## Output

- Refactored code with optimizations
- Quality gate report
- Metrics on code reduction

## Completion

Refactor pass is complete when LintAndShrink and CodeQualityGate have been run and the report shows no regressions.
