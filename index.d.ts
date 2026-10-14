import type { RequestHandler } from "express";

/**
 * A rule for matching origins. Can be:
 * - Exact string URL (e.g. "https://example.com")
 * - Wildcard string (e.g. "*.example.com", "https://*.example.com", "http://localhost:*", "*")
 * - Regular expression (e.g. /^https:\/\/.*\.example\.com$/)
 * - Custom predicate function: (origin: string, parsedOrigin?: URL) => boolean
 */
export type OriginRule =
  | string
  | RegExp
  | ((origin: string, parsedOrigin?: URL) => boolean);

/**
 * Configuration options for smartcors()
 */
export interface SmartCORSOptions {
  /**
   * List of allowed origins.
   * Can contain exact URLs, wildcard subdomains, regular expressions, or predicate functions.
   */
  allowedOrigins?: OriginRule[];

  /**
   * Alias for allowedOrigins.
   */
  origins?: OriginRule[];

  /**
   * Enable support for credentials (cookies, authorization headers).
   * Maps to standard CORS `credentials: true`.
   * @default false
   */
  allowCredentials?: boolean;

  /**
   * Alias for allowCredentials.
   * @default false
   */
  credentials?: boolean;

  /**
   * Automatically whitelist common localhost and 127.0.0.1 ports in development
   * (active when `NODE_ENV !== "production"`).
   * @default true in development
   */
  autoLocalhost?: boolean;

  /**
   * Custom list of ports to whitelist for localhost and 127.0.0.1.
   * @default [3000, 5173, 5174, 8000, 8080, 4200]
   */
  localhostPorts?: number[];

  /**
   * Automatically parse allowed origins from an environment variable.
   * @default true
   */
  allowEnvOrigins?: boolean;

  /**
   * Environment variable name to read comma-separated origins from.
   * @default "ALLOWED_ORIGINS"
   */
  envKey?: string;

  /**
   * Automatically detect hosting deployment URLs (Vercel, Render, Railway).
   * @default true
   */
  autoDeployUrls?: boolean;

  /**
   * If true, blocked origins will call callback with an Error (triggering Express error handlers).
   * If false (recommended), blocked origins fail cleanly without setting CORS headers.
   * @default false
   */
  blockWithError?: boolean;

  /**
   * Enable verbose debug logs in console.
   * @default false
   */
  debug?: boolean;

  /**
   * Configures the Access-Control-Allow-Methods header.
   * @default ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
   */
  methods?: string | string[];

  /**
   * Configures the Access-Control-Allow-Headers header.
   * @default ["Content-Type", "Authorization", "X-Requested-With"]
   */
  allowedHeaders?: string | string[];

  /**
   * Configures the Access-Control-Expose-Headers header.
   */
  exposedHeaders?: string | string[];

  /**
   * Configures the Access-Control-Max-Age header in seconds.
   */
  maxAge?: number;

  /**
   * Pass the CORS preflight response to the next handler.
   * @default false
   */
  preflightContinue?: boolean;

  /**
   * HTTP status code to use for successful OPTIONS requests.
   * @default 204
   */
  optionsSuccessStatus?: number;

  /**
   * Any additional options passed directly to the underlying `cors` package.
   */
  [key: string]: any;
}

/**
 * Smart CORS middleware factory for Express applications.
 *
 * @example
 * ```ts
 * import express from "express";
 * import smartcors from "smartcors";
 *
 * const app = express();
 * app.use(smartcors({
 *   allowedOrigins: ["https://myapp.com", "*.example.com"],
 *   allowCredentials: true
 * }));
 * ```
 */
export default function smartcors(options?: SmartCORSOptions): RequestHandler;
export { smartcors };

/**
 * Tests an origin against a list of allowed rules (exact strings, wildcards, regex, functions).
 *
 * @example
 * ```ts
 * import { matchOrigin } from "smartcors";
 *
 * matchOrigin("https://api.example.com", ["*.example.com"]); // true
 * matchOrigin("https://example.com", ["https://*.example.com"]); // true
 * matchOrigin("http://evil.com", ["*.example.com"]); // false
 * ```
 */
export function matchOrigin(
  origin: string,
  allowedRules?: OriginRule[] | OriginRule
): boolean;
