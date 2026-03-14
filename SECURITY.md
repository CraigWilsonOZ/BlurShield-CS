# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in BlurShield, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email: **me @ craigwilson.blog**

Include the following in your report:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You can expect an acknowledgement within 48 hours and a detailed response within 7 days.

## Scope

BlurShield runs entirely in the browser as a Chrome extension. It does not:

- Transmit any data to external servers
- Collect analytics or telemetry
- Access data beyond what is needed for content masking

Security concerns most relevant to this project include:

- Pattern bypasses that allow sensitive data to remain visible
- DOM manipulation issues that could expose masked content
- Storage handling vulnerabilities that could leak user configuration
- Content script injection or escalation risks

## Supported Versions

| Version | Supported |
| ------- | --------- |
| Latest  | Yes       |

## Responsible Disclosure

We follow responsible disclosure practices. If a reported vulnerability is confirmed, we will:

1. Acknowledge the reporter
2. Develop and test a fix
3. Release a patched version
4. Credit the reporter (unless they prefer anonymity)
