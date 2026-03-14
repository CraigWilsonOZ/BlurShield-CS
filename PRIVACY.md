# Privacy Policy

**BlurShield** is committed to protecting your privacy. This policy explains what data the extension accesses and how it is handled.

## Data Collection

BlurShield does **not** collect, transmit, store, or share any user data with external servers. The extension operates entirely within your browser.

- No analytics or telemetry
- No tracking pixels or cookies
- No network requests to external services
- No user accounts or sign-ins

## Data Storage

All configuration is stored locally in your browser using `chrome.storage.local`. This includes:

- Enabled/disabled state and category toggles
- Bypass list (sites excluded from masking)
- Personal info entries (emails, IP addresses)
- Custom patterns (keywords and regex)
- Preferences (blur intensity, reveal on hover)

This data never leaves your browser. It is not synced to any cloud service.

## Data Access

BlurShield reads web page content (DOM text nodes and input field values) solely to identify and blur sensitive patterns. This content is:

- Processed entirely in-memory within the browser tab
- Never copied, logged, recorded, or transmitted
- Never stored beyond the lifetime of the page

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Save your settings locally in the browser |
| `activeTab` | Read the current tab URL to support per-site toggling |
| `scripting` | Required by Manifest V3 for content script functionality |
| `webNavigation` | Notify all frames (including iframes) when settings change |

## Third-Party Services

BlurShield does not integrate with or send data to any third-party services.

## Changes to This Policy

Any changes to this privacy policy will be documented in the [CHANGELOG](CHANGELOG.md) and reflected in this file.

## Contact

If you have questions about this privacy policy, please open an issue on [GitHub](https://github.com/CraigWilsonOZ/BlurShield/issues) or email **me  @ craigwilson.blog**.
