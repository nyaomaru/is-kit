# Keep Typed Schema Key Coverage Explicit

**Captured:** 2026-08-16
**Context:** Modeling a typed schema builder whose compile-time key coverage must match the keys its runtime validator can inspect.
**Tags:** typescript, type-guards, typed-struct, object-keys, runtime-validation, tsd, documentation

## Problem

A typed schema helper can appear to detect every target-type change while its
mapped type covers only a subset of `keyof T`. In `typedStruct`, the checked
shape uses `Extract<..., string>`, so numeric and symbol properties are omitted:

```ts
type TypedStructShape<T extends object> = {
  [K in Extract<RequiredObjectKeys<T>, string>]-?: Predicate<T[K]>;
};
```

As a result, a target such as `{ 0: string }` can be paired with an empty field
map. Adding a numeric or symbol property therefore does not produce the same
drift error as adding a string-keyed property. The resulting guard has no schema
entry for that target property and cannot validate it.

This is also a runtime-design concern. `struct` builds its field entries with
string-key enumeration, and exact mode follows `Object.keys(...)` semantics.
Symbol keys are outside that contract. JavaScript coerces numeric object keys to
strings at runtime, but `typedStruct` currently excludes numeric keys before a
matching field can be declared.

## Solution

Keep compile-time claims no broader than the actual type and runtime key
coverage:

- Describe current `typedStruct` drift detection as applying to string-keyed
  object shapes.
- State explicitly that numeric and symbol target properties are not required
  by `TypedStructShape` and are not validated by the resulting guard.
- Apply the qualification consistently in guides, API reference pages, public
  JSDoc, metadata, and README examples that describe drift detection.
- Keep compile-time schema-key rejection separate from runtime extra-key
  behavior. `{ exact: true }` controls extra own enumerable string keys in the
  input; it does not add target-key coverage.

Do not extend the mapped type alone. Supporting numeric keys would require an
intentional normalization between TypeScript numeric keys and JavaScript string
property keys. Supporting symbols would also require runtime enumeration and
schema representation changes, such as moving beyond `for...in` and
`Object.keys(...)` semantics.

## Example

```ts
type NumericTarget = { 0: string };

// Current limitation: the numeric target key is excluded from
// TypedStructShape<NumericTarget>, so this compiles with no field declaration.
const isNumericTarget = typedStruct<NumericTarget>()({});

isNumericTarget({});
// The guard cannot establish the target's numeric property at runtime.
```

If numeric or symbol support is added later, cover both sides of the contract:

1. Add `tsd` assertions that missing required keys fail and compatible keys are
   accepted.
2. Add runtime tests proving those keys are inspected.
3. Define how exact mode treats each key category.
4. Remove the documentation limitation only after all three behaviors agree.

## When To Use

Use this pattern when a generic builder maps over `keyof T`, especially when it
filters keys with `Extract`, key remapping, or a `string` constraint. Compare
the resulting type-level key set with the runtime enumeration primitive before
claiming exhaustive validation or drift detection.

Verify similar changes with:

```sh
pnpm lint
pnpm build
pnpm test
pnpm test:types
```

## Related Files

- `src/types/schema.ts`
- `src/core/combinators/typed-struct.ts`
- `src/core/combinators/struct.ts`
- `tests/core/combinators/typed-struct.test.ts`
- `tests-d/core/combinators/typed-struct.test-d.ts`
- `docs/app/api-reference/combinators/typed-struct/page.tsx`
- `docs/app/guides/keep-type-guards-in-sync/page.tsx`
