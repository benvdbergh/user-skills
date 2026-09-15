# Test smell checklist — unit-testing

| Smell | Prefer |
|-------|--------|
| Testing private methods via reflection | Test through public behavior; rethink API if needed |
| Excessive mocking | Fake or real collaborator at boundary; verify fewer interactions |
| Brittle snapshots of whole trees | Narrow contract asserts; intentional visual lane for UI pixels |
| Shared mutable fixture soup | Per-test arrange; factory helpers that return fresh state |
| Conditional logic in tests | Split cases into separate tests |
| Sleeping for async | Fake timers / await conditions / deterministic hooks |
| Duplicate E2E coverage | Keep one level; demote or delete |
| Asserting framework internals | Delete |
