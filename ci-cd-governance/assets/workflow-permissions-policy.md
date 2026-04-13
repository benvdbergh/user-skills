# Workflow Permissions Policy

## Policy Statement
All GitHub Actions workflows must follow least privilege by default and grant elevated permissions only to the smallest scope (single job) that needs them.

## Baseline
- Set workflow-level permissions to minimal read access:
  - `permissions: read-all`, or
  - explicit scopes such as `contents: read`
- Do not set write scopes at workflow level unless all jobs require them.

## Allowed Job-Level Elevations
- `pull-requests: write` only for jobs that comment, label, or update PR metadata.
- `packages: write` only for publishing jobs.
- `id-token: write` only for OIDC federation jobs.
- `security-events: write` only for code scanning SARIF upload.
- `contents: write` only for controlled release/versioning jobs.

## Governance Rules
1. Every workflow must declare `permissions`.
2. Every write permission must include a rationale in workflow comments or docs.
3. No broad write permissions in untrusted code paths (for example, external fork PR execution).
4. Reusable workflows must not silently expand caller permission scope.
5. Permission changes in workflow files require owner approval.

## Example
```yaml
permissions:
  contents: read

jobs:
  publish:
    permissions:
      contents: write
      packages: write
```

## Related Sources
- https://docs.github.com/en/actions/security-guides/automatic-token-authentication#modifying-the-permissions-for-the-github_token
- https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#permissions
- https://docs.github.com/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
