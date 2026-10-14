/**
 * matchOrigin - Secure, flexible URL origin matcher (CommonJS).
 *
 * @param {string} origin - The incoming Origin header string
 * @param {(string|RegExp|Function)[]|string|RegExp|Function} allowedRules - Whitelist rules
 * @returns {boolean}
 */
function matchOrigin(origin, allowedRules = []) {
  if (!origin || typeof origin !== "string") return false;

  const rules = Array.isArray(allowedRules)
    ? allowedRules
    : [allowedRules].filter(Boolean);

  if (rules.length === 0) return false;

  // Handle special Origin: null
  if (origin === "null") {
    return rules.includes("null");
  }

  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return false;
  }

  const originProtocol = parsedOrigin.protocol;
  const originHostname = parsedOrigin.hostname;
  const originPort = parsedOrigin.port;

  for (const rule of rules) {
    if (!rule) continue;

    // 1. Function predicate
    if (typeof rule === "function") {
      try {
        if (rule(origin, parsedOrigin)) return true;
      } catch {
        // Ignore custom errors and continue
      }
      continue;
    }

    // 2. Regular Expression
    if (rule instanceof RegExp) {
      if (rule.test(origin)) return true;
      continue;
    }

    // 3. String rules
    if (typeof rule === "string") {
      const trimmedRule = rule.trim();

      // Wildcard all
      if (trimmedRule === "*") return true;

      // Exact match
      if (trimmedRule === origin) return true;

      // Parse rule for protocol, host, and port
      let expectedProtocol = null;
      let hostPattern = trimmedRule;

      if (trimmedRule.includes("://")) {
        const protoEnd = trimmedRule.indexOf("://");
        expectedProtocol = trimmedRule.slice(0, protoEnd) + ":";
        hostPattern = trimmedRule.slice(protoEnd + 3);
      }

      // If protocol was explicitly declared, it must match
      if (expectedProtocol && originProtocol !== expectedProtocol) {
        continue;
      }

      // Check for port in hostPattern
      let expectedHost = hostPattern;
      let expectedPort = null;

      if (hostPattern.includes(":")) {
        const portSep = hostPattern.lastIndexOf(":");
        expectedHost = hostPattern.slice(0, portSep);
        expectedPort = hostPattern.slice(portSep + 1);
      }

      // Port matching logic
      if (expectedPort !== null && expectedPort !== "*") {
        const defaultPort = originProtocol === "https:" ? "443" : "80";
        const actualPort = originPort || defaultPort;
        if (actualPort !== expectedPort) {
          continue;
        }
      }

      // Match subdomains or apex domain
      if (expectedHost.startsWith("*.")) {
        const baseDomain = expectedHost.slice(2).toLowerCase();
        const currentHost = originHostname.toLowerCase();

        if (currentHost === baseDomain || currentHost.endsWith("." + baseDomain)) {
          return true;
        }
      } else if (expectedHost === "*") {
        return true;
      } else if (expectedHost.toLowerCase() === originHostname.toLowerCase()) {
        return true;
      }
    }
  }

  return false;
}

module.exports = {
  matchOrigin,
  default: matchOrigin,
};
