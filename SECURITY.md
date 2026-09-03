# Security Policy

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

Report security vulnerabilities privately through:

- [GitHub Security Advisories](https://github.com/oyinlola-tech/zudo/security/advisories)

If you are unable to use GitHub Security Advisories, please use the dedicated security contact listed in the repository settings rather than opening a public issue.

## What to Report

Security vulnerabilities include, but are not limited to:

- Remote code execution
- Authentication bypass
- Authorization bypass
- Privilege escalation
- SQL injection
- Command injection
- Path traversal
- Prototype pollution
- HTTP request smuggling
- HTTP response splitting
- Header injection
- Server-side request forgery (SSRF)
- Cross-site scripting (XSS) caused by Zudo APIs
- Cross-site request forgery (CSRF) vulnerabilities
- Insecure deserialization
- Cryptographic weaknesses
- Secret leakage
- Sensitive information disclosure
- Session or token compromise
- Race conditions affecting authorization
- Tenant isolation failures
- Permission bypasses
- Transaction integrity failures
- Improper input validation
- Denial of service caused by malicious input
- Memory exhaustion
- Resource exhaustion
- Sandbox escape
- Unsafe plugin execution

Not every bug qualifies as a security vulnerability. Issues that do not create a meaningful security impact for Zudo users may be better handled as regular bug reports or feature requests.

## Security-Sensitive Components

Security testing and review are particularly valuable for the following packages:

- `@zudolib/http`
- `@zudolib/crypto`
- `@zudolib/security`
- `@zudolib/serialization`
- `@zudolib/storage`
- `@zudolib/rpc`
- `@zudolib/permissions`
- `@zudolib/transactions`
- `@zudolib/tenancy`
- `@zudolib/plugins`
- `@zudolib/runtime`
- `@zudolib/database`
- `@zudolib/auth`
- `@zudolib/validation`
- `@zudolib/queue`
- `@zudolib/messaging`

This does not mean every bug in these packages is automatically a vulnerability. It indicates where security review is especially important.

## Supported Versions

| Version              | Supported   |
| -------------------- | ----------- |
| Latest stable        | Yes         |
| Previous stable      | Yes         |
| Older versions       | No          |
| Development versions | Best effort |

## Vulnerability Assessment

Security issues may be evaluated using CVSS or an equivalent risk assessment methodology.

Severity may consider:

- Impact
- Exploitability
- Required privileges
- Required user interaction
- Attack complexity
- Affected environments
- Confidentiality impact
- Integrity impact
- Availability impact

## Responsible Disclosure

Please allow maintainers reasonable time to investigate and remediate a confirmed vulnerability before publicly disclosing technical details.

Coordinated disclosure is preferred. Maintainers will work with reporters to establish a reasonable disclosure timeline.

## Safe Security Testing

Security testing should be performed against systems and environments for which the tester has explicit authorization.

Do not access, modify, delete, or disclose data belonging to other users.

Do not intentionally disrupt production services.

## Handling Sensitive Information

Please remove passwords, API keys, access tokens, private keys, database credentials, personal information, and other sensitive information from vulnerability reports whenever possible.

Do not include secrets, private infrastructure details, or internal attack procedures in reports.

## Disclosure Process

Security reports are reviewed privately.

Once a vulnerability is confirmed, the maintainers will:

1. Assess the severity and impact.
2. Identify affected versions.
3. Develop and test a fix.
4. Prepare a security advisory when appropriate.
5. Release the patched version.
6. Publish disclosure information after affected users have had a reasonable opportunity to upgrade.

## Security Advisories

Security advisories will be published through:

- GitHub Security Advisories
- GitHub Releases
- CHANGELOG
- Project documentation

GitHub Security Advisories are the primary source for security-related announcements.

## Dependency Security

Zudo depends on third-party packages and runtime components.

Security vulnerabilities in dependencies may affect Zudo even when the vulnerable code is not maintained by the Zudo project.

Dependency security issues are evaluated based on whether the affected dependency is reachable through Zudo and whether the vulnerability creates a meaningful security impact for Zudo users.

## Security Design Principles

Zudo is designed with the following security principles:

- Secure by default
- Least privilege
- Explicit trust boundaries
- Input validation
- Output encoding
- Fail closed
- Defense in depth
- Dependency minimization
- No implicit credential handling
- No secret logging
- Deterministic security behavior
- Tenant isolation
- Explicit authorization
- Safe error handling
- Resource limits
