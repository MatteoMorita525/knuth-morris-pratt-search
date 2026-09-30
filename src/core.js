/**
 * Compute the KMP prefix (failure) function for a pattern.
 *
 * The prefix function `pi[i]` is the length of the longest proper prefix of
 * `pattern[0..i]` that is also a suffix of `pattern[0..i]`. We store it as a
 * plain `Int32Array` rather than a normal `Array` because the values are
 * non-negative integers bounded by the pattern length, so the typed array is
 * both tighter in memory and avoids any boxing on hot lookups during search.
 *
 * The empty-pattern case is the one genuine edge here: an empty pattern is
 * conventionally defined to match at every position including the end, so we
 * return an empty array (no edges) and let `search` special-case the result.
 *
 * @param {string} pattern
 * @returns {Int32Array}
 */
export function buildPrefixFunction(pattern) {
  const n = pattern.length;
  const pi = new Int32Array(n);

  let k = 0;
  for (let i = 1; i < n; i++) {
    while (k > 0 && pattern.charCodeAt(i) !== pattern.charCodeAt(k)) {
      k = pi[k - 1];
    }
    if (pattern.charCodeAt(i) === pattern.charCodeAt(k)) {
      k++;
    }
    pi[i] = k;
  }

  return pi;
}

/**
 * Run a single KMP search and return the index of the first occurrence of
 * `pattern` in `text`, or `-1` if none exists.
 *
 * We iterate over the text once; on a mismatch the prefix function tells us
 * how far to roll the pattern pointer back without re-scanning text we have
 * already matched. `charCodeAt` is used for character access because it is
 * measurably faster than `text[i]` in the engines that run these tests, and
 * KMP's whole reason to exist is to be the fast option.
 *
 * The empty-pattern and empty-text cases are handled up front so the main
 * loop can assume `pattern.length >= 1`.
 *
 * @param {string} text
 * @param {string} pattern
 * @returns {number}
 */
export function search(text, pattern) {
  if (pattern.length === 0) {
    // An empty pattern matches at every position, including position 0.
    return 0;
  }

  if (text.length < pattern.length) {
    return -1;
  }

  const pi = buildPrefixFunction(pattern);
  let q = 0;

  for (let i = 0; i < text.length; i++) {
    while (q > 0 && text.charCodeAt(i) !== pattern.charCodeAt(q)) {
      q = pi[q - 1];
    }
    if (text.charCodeAt(i) === pattern.charCodeAt(q)) {
      q++;
    }
    if (q === pattern.length) {
      return i - pattern.length + 1;
    }
  }

  return -1;
}

/**
 * Return the starting index of every non-overlapping occurrence of `pattern`
 * in `text`, in ascending order.
 *
 * Non-overlapping is a deliberate choice: it keeps the output unambiguous and
 * is what callers like tokenisers almost always want. Overlapping matches
 * would require a different contract and a different set of tests, which we
 * do not pretend to support here.
 *
 * @param {string} text
 * @param {string} pattern
 * @returns {number[]}
 */
export function searchAll(text, pattern) {
  if (pattern.length === 0) {
    // Every position is a match; returning all of them is almost never useful
    // and can produce huge arrays for large inputs. We return an empty array
    // and document this so callers know explicitly.
    return [];
  }

  const results = [];
  const pi = buildPrefixFunction(pattern);
  const m = pattern.length;
  let q = 0;

  for (let i = 0; i < text.length; i++) {
    while (q > 0 && text.charCodeAt(i) !== pattern.charCodeAt(q)) {
      q = pi[q - 1];
    }
    if (text.charCodeAt(i) === pattern.charCodeAt(q)) {
      q++;
    }
    if (q === m) {
      const pos = i - m + 1;
      results.push(pos);
      // Reset to 0 to enforce non-overlapping matches: the next search
      // starts fresh from the character after this match.
      q = 0;
    }
  }

  return results;
}
