# E2E flake triage checklist

1. **Reproduce locally** with `--repeat-each=10` or UI mode; capture trace.
2. **Classify:**
   - Race / missing await / wrong assertion API
   - Shared state / parallel collision
   - Env data drift / third-party dependency
   - Real product bug (not a flake—fix the product + add lower-level test)
3. **Fix preference order:** correct wait/assert → isolate data → mock third party → serialize only if necessary → demote test → delete.
4. **Quarantine** only with owner, ticket, and expiry; never permanent silent skip.
5. **After E2E found a bug:** add unit/integration coverage that keeps it dead, then keep or thin the journey test.
