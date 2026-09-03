# Preserve Type-Guard Semantics Across Host Values

**Captured:** 2026-09-03
**Context:** Optimizing primitive guards that may run in browsers or other host environments
**Tags:** typescript, type-guards, runtime-validation, browser-compatibility, api-design

## Problem

A concise JavaScript check can accept more runtime values than its TypeScript
type predicate claims. In browsers, `document.all` has the legacy
`[[IsHTMLDDA]]` internal slot, so `document.all == null` is `true` even though
the value is neither `null` nor `undefined`. A guard implemented with loose
nullish equality therefore violates predicates such as
`value is null | undefined` and `value is NonNullable<T>`.

## Solution

Use explicit strict comparisons when the public guard promises the exact
`null | undefined` set. This keeps the direct implementation inexpensive while
preserving the previous strict semantics for browser host values. Treat runtime
membership as part of a type predicate's contract; do not replace strict checks
with a familiar shorthand unless their accepted sets are identical in every
supported environment.

## Example

```ts
export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

export const isNotNil = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined;
```

## When To Use

Apply this check when simplifying or optimizing primitive guards, especially
when changing equality operators or replacing composed predicates. Run the
standard lint, build, Jest, and `tsd` checks, and use a real browser smoke test
for `document.all`; ordinary Node objects cannot reproduce `[[IsHTMLDDA]]`.

## Related Files

- `src/core/primitive.ts`
- `tests/core/primitive.test.ts`
- `tests-d/core/primitive.test-d.ts`

## Reference

- https://tc39.es/ecma262/multipage/additional-ecmascript-features-for-web-browsers.html#sec-IsHTMLDDA-internal-slot
