# Changelog

All notable changes to BlurShield will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-03-15

### Added

- Manifest V3 Chrome extension with automatic sensitive data masking
- Pattern categories: Azure, AWS, GCP, OpenAI, Anthropic, emails, IP addresses, API keys, phone numbers, addresses, credit cards
- Custom pattern support (keywords and regex) via Options page
- Personal info protection (emails and IPs always masked)
- Toolbar popup with master toggle, per-site toggle, and category controls
- Options page with full configuration management
- Bypass list to exclude specific sites from masking
- Adjustable blur intensity (2-20px)
- Reveal on hover option
- Import/Export configuration as JSON
- Input and textarea field scanning
- Iframe support with ancestor origin detection
- MutationObserver with requestAnimationFrame batching
- Aggressive early rescans for SPA/lazy-loaded content
- Install, uninstall, and packaging scripts
