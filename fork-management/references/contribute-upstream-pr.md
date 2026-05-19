# ContributeUpstreamPR

Prepare and submit fork improvements back to parent repository.

## Steps

1. Select candidate changes:
   - generally useful fixes/features,
   - minimal dependency on fork-only behavior.
2. Create a clean branch from latest upstream-compatible base.
3. Trim fork-specific noise from the PR branch.
4. Verify quality:
   - targeted tests,
   - lint/typecheck/build for affected areas.
5. Push branch to fork remote.
6. Open pull request to parent with clear motivation and test evidence.
7. Track PR in `FORK.md` contribution log.

## PR Hygiene Rules

- Keep scope narrow (single intent per PR).
- Explain "why parent should accept this" before implementation details.
- Include migration notes if behavior changes.
- Avoid leaking private fork-specific abstractions into parent PR.

## Suggested PR Body Structure

```markdown
## Summary
- Why this helps parent users/maintainers
- What behavior changes

## Implementation Notes
- Key technical choices
- Backward compatibility notes

## Verification
- Commands run
- Manual test steps

## Risks
- Potential regressions and mitigations
```

**Done when:** upstream PR exists, link/status recorded in `FORK.md`, and next follow-up date is set.
