# Dependency and Code Scanning

Dependabot baseline:
- Dependabot alerts enabled
- Dependabot security updates enabled

Code scanning baseline:
- Code scanning enabled with CodeQL or SARIF
- Alert triage ownership defined

Secret scanning baseline:
- Secret scanning enabled
- Push protection enabled where available

Branch gate baseline:
- PR required
- review required
- status checks required
- force push blocked

Sources:
- https://docs.github.com/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates
- https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning
- https://docs.github.com/en/code-security/concepts/secret-security/about-push-protection
- https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
