const cors = require("cors");
const { matchOrigin } = require("./matcher.cjs");

/**
 * Fully configurable, secure, environment-aware CORS middleware for Express (CommonJS).
 *
 * @param {object} [options={}]
 * @returns {Function}
 */
function smartcors(options = {}) {
  const {
    allowedOrigins = [],
    origins = allowedOrigins,
    allowCredentials = false,
    credentials = allowCredentials,
    autoLocalhost = process.env.NODE_ENV !== "production",
    localhostPorts = [3000, 5173, 5174, 8000, 8080, 4200],
    allowEnvOrigins = true,
    envKey = "ALLOWED_ORIGINS",
    autoDeployUrls = true,
    blockWithError = false,
    debug = false,
    methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders = ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus = 204,
    ...extraCorsOptions
  } = options;

  const resolvedRules = [...(Array.isArray(origins) ? origins : [origins].filter(Boolean))];

  // 1. Parse origins from environment variable
  if (allowEnvOrigins && process.env[envKey]) {
    const envOrigins = process.env[envKey]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    resolvedRules.push(...envOrigins);
  }

  // 2. Auto localhost & 127.0.0.1 in development
  if (autoLocalhost) {
    for (const port of localhostPorts) {
      resolvedRules.push(`http://localhost:${port}`);
      resolvedRules.push(`http://127.0.0.1:${port}`);
    }
  }

  // 3. Auto detect common cloud provider deployment URLs
  if (autoDeployUrls) {
    if (process.env.VERCEL_URL) {
      resolvedRules.push(`https://${process.env.VERCEL_URL}`);
    }
    if (process.env.RENDER_EXTERNAL_URL) {
      resolvedRules.push(`https://${process.env.RENDER_EXTERNAL_URL}`);
    }
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      resolvedRules.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
  }

  return cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (matchOrigin(origin, resolvedRules)) {
        if (debug) {
          console.log(`[smartcors] Allowed origin → ${origin}`);
        }
        return callback(null, true);
      }

      if (debug) {
        console.warn(`[smartcors] Blocked origin → ${origin}`);
      }

      if (blockWithError) {
        return callback(new Error(`[smartcors] Origin not allowed: ${origin}`));
      }

      return callback(null, false);
    },
    credentials: Boolean(credentials),
    methods,
    allowedHeaders,
    optionsSuccessStatus,
    ...extraCorsOptions,
  });
}

smartcors.matchOrigin = matchOrigin;
smartcors.smartcors = smartcors;
smartcors.default = smartcors;

module.exports = smartcors;
