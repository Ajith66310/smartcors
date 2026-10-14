import { test } from "node:test";
import assert from "node:assert";
import smartcors, { matchOrigin } from "../index.js";

function runMiddleware(middleware, reqOptions = {}) {
  return new Promise((resolve, reject) => {
    const responseHeaders = {};
    let statusCode = 200;

    const req = {
      method: reqOptions.method || "GET",
      headers: {
        ...reqOptions.headers,
        ...(reqOptions.origin ? { origin: reqOptions.origin } : {}),
      },
    };

    const res = {
      get statusCode() {
        return statusCode;
      },
      set statusCode(val) {
        statusCode = val;
      },
      getHeader(name) {
        return responseHeaders[name.toLowerCase()];
      },
      setHeader(name, value) {
        responseHeaders[name.toLowerCase()] = value;
      },
      end() {
        resolve({ req, res, responseHeaders, ended: true, statusCode });
      },
    };

    middleware(req, res, (err) => {
      if (err) return reject(err);
      resolve({ req, res, responseHeaders, ended: false, statusCode });
    });
  });
}

test("named and default exports are present", () => {
  assert.equal(typeof smartcors, "function");
  assert.equal(typeof matchOrigin, "function");
});

test("allows requests from whitelisted origin and sets CORS headers", async () => {
  const middleware = smartcors({
    allowedOrigins: ["https://example.com"],
    allowCredentials: true,
  });

  const { responseHeaders } = await runMiddleware(middleware, {
    origin: "https://example.com",
  });

  assert.equal(responseHeaders["access-control-allow-origin"], "https://example.com");
  assert.equal(responseHeaders["access-control-allow-credentials"], "true");
});

test("cleanly rejects unauthorized origin without error", async () => {
  const middleware = smartcors({
    allowedOrigins: ["https://example.com"],
  });

  const { responseHeaders } = await runMiddleware(middleware, {
    origin: "https://evil.com",
  });

  assert.equal(responseHeaders["access-control-allow-origin"], undefined);
});

test("allows non-browser requests without origin header", async () => {
  const middleware = smartcors({
    allowedOrigins: ["https://example.com"],
  });

  const { responseHeaders } = await runMiddleware(middleware, {
    origin: undefined,
  });

  assert.equal(responseHeaders["access-control-allow-origin"], undefined);
});

test("automatically whitelists localhost in development", async () => {
  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const middleware = smartcors({
    allowedOrigins: ["https://example.com"],
  });

  const { responseHeaders } = await runMiddleware(middleware, {
    origin: "http://localhost:3000",
  });

  assert.equal(responseHeaders["access-control-allow-origin"], "http://localhost:3000");
  process.env.NODE_ENV = oldEnv;
});

test("parses origins from ALLOWED_ORIGINS env variable", async () => {
  process.env.ALLOWED_ORIGINS = "https://env-app.com, https://admin.env-app.com";

  const middleware = smartcors();

  const { responseHeaders } = await runMiddleware(middleware, {
    origin: "https://admin.env-app.com",
  });

  assert.equal(responseHeaders["access-control-allow-origin"], "https://admin.env-app.com");
  delete process.env.ALLOWED_ORIGINS;
});

test("handles preflight OPTIONS request with custom headers and methods", async () => {
  const middleware = smartcors({
    allowedOrigins: ["https://example.com"],
    methods: ["GET", "POST", "CUSTOM"],
    allowedHeaders: ["Content-Type", "X-Custom-Header"],
  });

  const { responseHeaders, ended, statusCode } = await runMiddleware(middleware, {
    origin: "https://example.com",
    method: "OPTIONS",
    headers: {
      "access-control-request-method": "CUSTOM",
      "access-control-request-headers": "x-custom-header",
    },
  });

  assert.equal(ended, true);
  assert.equal(statusCode, 204);
  assert.equal(responseHeaders["access-control-allow-origin"], "https://example.com");
  assert.match(responseHeaders["access-control-allow-methods"], /CUSTOM/);
  assert.match(responseHeaders["access-control-allow-headers"], /X-Custom-Header/i);
});

test("blockWithError throws error when configured", async () => {
  const middleware = smartcors({
    allowedOrigins: ["https://example.com"],
    blockWithError: true,
  });

  await assert.rejects(
    async () => {
      await runMiddleware(middleware, { origin: "https://unauthorized.com" });
    },
    /Origin not allowed/
  );
});
