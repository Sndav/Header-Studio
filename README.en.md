# Header Studio

[中文](README.md) · **English**

[GitHub repository](https://github.com/Sndav/Header-Studio) · [Download the latest release](https://github.com/Sndav/Header-Studio/releases/latest)

A privacy-first, fully open-source Chrome extension for modifying request and response headers. Organize rules into multiple profiles and match URLs with host wildcards or RE2 regular expressions.

**Your configuration stays local. There is no telemetry, analytics SDK, remote code, or server receiving your browsing data.**

![Header Studio changing the User-Agent header](docs/images/header-studio-demo.png)

## Why Header Studio

- **Privacy first:** configuration is stored only in `chrome.storage.local`.
- **Zero telemetry:** no installation, click, visited-site, rule-content, or error tracking.
- **Auditable source:** MIT-licensed code that you can inspect and build yourself.
- **No page injection:** no content scripts and no access to page DOM.
- **Native Chrome rules:** header changes use Manifest V3 `declarativeNetRequest`.

## Features

- Modify request and response headers
- `Set`, `Append`, and `Remove` operations
- Run multiple profiles at once or pause them individually
- Match hosts, wildcards, complete URLs, or Chrome RE2 regular expressions
- Suggestions for common header names
- One-click Chinese/English UI with a persisted language preference
- Visible validation and rule synchronization errors
- WCAG AA contrast, visible focus states, and keyboard support

## Installation

### Install from a release

1. Open [Releases](https://github.com/Sndav/Header-Studio/releases).
2. Download and extract the latest `header-studio-v*.zip`.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Select **Load unpacked** and choose the extracted directory.

Each release also includes a fixed-key signed `.crx` package and SHA-256 checksums. Chrome Stable normally blocks CRX installation outside the Chrome Web Store, so the CRX is intended for Chromium builds or enterprise environments that permit offline extensions. Regular Chrome users should use the ZIP method above.

### Build from source

Node.js 20.19 or newer is required.

```bash
git clone https://github.com/Sndav/Header-Studio.git
cd ModHeader
npm ci
npm run build
```

Then:

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the generated `dist/` directory.
5. Pin Header Studio to the browser toolbar.

## Usage

### 1. Create a profile

Click the `+` beside the profile search field. A profile groups URL matchers and header modifications. Multiple enabled profiles can run at the same time.

### 2. Configure URL / host matching

A profile may contain multiple matchers. They use OR semantics:

| Input | Matches |
| --- | --- |
| `*` | Every HTTP and HTTPS URL |
| `*.example.com` | `example.com` and all of its subdomains |
| `api.example.com` | The exact host on any port |
| `https://example.com/api/*` | A complete URL wildcard |
| `^https://api\.example\.com/` | A Chrome RE2 regular expression |

Chrome validates every regular expression before rules are replaced. Unsupported RE2 syntax leaves the previous valid rules active and displays the failure reason.

### 3. Add headers

Select `Request headers` or `Response headers`, click **Add header**, and choose an operation:

- `Set`: set the header, replacing an existing header with the same name.
- `Append`: append a value. Chrome restricts some headers and displays a sync error if it rejects an operation.
- `Remove`: remove the header; no value is required.

The name field suggests common headers but accepts any header Chrome permits.

### 4. Enable or pause rules

- The switch beside a profile controls the entire profile.
- The checkbox before a matcher or header controls only that row.
- The top bar shows how many dynamic rules have been synchronized to Chrome.

### 5. Change language

Use the `EN` / `中文` button in the top bar. The preference is stored locally with your profiles.

## Privacy and permissions

Header Studio has no backend service. Normal operation does not connect to the project author or a third-party server.

| Permission | Why it is needed | What it does not do |
| --- | --- | --- |
| `storage` | Store profiles, rules, and language locally | Does not sync data to the author |
| `declarativeNetRequest` | Let Chrome modify headers natively | Does not read page DOM |
| `<all_urls>` | Allow user-created rules to match any site | Does not record or upload browsing history |

The project explicitly contains no:

- Telemetry or usage analytics
- Advertising, profiling, or fingerprinting
- Remote scripts, downloaded code, or CDN runtime dependencies
- Content scripts or page DOM access
- Cloud profile synchronization or account system

Review all permissions in [`public/manifest.json`](public/manifest.json) and the complete rule synchronization path in [`src/background.ts`](src/background.ts).

## Development and verification

```bash
npm run typecheck
npm test
npm run build
```

GitHub Actions runs type checking, tests, and a production build for every commit and pull request. Pushing a `v*` tag automatically creates a GitHub Release with a ZIP, a fixed-key signed CRX, and SHA-256 checksums for both.

## License

Header Studio is open source under the [MIT License](LICENSE). Code audits, issues, pull requests, and independent builds are welcome.
