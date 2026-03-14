# Software Bill of Materials (SBOM)

> Last updated: 15/03/2026

## Project

| Field | Value |
| --- | --- |
| Name | `BlurShield` |
| Version | `1.0.0` |
| Platform | Chrome Extension (Manifest V3) |
| Licence | MIT |
| Build System | None (plain JavaScript, no bundler) |
| Repository | `github.com/CraigWilsonOZ/BlurShield` |

## Runtime Dependencies

BlurShield has **zero external runtime dependencies**. It is built entirely with plain JavaScript and Chrome Extension APIs.

| Package | Version | Purpose |
| --- | --- | --- |
| *(none)* | - | - |

## Chrome Extension APIs Used

| API | Permission | Purpose |
| --- | --- | --- |
| `chrome.storage.local` | `storage` | Persist settings, bypass list, custom patterns, preferences |
| `chrome.tabs` | `activeTab` | Query current tab URL for popup site toggle |
| `chrome.scripting` | `scripting` | Required by MV3 for content script functionality |
| `chrome.webNavigation` | `webNavigation` | Send messages to all frames when settings change |
| `chrome.runtime` | *(built-in)* | Message passing between popup, options, and content scripts |
| `chrome.action` | *(built-in)* | Toolbar badge and popup management |

## Web APIs Used

| API | Context | Purpose |
| --- | --- | --- |
| `MutationObserver` | Content script | Watch for DOM changes to scan new content |
| `TreeWalker` | Content script | Traverse text nodes for pattern matching |
| `requestAnimationFrame` | Content script | Batch DOM scans before browser paint |
| `URL` | Content script, popup | Parse hostnames for bypass checking |
| `Blob` / `URL.createObjectURL` | Options page | Export settings as JSON file |
| `FileReader` | Options page | Import settings from JSON file |

## Content Script Injection

| Scope | Value |
| --- | --- |
| Match patterns | `<all_urls>` |
| Run at | `document_start` |
| All frames | Yes |

## Development Dependencies

| Tool | Purpose |
| --- | --- |
| `scripts/package.sh` | Shell script to create distribution zip |
| `scripts/install.sh` | Shell script for local installation |
| `scripts/uninstall.sh` | Shell script to remove installed files |

## Container / CI

| Control | Status |
| --- | --- |
| GitHub Actions | Not configured |
| Docker | Not applicable |
| Dependabot | Not configured |
| Pre-commit hooks | Not configured |

## Supply Chain Controls

| Control | Implementation | Status |
| --- | --- | --- |
| No external dependencies | Plain JS, no npm/node_modules | ✅ Active |
| No remote code execution | No `eval`, `Function()`, `innerHTML`, or external script loading | ✅ Active |
| No data exfiltration | No network requests to external servers | ✅ Active |
| Import validation | Settings import validates schema, types, and rejects dangerous patterns | ✅ Active |
| CSP headers | Explicit Content-Security-Policy meta tags on all HTML pages | ✅ Active |
| ReDoS protection | Custom regex patterns validated for nested quantifiers and length limits | ✅ Active |
| Input sanitisation | Hostname inputs validated against strict regex pattern | ✅ Active |
| Manifest V3 | Uses MV3 service worker instead of MV2 background page (sandboxed) | ✅ Active |

## Licence Summary

BlurShield uses no third-party packages. The entire codebase is original work under the MIT licence.

> This SBOM is manually maintained. Review before each release.
