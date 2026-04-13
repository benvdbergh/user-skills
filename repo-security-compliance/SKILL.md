---
name: repo-security-compliance
description: Assesses and improves repository security compliance for GitHub repositories by validating SECURITY.md quality, vulnerability disclosure operations, Dependabot and code scanning coverage, secret scanning and push protection, branch protection controls, and OpenSSF Scorecard governance. Use when creating or auditing repository security baselines and secure repository operations.
---

# repo-security-compliance

## Scope

This skill covers SECURITY.md quality, vulnerability disclosure flow, Dependabot and code scanning, secret scanning and push protection, branch protection controls, and Scorecard governance.

## Files

- `references/security-baseline-github.md`
- `references/security-policy-and-disclosure.md`
- `references/dependency-and-code-scanning.md`
- `references/openssf-scorecard-operations.md`
- `assets/SECURITY-template.md`
- `assets/security-baseline-checklist.md`
- `scripts/security_baseline_audit.py`

## Sources

- https://docs.github.com/en/github/managing-security-vulnerabilities/adding-a-security-policy-to-your-repository
- https://docs.github.com/code-security/security-advisories/working-with-repository-security-advisories/configuring-private-vulnerability-reporting-for-a-repository
- https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/about-repository-security-advisories
- https://docs.github.com/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates
- https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning
- https://docs.github.com/en/code-security/concepts/secret-security/about-push-protection
- https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- https://raw.githubusercontent.com/ossf/scorecard/main/docs/checks.md
- https://scorecard.dev/
- https://csrc.nist.gov/pubs/sp/800/218/final
- https://www.iso.org/standard/72311.html
- https://www.iso.org/standard/69725.html
- https://www.first.org/standards/frameworks/psirts/psirt_services_framework
