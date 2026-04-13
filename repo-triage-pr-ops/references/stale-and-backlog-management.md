# Stale and Backlog Management

Related: `../SKILL.md`, `triage-sla-and-label-taxonomy.md`

## When To Load

Load when defining inactivity policy, warning windows, auto-close behavior, and backlog review cadence.

## Policy Goals

- Preserve contributor trust with clear warning and reopen paths.
- Keep active queues actionable by limiting long-idle noise.
- Avoid closing issues blocked by maintainer-side action.

## Recommended Baseline

- Mark stale after 30 to 60 days of no activity.
- Close 7 to 14 days after stale warning if still inactive.
- Use clear comments that explain how to keep an item open.
- Reopen when new evidence arrives, even after auto-close.

## Exemptions and Safeguards

- Never auto-close: `security`, `priority:p0`, `status:accepted`, `status:in-progress`.
- Usually exempt: `pinned`, `release-blocker`, `good first issue` (project dependent).
- Do not stale if a maintainer requested action and has not yet followed up.
- Add "maintainer-owned next step due by <date>" when deferring closure.

## Recommended Automation Tooling

- Primary: `actions/stale` on scheduled GitHub Actions runs.
- Maintenance check: pin major version (for example `actions/stale@v10`) and review release notes quarterly.
- Keep `operations-per-run` explicit for larger repositories to avoid partial sweeps.

## Workflow Example

```yaml
name: stale
on:
  schedule:
    - cron: "17 2 * * *"
  workflow_dispatch:

jobs:
  stale:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write
    steps:
      - uses: actions/stale@v10
        with:
          days-before-issue-stale: 45
          days-before-issue-close: 10
          days-before-pr-stale: -1
          days-before-pr-close: -1
          stale-issue-label: "status:stale"
          exempt-issue-labels: "security,priority:p0,status:accepted,status:in-progress,pinned"
          operations-per-run: 200
```

## Backlog Review Cadence

- Weekly: review `status:triage-needed` older than SLA.
- Biweekly: review `status:needs-info` near timeout.
- Monthly: review stale exemptions and label drift.

## No-Gos

- Auto-closing without warning comment and grace period.
- Closing high-priority or accepted work through stale automation.
- Treating stale closure as rejection; always allow recovery path.

## Source Links

- [GitHub Docs: Closing inactive issues](https://docs.github.com/en/actions/managing-issues-and-pull-requests/closing-inactive-issues)
- [GitHub Marketplace: actions/stale](https://github.com/marketplace/actions/close-stale-issues)
- [actions/stale repository](https://github.com/actions/stale)
- [Open Source Guides: Best practices for maintainers](https://opensource.guide/best-practices/)
