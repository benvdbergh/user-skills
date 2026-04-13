# GitHub Actions Security Hardening Reference

## Threat Model Summary
GitHub Actions is privileged execution infrastructure. Security risks include secret leakage, script injection, compromised third-party actions, and over-scoped tokens.

## Required Controls
1. Least privilege token policy:
   - Default `GITHUB_TOKEN` permissions to read-only wherever possible.
   - Elevate only per job and only for required scopes.
2. Pin actions to full commit SHA:
   - Use immutable SHAs, not floating tags, for third-party actions.
3. Secure untrusted input handling:
   - Do not interpolate untrusted contexts directly in shell scripts.
   - Pass values through environment variables or purpose-built actions.
4. Secrets hygiene:
   - Store secrets in GitHub secrets or environments.
   - Mask non-secret sensitive values using `::add-mask::`.
   - Rotate compromised or exposed credentials immediately.
5. Workflow change control:
   - Require code owner review on `.github/workflows/**`.
6. Prefer OIDC over long-lived cloud credentials.

## Additional Governance Guidance
- Restrict `pull_request_target` usage to vetted cases.
- Use dependency review and Dependabot to track vulnerable actions.
- Limit self-hosted runner exposure, especially for untrusted PR contexts.

## Source Links
- https://docs.github.com/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- https://docs.github.com/en/actions/security-guides/automatic-token-authentication#modifying-the-permissions-for-the-github_token
- https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#masking-a-value-in-a-log
- https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
