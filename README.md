# smartcors

[![npm version](https://img.shields.io/npm/v/smartcors.svg)](https://www.npmjs.com/package/smartcors)
[![npm downloads](https://img.shields.io/npm/dm/smartcors.svg)](https://www.npmjs.com/package/smartcors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A smart, secure, and environment-aware CORS wrapper for Express applications.

`smartcors` extends the official `cors` package with URL-level wildcard matching (`*.example.com`, `https://*.example.com`), protocol enforcement, regex patterns, custom matching functions, auto-localhost whitelisting in development, `.env` file support, and dual ESM/CommonJS compatibility.

---

## Features

- 🔒 **Secure by Default** — Cleanly rejects unauthorized origins without crashing Express or leaking credentials.
- 🌐 **Subdomain Wildcards** — Full support for `*.domain.com` and `https://*.domain.com`.
- 🔍 **Regex & Custom Functions** — Match origins using RegExp or custom predicate functions.
- 💻 **Automatic Localhost in Dev** — Automatically whitelists `localhost` and `127.0.0.1` ports when `NODE_ENV !== 'production'`.
- ⚙️ **Environment Variable Support** — Read comma-separated origins from `ALLOWED_ORIGINS` directly.
- 🚀 **Cloud-Aware** — Auto-detects deployment URLs (Vercel, Render, Railway).
- 📦 **Dual ESM & CommonJS** — First-class support for both `import` and `require()`.
- 📘 **TypeScript Ready** — Includes complete TypeScript type definitions out of the box.
- ⚡ **Zero Bloat** — Lightweight and depends only on official `cors`.

---

## Installation

```bash
npm install smartcors
```
```bash
yarn add smartcors
```
```bash
pnpm add smartcors
```

---

## Quick Start

### ESM (`import`)
```javascript
import express from "express";
import smartcors from "smartcors";

const app = express();

app.use(
  smartcors({
    allowedOrigins: ["https://myapp.com", "*.mydomain.com"],
    allowCredentials: true,
  })
);

app.get("/api/data", (req, res) => {
  res.json({ message: "CORS configured successfully" });
});

app.listen(5000);
```

### CommonJS (`require`)
```javascript
const express = require("express");
const smartcors = require("smartcors");

const app = express();
app.use(smartcors({ allowedOrigins: ["https://myapp.com"] }));
```

---

## Advanced Usage

### 1. Mixed Origin Rules (Exact, Wildcard, Regex, and Functions)
```javascript
app.use(
  smartcors({
    allowedOrigins: [
      // Exact match
      "https://dashboard.example.com",

      // Subdomains + Apex domain (matches https://api.example.com and https://example.com)
      "https://*.example.com",

      // Regular expression
      /^https:\/\/.*\.myinternal\.net$/,

      // Custom matching function
      (origin, parsedUrl) => origin.startsWith("https://admin."),
    ],
    allowCredentials: true,
  })
);
```

### 2. Environment Variables (`ALLOWED_ORIGINS`)
You can store your production domains in your `.env` file:

```env
ALLOWED_ORIGINS=https://myapp.com, https://admin.myapp.com, https://*.myapp.com
```

In your application code:
```javascript
app.use(smartcors()); // Automatically loads and parses process.env.ALLOWED_ORIGINS
```

Or specify a custom environment variable name:
```javascript
app.use(
  smartcors({
    envKey: "FRONTEND_URLS",
  })
);
```

### 3. Localhost Development Configuration
In non-production environments (`NODE_ENV !== "production"`), `smartcors` automatically whitelists standard development ports on `http://localhost` and `http://127.0.0.1` (`3000`, `5173`, `5174`, `8000`, `8080`, `4200`).

To customize or disable this:
```javascript
app.use(
  smartcors({
    autoLocalhost: true,
    localhostPorts: [3000, 4000, 8080], // specify custom dev ports
  })
);

// Or disable localhost whitelisting completely:
app.use(smartcors({ autoLocalhost: false }));
```

### 4. Standalone Origin Matcher (`matchOrigin`)
You can also import and use the origin matching utility directly:

```javascript
import { matchOrigin } from "smartcors";

matchOrigin("https://api.example.com", ["*.example.com"]); // true
matchOrigin("https://example.com", ["https://*.example.com"]); // true
matchOrigin("http://api.example.com", ["https://*.example.com"]); // false (protocol mismatch)
matchOrigin("https://evil.com", ["*.example.com"]); // false
```

---

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `allowedOrigins` | `(string \| RegExp \| Function)[]` | `[]` | List of allowed origin rules (exact strings, wildcards, regex, functions). |
| `allowCredentials` | `boolean` | `false` | Enables `Access-Control-Allow-Credentials`. |
| `autoLocalhost` | `boolean` | `NODE_ENV !== 'production'` | Auto-whitelists `localhost` and `127.0.0.1` dev ports. |
| `localhostPorts` | `number[]` | `[3000, 5173, 5174, 8000, 8080, 4200]` | Ports to whitelist in development. |
| `allowEnvOrigins` | `boolean` | `true` | Reads comma-separated origins from environment variables. |
| `envKey` | `string` | `"ALLOWED_ORIGINS"` | Environment variable key to read origins from. |
| `autoDeployUrls` | `boolean` | `true` | Automatically detects `VERCEL_URL`, `RENDER_EXTERNAL_URL`, `RAILWAY_PUBLIC_DOMAIN`. |
| `blockWithError` | `boolean` | `false` | When `true`, throws an Error into `next(err)`. When `false`, cleanly rejects origin. |
| `debug` | `boolean` | `false` | Enables verbose console logging for debugging. |
| `methods` | `string \| string[]` | `["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]` | Allowed HTTP methods. |
| `allowedHeaders` | `string \| string[]` | `["Content-Type", "Authorization", "X-Requested-With"]` | Allowed HTTP headers for preflight requests. |
| `exposedHeaders` | `string \| string[]` | `undefined` | Response headers exposed to browsers. |
| `maxAge` | `number` | `undefined` | Preflight cache time in seconds (`Access-Control-Max-Age`). |
| `optionsSuccessStatus` | `number` | `204` | Status code for successful `OPTIONS` preflight requests. |

---

## Testing

```bash
npm test
```

Runs comprehensive unit and integration tests across ESM and CommonJS modules using Node's native test runner (`node --test`).

---

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/Ajith66310/smartcors).

## License

MIT © [Ajith k v](https://github.com/Ajith66310)
