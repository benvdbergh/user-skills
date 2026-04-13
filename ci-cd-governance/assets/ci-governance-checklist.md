# CI Governance Checklist

Use this checklist during workflow PR review.

## Reuse and Structure
- [ ] Shared CI logic is centralized in reusable workflows.
- [ ] Reusable workflows use `workflow_call` with typed inputs.
- [ ] Caller workflows reference reusable workflows by local path or pinned SHA.
- [ ] Workflow and job names are stable and reviewable.

## Security and Integrity
- [ ] Workflow declares baseline `permissions`.
- [ ] Elevated permissions are only job-scoped and justified.
- [ ] Third-party actions are pinned to full commit SHAs.
- [ ] Untrusted input is not injected directly into shell scripts.
- [ ] Workflow changes require code owner approval.
- [ ] Secret handling avoids plaintext exposure and broad inheritance.

## Branch and Required Checks
- [ ] Required checks catalog exists for each protected branch/ruleset.
- [ ] Required check job names are globally unique.
- [ ] Required-check workflows trigger on `pull_request`.
- [ ] Merge queue repos include `merge_group` in required-check workflows.
- [ ] Filter rules do not skip required checks for normal PR paths.

## Performance and Cost
- [ ] Matrix dimensions are intentional, not accidental fan-out.
- [ ] `max-parallel` and `fail-fast` are configured for bounded execution.
- [ ] Caching keys include lockfile hash and runner dimension.
- [ ] Cache paths exclude secrets and unnecessary files.
- [ ] Artifact retention is explicitly set (`retention-days`) per artifact class.
- [ ] CI spend tracking (minutes/storage) and budget alerts are configured.

## Audit and Evidence
- [ ] Automated workflow audit has been run.
- [ ] Findings are attached to PR or governance report.
- [ ] Exceptions are documented with owner and review date.
