# Security Policy

Truth World is a public-interest reader prototype. Please treat provider
credentials, write eligibility, and source integrity as sensitive.

## Supported versions

Security reports should target the current `main` branch once the repository is
published.

## Reporting a vulnerability

Before a public repository is connected, report issues privately to the project
maintainer. After GitHub setup, replace this section with the repository's
private security advisory or contact channel.

Please include:

- affected file or endpoint,
- reproduction steps,
- expected impact,
- whether provider credentials, auth sessions, or write eligibility are involved.

Do not include real API keys, real phone numbers, session cookies, or private
partner payloads in public issues.

## Scope

In scope:

- secret exposure,
- auth/session bypass,
- write eligibility bypass,
- provider SSRF or unsafe URL handling,
- XSS or unsafe rendering,
- quota bypass on public routes,
- prompt-injection paths that can alter source attribution or verification status.

Out of scope for the prototype:

- unaffiliated third-party platform vulnerabilities,
- abuse reports that do not identify a technical bypass,
- requests for unofficial scraping or automated extraction.

