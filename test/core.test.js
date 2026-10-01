import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildPrefixFunction, search, searchAll } from "../src/core.js";

test("search finds a simple substring", () => {
  assert.equal(search("hello world", "world"), 6);
});

test("search returns -1 when the pattern is absent", () => {
  assert.equal(search("hello world", "xyz"), -1);
});

test("search finds a pattern at the very start", () => {
  assert.equal(search("abcdef", "abc"), 0);
});

test("search finds a pattern at the very end", () => {
  assert.equal(search("abcdef", "def"), 3);
});

test("search handles a single-character text and pattern match", () => {
  assert.equal(search("a", "a"), 0);
});

test("search returns -1 when text is shorter than pattern", () => {
  assert.equal(search("ab", "abc"), -1);
});

test("search treats an empty pattern as a match at position 0", () => {
  assert.equal(search("anything", ""), 0);
  assert.equal(search("", ""), 0);
});

test("search returns -1 for a non-empty pattern in empty text", () => {
  assert.equal(search("", "x"), -1);
});

test("search handles repeated structure in the pattern without re-scanning", () => {
  // Classic KMP case: "aaa" inside "aaaaaaaa" — a naive matcher would
  // backtrack heavily; KMP must not.
  assert.equal(search("aaaaaaaa", "aaa"), 0);
});

test("searchAll returns every non-overlapping occurrence", () => {
  assert.deepEqual(searchAll("abababab", "abab"), [0, 4]);
});

test("searchAll returns an empty array when nothing matches", () => {
  assert.deepEqual(searchAll("abcdef", "zzz"), []);
});

test("searchAll returns an empty array for an empty pattern", () => {
  assert.deepEqual(searchAll("abcdef", ""), []);
});

test("buildPrefixFunction computes the expected failure table", () => {
  // For "ababaca" the prefix function is [0,0,1,2,3,0,1].
  const pi = buildPrefixFunction("ababaca");
  assert.deepEqual(Array.from(pi), [0, 0, 1, 2, 3, 0, 1]);
});

test("buildPrefixFunction handles a pattern of all-same characters", () => {
  const pi = buildPrefixFunction("aaaa");
  assert.deepEqual(Array.from(pi), [0, 1, 2, 3]);
});

test("buildPrefixFunction returns an empty Int32Array for the empty pattern", () => {
  const pi = buildPrefixFunction("");
  assert.equal(pi.length, 0);
});
