import { test } from "node:test";
import assert from "node:assert";
import { matchOrigin } from "../matcher.js";

test("exact match works", () => {
  assert.equal(matchOrigin("https://example.com", ["https://example.com"]), true);
  assert.equal(matchOrigin("https://other.com", ["https://example.com"]), false);
});

test("wildcard matches subdomain and apex domain", () => {
  assert.equal(matchOrigin("https://api.example.com", ["*.example.com"]), true);
  assert.equal(matchOrigin("https://nested.sub.example.com", ["*.example.com"]), true);
  assert.equal(matchOrigin("https://example.com", ["*.example.com"]), true);
  assert.equal(matchOrigin("https://notexample.com", ["*.example.com"]), false);
  assert.equal(matchOrigin("https://attacker-example.com", ["*.example.com"]), false);
});

test("wildcard with protocol enforces protocol", () => {
  assert.equal(matchOrigin("https://api.example.com", ["https://*.example.com"]), true);
  assert.equal(matchOrigin("http://api.example.com", ["https://*.example.com"]), false);
});

test("wildcard port matching", () => {
  assert.equal(matchOrigin("https://api.example.com:8080", ["https://*.example.com:8080"]), true);
  assert.equal(matchOrigin("https://api.example.com:3000", ["https://*.example.com:8080"]), false);
  assert.equal(matchOrigin("http://localhost:3000", ["http://localhost:*"]), true);
  assert.equal(matchOrigin("http://localhost:5173", ["http://localhost:*"]), true);
});

test("regex origin match", () => {
  assert.equal(matchOrigin("https://shop.mydomain.com", [/\.mydomain\.com$/]), true);
  assert.equal(matchOrigin("https://evil.com", [/\.mydomain\.com$/]), false);
});

test("function predicate origin match", () => {
  const isInternal = (origin) => origin.includes("internal");
  assert.equal(matchOrigin("https://internal.corp.com", [isInternal]), true);
  assert.equal(matchOrigin("https://public.corp.com", [isInternal]), false);
});

test("universal wildcard * matches anything", () => {
  assert.equal(matchOrigin("https://anything.com", ["*"]), true);
  assert.equal(matchOrigin("http://localhost:9999", ["*"]), true);
});

test("handles invalid inputs gracefully", () => {
  assert.equal(matchOrigin("", ["*"]), false);
  assert.equal(matchOrigin(null, ["*"]), false);
  assert.equal(matchOrigin(undefined, ["*"]), false);
  assert.equal(matchOrigin("not a valid url", ["*"]), false);
  assert.equal(matchOrigin("null", ["*"]), false);
  assert.equal(matchOrigin("null", ["null"]), true);
});

test("case insensitivity", () => {
  assert.equal(matchOrigin("https://API.Example.COM", ["*.example.com"]), true);
  assert.equal(matchOrigin("https://api.example.com", ["*.EXAMPLE.COM"]), true);
});
