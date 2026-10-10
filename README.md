# kmp-search

Substring search using the Knuth–Morris–Pratt prefix function. Exposes `search`,
`searchAll`, and `buildPrefixFunction` from ESM source.

```js
import { search, searchAll, buildPrefixFunction } from "./src/index.js";

search("the quick brown fox", "brown");   // 10
searchAll("abababab", "abab");            // [0, 4]
buildPrefixFunction("ababaca");             // Int32Array [0,0,1,2,3,0,1]
```

## Why this exists

KMP is for the case where you are searching the same long text for a pattern
many times, or where the pattern has a lot of internal repetition that would
make a naive matcher re-scan the same characters. The trade-off is that you pay
a one-time O(m) cost to build the prefix table, and the code is more involved
than `String.prototype.indexOf`. If you only search a short string once,
`indexOf` is faster and simpler — use this when the prefix function actually
earns its keep.

## Edge cases you will hit

- An **empty pattern** is defined to match at position 0 in `search`. This is
  the standard convention but may surprise callers expecting `-1`.
- `searchAll` with an empty pattern returns `[]`, not every index, because
  returning every position in a large text would produce a huge array for no
  useful purpose. If you need overlapping matches, this library does not do
  that — `searchAll` reports non-overlapping occurrences only.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

