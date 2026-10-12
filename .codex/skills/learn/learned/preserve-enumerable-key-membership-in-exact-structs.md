# Preserve Enumerable-Key Membership in Exact Structs

**Captured:** 2026-10-12
**Context:** Optimizing exact object validation without changing the accepted inputs or evaluation order
**Tags:** typescript, type-guards, struct, runtime-validation, compatibility, benchmarking

## Problem

Required-field presence and exactness describe different sets of properties.
`Object.hasOwn` includes non-enumerable own properties, whereas `Object.keys`
includes only enumerable own string keys. Checking all required fields does
not establish that the enumerable-key count equals the schema-key count.

A valid object with a hidden required field can have fewer enumerable keys
than the schema. Adding an extra enumerable key can make those counts equal
while violating exactness. Getters or custom guards can also remove, replace,
or hide fields after earlier required fields have passed validation.

## Solution

- Preserve the existing sequence: plain-object check, required-field validation,
  optional-field validation when applicable, and enumerable-key exactness.
  A required-only path may skip validation of its empty optional-entry array.
- Treat exactness as membership in the schema-key snapshot, not count equality.
  A count larger than the number of distinct allowed keys safely proves that
  an extra enumerable key exists; a smaller or equal count does not prove
  that every key is allowed.
- A positional match with the private schema-key snapshot safely establishes
  membership without a set lookup. Check mismatching positions with the
  original allowed-key set so reordered and hidden-field inputs stay valid.
- Do not move enumeration ahead of guards or revalidate earlier required
  fields afterward. Either change can alter short-circuiting, getter/Proxy
  behavior, exceptions, or outcomes for guards with side effects.
- Check all callers of a shared builder, including required-only exact
  `typedStruct` schemas, and keep optional-schema behavior unchanged.

## Example

```ts
const guard = struct({ id: isString, age: isNumber }, { exact: true });
const input = Object.defineProperty({ age: 20 }, 'id', { value: 'abc' });

guard(input); // true: the required id is an own non-enumerable property.
Object.keys(input).length; // 1, despite two schema keys.

Object.defineProperty(input, 'extra', { value: true, enumerable: true });
Object.keys(input).length; // 2: matching counts do not prove exactness.
guard(input); // false: extra is outside the schema.
```

## When To Use

Apply this pattern when replacing key membership with cardinality checks or
specializing object-schema validation for performance. Test hidden required
fields with and without extras, reordered and numeric keys, empty schemas,
null prototypes, inherited fields, symbols, and effectful getters/guards.

For compatibility review, run the baseline and candidate on independently
constructed fixtures and compare results, exceptions, and getter/Proxy
traces. Reusing a fixture can hide differences when validation mutates it.
Check both ESM and CJS and preserve inferred types with type tests.

For performance review, measure successful and failing inputs, mixed corpora,
reordered/wide schemas, optional schemas, and non-exact controls. Repeat key
workloads in filtered fresh processes: earlier workloads can affect the JIT
profile and reverse a microbenchmark's apparent result. Report absolute cost,
speedups, regressions, and runtime-specific limits rather than promising a
universal improvement.

## Related Files

- `src/core/combinators/struct.ts`
- `src/core/combinators/typed-struct.ts`
- `tests/core/combinators/struct.test.ts`
- `tests/core/combinators/typed-struct.test.ts`
- `tests-d/core/combinators/struct.test-d.ts`
- `tests/struct-exact-compatibility.mjs`
- `bench/struct-exact.mjs`
- `bench/struct-exact-mixed.mjs`
- `bench/struct-exact-results.md`
- https://github.com/nyaomaru/is-kit/pull/341
