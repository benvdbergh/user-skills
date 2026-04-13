# Triage SLA and Label Taxonomy

Related: `../SKILL.md`, `issue-forms-and-pr-templates.md`, `stale-and-backlog-management.md`

## When To Load

Load when defining status flow, labels, priority, response SLAs, and escalation.

## Label Axes

Apply one label from each axis to keep filtering deterministic.

### Type

- `type:bug`
- `type:feature`
- `type:docs`
- `type:question`
- `type:chore`

### Priority

- `priority:p0` critical outage/security/user-data risk
- `priority:p1` major regression or high impact
- `priority:p2` normal planned work
- `priority:p3` low urgency

### Status

- `status:triage-needed`
- `status:needs-info`
- `status:accepted`
- `status:in-progress`
- `status:blocked`
- `status:ready-for-review`
- `status:stale`

### Contribution and Queue Signals

- `good first issue`
- `help wanted`
- `duplicate`
- `invalid`
- `wontfix`

## SLA Baseline

- First maintainer response:
  - p0: 24h
  - p1: 48h
  - p2/p3: 5 business days
- `status:needs-info` timeout before close: 14 days.
- PR first review:
  - p0/p1: 48h
  - p2/p3: 5 business days

## Triage State Machine

1. New item starts at `status:triage-needed`.
2. Maintainer classifies `type:*`, `priority:*`, and owner/area.
3. If missing data, move to `status:needs-info` and ask explicit questions.
4. On adequate context, move to `status:accepted` or close (`duplicate`, `invalid`, `wontfix`).
5. During implementation, move to `status:in-progress`.
6. For PRs awaiting reviewer action, use `status:ready-for-review`.

## Reporting Metrics

- Median time to first maintainer response.
- SLA hit rate by priority tier.
- Open triage backlog count (`status:triage-needed` older than SLA).
- Needs-info auto-closure rate.

## No-Gos

- Multiple conflicting status labels on one item.
- Priority without explicit impact rationale.
- Reclassifying to stale while maintainer-owned action is pending.

## Source Links

- [GitHub Docs: Managing labels](https://docs.github.com/issues/using-labels-and-milestones-to-track-work/managing-labels)
- [GitHub Docs: Encouraging helpful contributions with labels](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/encouraging-helpful-contributions-to-your-project-with-labels)
- [Open Source Guides: Best practices for maintainers](https://opensource.guide/best-practices)
