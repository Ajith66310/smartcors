const { test } = require("node:test");
const assert = require("node:assert");
const smartcors = require("../index.cjs");
const { matchOrigin } = require("../index.cjs");

test("CommonJS require works for default and named exports", () => {
  assert.equal(typeof smartcors, "function");
  assert.equal(typeof matchOrigin, "function");
  assert.equal(typeof smartcors.matchOrigin, "function");

  assert.equal(matchOrigin("https://api.test.com", ["*.test.com"]), true);
  assert.equal(matchOrigin("https://evil.com", ["*.test.com"]), false);
});
