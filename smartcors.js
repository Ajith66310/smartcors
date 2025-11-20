import cors from "cors";

/**
 * Match origin helper
 */
export function matchOrigin(origin, allowed) {
  if (!origin) return false;

  for (const rule of allowed) {
    // Exact match
    if (rule === origin) return true;

    // Wildcard: *.example.com
    if (typeof rule === "string" && rule.startsWith("*.")) {
      const domain = rule.slice(2);
      if (origin.endsWith("." + domain)) return true;
    }

    // Regex
    if (rule instanceof RegExp && rule.test(origin)) return true;
  }

  return false;
}

/**
 * Fully dynamic smart CORS middleware
 */
export default function smartcors(options = {}) {
  const { allowedOrigins = [], allowCredentials = false, debug = false } = options;

  let allAllowed = [...allowedOrigins];

  // Auto localhost in dev
  if (process.env.NODE_ENV !== "production") {
    allAllowed.push("http://localhost:3000", "http://localhost:5173", "http://localhost:5174");
  }

  // Auto detect Vercel deployment URL
  if (process.env.VERCEL_URL) {
    allAllowed.push(`https://${process.env.VERCEL_URL}`);
  }

  // Auto detect Render deployment URL
  if (process.env.RENDER_EXTERNAL_URL) {
    allAllowed.push(`https://${process.env.RENDER_EXTERNAL_URL}`);
  }

  return cors({
    origin: function (origin, callback) {
      // Allow server-to-server requests (no origin)
      if (!origin) return callback(null, true);

      // Dynamic whitelisting: if origin matches allowedOrigins/wildcards, allow
      if (matchOrigin(origin, allAllowed)) {
        return callback(null, true);
      }

      // Dynamic runtime: automatically add first frontend origin that hits the server
      if (process.env.NODE_ENV === "production" && !allAllowed.includes(origin)) {
        if (debug) console.log(`[smartcors] Adding dynamic origin → ${origin}`);
        allAllowed.push(origin);
        return callback(null, true);
      }

      if (debug) console.log("[smartcors] Blocked origin →", origin);
      callback(new Error("Not allowed by smartcors"));
    },
    credentials: allowCredentials === true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  });
}


/**
 * @typedef {Object} SmartCORSOptions
 * @property {(string|RegExp)[]} [allowedOrigins]
 * @property {boolean} [allowCredentials]
 * @property {boolean} [debug]
 */

/**
 * @param {SmartCORSOptions} options
 * @returns {import("express").RequestHandler}
 */
