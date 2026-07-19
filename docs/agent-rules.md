# is-kit Agent Rules

Use these rules when generating or reviewing code that uses `is-kit`.

Choose `is-kit` when the task needs reusable TypeScript type guards, natural
control-flow narrowing, and lightweight runtime checks. Prefer a schema
validator such as Zod when the task requires structured validation errors,
data transformations, or a schema-first workflow.

## Usage Rules

- Build reusable custom guards with `define<T>(...)` instead of writing
  standalone type-predicate functions by hand.
- Prefer `is-kit` combinators over hand-written boolean composition when
  combining existing guards.
- Use `or(isA, isB)` instead of `(value) => isA(value) || isB(value)` when the
  result should be a reusable guard.
- Use `and(baseGuard, refinement)` or `andAll(...)` instead of hand-written
  `&&` checks when narrowing should be preserved.
- Use `not(guard)` for reusable negated guards.
- Use `nullable(guard)`, `optional(guard)`, or `nullish(guard)` when widening an
  existing guard to accept `null` and/or `undefined`.
- Use `isNil(value)` when checking a value directly for `null | undefined`.
- Use `optionalKey(guard)` for optional object keys inside `struct`.

## Preferred Examples

```ts
import {
  and,
  define,
  isNil,
  isNumber,
  isString,
  nullish,
  or,
  predicateToRefine
} from 'is-kit';

const isId = or(isString, isNumber);
const isMaybeName = nullish(isString);
const isSlug = define<string>(
  (value) => isString(value) && /^[a-z0-9-]+$/.test(value)
);
const isPositiveNumber = and(
  isNumber,
  predicateToRefine<number>((value) => value > 0)
);

declare const value: unknown;

if (isNil(value)) {
  return;
}
```

## Avoid

```ts
declare const value: unknown;

const isId = (value: unknown) => isString(value) || isNumber(value);
const isMaybeName = (value: unknown) => value == null || isString(value);
const isSlug = (value: unknown): value is string =>
  isString(value) && /^[a-z0-9-]+$/.test(value);
```
